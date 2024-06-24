import React, { createContext, useState } from "react";

const PreAppContext = createContext();

function PreAppProvider({ children }) {
  const [falseUserPermissions, setFalseUserPermissions] = useState(true);

  return (
    <PreAppContext.Provider
      value={{ falseUserPermissions, setFalseUserPermissions }}
    >
      {children}
    </PreAppContext.Provider>
  );
}

export { PreAppContext as default, PreAppProvider };
