import React, { useState, useEffect } from "react";
import { useCurrentUser } from "./AuthService";
import { getMyPortalProfile, getCapabilities } from "./SelfServiceApiClient";

const appContext = React.createContext(null);

function AppProvider({ children }) {
  const user = useCurrentUser();
  
  const [appStatus, setAppStatus] = useState({
    hasLoadedMyCapabilities: false,
    hasLoadedOtherCapabilities: false,
  });

  const [topics, setTopics] = useState([]);
  const [myCapabilities, setMyCapabilities] = useState([]);
  const [otherCapabilities, setOtherCapabilities] = useState([]);

  async function loadMyCapabilities() {
    const { myCapabilities } = await getMyPortalProfile();
    setMyCapabilities(myCapabilities);
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
        loadMyCapabilities();
      }
  }, [user]);

  useEffect(() => {
    if (user && user.isAuthenticated) {
        loadOtherCapabilities();
      }
  }, [myCapabilities]);

  const state = {
    user,
    myCapabilities,
    otherCapabilities,
    reloadOtherCapabilities: loadOtherCapabilities,
    isCapabilitiesInitialized: (appStatus.hasLoadedMyCapabilities && appStatus.hasLoadedOtherCapabilities),
    topics,
    setTopics,
  };

  return <appContext.Provider value={state}>{children}</appContext.Provider>;
}

export { appContext as default, AppProvider }