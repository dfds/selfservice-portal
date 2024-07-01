import React, { createContext, useState } from "react";

const PreAppContext = createContext();

function PreAppProvider({ children }) {
  const [isEnabledCloudEngineer, setIsEnabledCloudEngineer] = useState(true);

  return (
    <PreAppContext.Provider
      value={{ isEnabledCloudEngineer, setIsEnabledCloudEngineer }}
    >
      {children}
    </PreAppContext.Provider>
  );
}

export { PreAppContext as default, PreAppProvider };
