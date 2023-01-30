import React, { useState, useEffect } from "react";
import { useCurrentUser } from "./AuthService";
import { getMyPortalProfile, getCapabilities } from "./SelfServiceApiClient";

const appContext = React.createContext(null);

function AppProvider({ children }) {
  const user = useCurrentUser();
  
  const [topics, setTopics] = useState([]);
  const [myCapabilities, setMyCapabilities] = useState([]);
  const [otherCapabilities, setOtherCapabilities] = useState([]);

  async function loadMyCapabilities() {
    const { myCapabilities } = await getMyPortalProfile();
    setMyCapabilities(myCapabilities);
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
    topics,
    setTopics,
  };

  return <appContext.Provider value={state}>{children}</appContext.Provider>;
}

export { appContext as default, AppProvider }