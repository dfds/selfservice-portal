import React, { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import { callMsGraph2 } from "./graph";

import { useIsAuthenticated, useMsalAuthentication } from "@azure/msal-react";
import { InteractionType } from '@azure/msal-browser';

const appContext = React.createContext(null);

function AppProvider({ children }) {

  useMsalAuthentication(InteractionType.Redirect, loginRequest);
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@jdog.com",
    title: "duno",
    profilePictureUrl: "https://placeimg.com/640/480/people"
  });

  useEffect(() => {
    const currentAccount = accounts[0];

    if (isAuthenticated && currentAccount) {

      async function getUserInfo() {
        const { accessToken } = await instance.acquireTokenSilent({ ...loginRequest, account: currentAccount });
        const response1 = await callMsGraph2("https://graph.microsoft.com/v1.0/me", accessToken);
        const profile = await response1.json();

        setUser(prev => {
          const copy = {...prev};
          copy.name = profile.displayName;
          copy.email = profile.mail;
          copy.upn = profile.userPrincipalName;
          copy.title = profile.jobTitle;

          return copy;
        });

        const response2 = await callMsGraph2("https://graph.microsoft.com/v1.0/me/photos/48x48/$value", accessToken);
        const blob = await response2.blob()

        const url = window.URL || window.webkitURL;
        const blobUrl = url.createObjectURL(blob);
        
        setUser(prev => {
          const copy = {...prev};
          copy.profilePictureUrl = blobUrl;

          return copy;
        });
      }

      getUserInfo();
    }
  }, [isAuthenticated, instance, accounts]);

  const [capabilities, setCapabilities] = useState([
    { id: "1", capabilityRootId: "this-is-a-capability", name: "this is a capability", description: "lksd lskd flskdnf lskerntolweirhtn lis dflk slkdmf"},
    { id: "2", capabilityRootId: "another-awssome-capability", name: "another awssome capability", description: "lknm lk23lnk nl kl23lk lk"},
  ]);

  const [topics, setTopics] = useState([]);

  const state = {
    user,
    setUser,
    capabilities,
    setCapabilities,
    topics,
    setTopics,
  };

  return <appContext.Provider value={state}>{children}</appContext.Provider>;
}

export { appContext as default, AppProvider }