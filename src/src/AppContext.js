import React, { useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "./AuthService";
import { getMyPortalProfile, getCapabilities } from "./SelfServiceApiClient";

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

  async function loadMyProfile() {
    const { capabilities, stats } = await getMyPortalProfile();
    setMyCapabilities(capabilities);
    setStats(stats);
    setAppStatus(prev => ({...prev, ...{hasLoadedMyCapabilities: true}}));
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

// ---------------------------------------------------------

  const state = {
    user,
    myCapabilities,
    otherCapabilities,
    reloadOtherCapabilities: loadOtherCapabilities,
    isCapabilitiesInitialized: (appStatus.hasLoadedMyCapabilities && appStatus.hasLoadedOtherCapabilities),
    appStatus,
    topics,
    setTopics,
    stats,
  };

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export { AppContext as default, AppProvider }