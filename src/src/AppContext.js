import React, { useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "./AuthService";
import { getMyPortalProfile, getCapabilities, updateMyPersonalInfirmation, registerMyVisit } from "./SelfServiceApiClient";

const AppContext = React.createContext(null);

function AppProvider({ children }) {
  const user = useCurrentUser();

  const [appStatus, setAppStatus] = useState({
    hasLoadedMyCapabilities: false,
    hasLoadedOtherCapabilities: false,
  });

  const [topics, setTopics] = useState([]);
  const [myCapabilities, setMyCapabilities] = useState([]);
  const [otherCapabilities, setOtherCapabilities] = useState([]);
  const [stats, setStats] = useState([]);
  const [news, setNews] = useState([]);
  const [shouldAutoReloadTopics, setShouldAutoReloadTopics] = useState(true);
  const [myProfile, setMyProfile] = useState(null);

  async function loadMyProfile() {
    const profile = await getMyPortalProfile();
    const { capabilities, stats, autoReloadTopics } = profile;
    setMyCapabilities(capabilities);
    setStats(stats);
    setAppStatus(prev => ({...prev, ...{hasLoadedMyCapabilities: true}}));
    setShouldAutoReloadTopics(autoReloadTopics);

    setMyProfile(profile);
  }

  async function loadOtherCapabilities() {
    const allCapabilities = await getCapabilities();
    const filteredList = (allCapabilities || []).filter(x => {
        const myCap = (myCapabilities || []).find(y => y.id === x.id);
        if (myCap) {
            return false;
        } else {
            return true;
        }
    });

    setOtherCapabilities(filteredList);
    setAppStatus(prev => ({...prev, ...{hasLoadedOtherCapabilities: true}}));
  }

  const loadNews = useCallback(async () => {
    const response = await fetch("https://dfdsit.statuspage.io/history.rss");
    const rssContent = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(rssContent, 'application/xml');
    const items = doc.querySelectorAll('item');

    const newsItems = Array.from(items).map(item => {
        const title = item.querySelector('title').textContent;
        const link = item.querySelector('link').textContent;
        const text = item.querySelector('description').textContent;
        const date = item.querySelector('pubDate').textContent;
        
        return {
            id: `${date}-${title}`,
            date: Date.parse(date),
            title: title,
            text: text,
            link: link
        };
    });

    setNews(newsItems);
  });

  useEffect(() => {
    if (user && user.isAuthenticated) {
        loadMyProfile();
      }
  }, [user]);

  useEffect(() => {
    if (user && user.isAuthenticated) {
      loadOtherCapabilities();
    }
  }, [myCapabilities, user]);

  useEffect(() => {
    if (user && user.isAuthenticated && myProfile) {
      updateMyPersonalInfirmation(myProfile, user);
      registerMyVisit(myProfile);
    }
  }, [myProfile, user]);

  useEffect(() => {
    loadNews();
    const handle = setTimeout(loadNews, 1000*60*5);
    return () => { clearTimeout(handle); }
  }, []);

// ---------------------------------------------------------

  const state = {
    user,
    myProfile,
    myCapabilities,
    otherCapabilities,
    reloadOtherCapabilities: loadOtherCapabilities,
    isCapabilitiesInitialized: (appStatus.hasLoadedMyCapabilities && appStatus.hasLoadedOtherCapabilities),
    appStatus,
    topics,
    setTopics,
    stats,
    news,
    shouldAutoReloadTopics,
  };

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export { AppContext as default, AppProvider }