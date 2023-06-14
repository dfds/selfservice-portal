import React, { useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "./AuthService";
import * as ApiClient from "./SelfServiceApiClient";
import { useLatestNews } from "hooks/LatestNews";

const AppContext = React.createContext(null);

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

function AppProvider({ children }) {
  const user = useCurrentUser();
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(user.isAuthenticated);
  const [appStatus, setAppStatus] = useState({
    hasLoadedMyCapabilities: false,
    hasLoadedOtherCapabilities: false,
  });

  const [topics, setTopics] = useState([]);
  const [myCapabilities, setMyCapabilities] = useState([]);
  const [otherCapabilities, setOtherCapabilities] = useState([]);
  const [stats, setStats] = useState([]);
  const news = useLatestNews();
  const [shouldAutoReloadTopics, setShouldAutoReloadTopics] = useState(true);
  const [myProfile, setMyProfile] = useState(null);

  async function loadMyProfile() {
    const profile = await ApiClient.getMyPortalProfile();
    const { capabilities, stats, autoReloadTopics } = profile;
    setMyCapabilities(capabilities);
    setStats(stats);
    setAppStatus(prev => ({...prev, ...{hasLoadedMyCapabilities: true}}));
    setShouldAutoReloadTopics(autoReloadTopics);

    setMyProfile(profile);
  }

  async function loadOtherCapabilities() {
    const allCapabilities = await ApiClient.getCapabilities();
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

  async function addNewCapability(name, description) {
    await ApiClient.createCapability({name, description});
    await sleep(3000);
    await loadMyProfile();
  }

  useEffect(() => {
    if(isAuthenticatedUser !== user.isAuthenticated) {
      setIsAuthenticatedUser(user.isAuthenticated);
    }
    if (user && user.isAuthenticated) {
        loadMyProfile();
      }
  }, [user]);

  useEffect(() => {
    if (user && user.isAuthenticated) {
      loadOtherCapabilities();
    }
  }, [isAuthenticatedUser]);
  

  useEffect(() => {
    if (user && user.isAuthenticated && myProfile) {
      ApiClient.updateMyPersonalInfirmation(myProfile, user);
      ApiClient.registerMyVisit(myProfile);
    }
  }, [myProfile, user]);

// ---------------------------------------------------------

  const state = {
    user,
    myProfile,
    myCapabilities,
    otherCapabilities,
    reloadOtherCapabilities: loadOtherCapabilities,
    addNewCapability,
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
