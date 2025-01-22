import React, { createContext, useEffect, useState } from "react";

const PreAppContext = createContext();

function PreAppProvider({ children }) {
  const [isCloudEngineerEnabled, setIsCloudEngineerEnabled] = useState(false);

  return (
    <PreAppContext.Provider
      value={{ isCloudEngineerEnabled, setIsCloudEngineerEnabled }}
    >
      {children}
    </PreAppContext.Provider>
  );
}

export { PreAppContext as default, PreAppProvider };
