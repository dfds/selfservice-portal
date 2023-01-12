import React, { useState, useEffect } from "react";
const appContext = React.createContext(null);

function AppProvider({ children }) {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@jdog.com",
    profilePictureUrl: "https://placeimg.com/640/480/people"
  });

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

export { appContext as default, AppProvider };
