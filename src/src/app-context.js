import React, { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import { callMsGraph, callMsGraph2 } from "./graph";

import { useIsAuthenticated, useMsalAuthentication } from "@azure/msal-react";
import { InteractionType } from '@azure/msal-browser';

const appContext = React.createContext(null);

function AppProvider({ children }) {

  const { login, result, error } = useMsalAuthentication(InteractionType.Redirect, loginRequest);
  const { instance, accounts } = useMsal();
  const [ graphData, setGraphData ] = useState(null);

  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@jdog.com",
    profilePictureUrl: "https://placeimg.com/640/480/people"
  });

  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const name = accounts[0] && accounts[0].name;
    if (name) {
      setUser(prev => {
        const copy = {...prev};
        return {...copy, ...{
          name: name
        }};
      });
    }
  }, [accounts]);


  useEffect(() => {
    const request = {
      ...loginRequest,
      account: accounts[0]
    };

    if (!isAuthenticated) {
      return;
    }

    instance
      .acquireTokenSilent(request)
      .then((response) => {
        console.log("access token: ", response.accessToken);
        callMsGraph(response.accessToken)
          .then(response => {
            setGraphData(response);
            console.log("graph data: ", response);
            console.log("accounts: ", accounts);
          });
      });
  }, [isAuthenticated]);



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