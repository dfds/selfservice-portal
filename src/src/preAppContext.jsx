import React, { createContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const PreAppContext = createContext();

function PreAppProvider({ children }) {
  const [isCloudEngineerEnabled, setIsCloudEngineerEnabled] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries();
  }, [isCloudEngineerEnabled]);

  return (
    <PreAppContext.Provider
      value={{ isCloudEngineerEnabled, setIsCloudEngineerEnabled }}
    >
      {children}
    </PreAppContext.Provider>
  );
}

export { PreAppContext as default, PreAppProvider };
