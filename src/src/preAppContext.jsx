import React, { createContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const PreAppContext = createContext();

const CE_MODE_STORAGE_KEY = "ssu-ce-mode";

function PreAppProvider({ children }) {
  // Hydrate CE mode synchronously from localStorage so CE-gated pages (e.g.
  // release-notes/manage) render on first paint instead of waiting for the
  // /me request to resolve before the Sidebar can enable it. The Sidebar
  // effect stays authoritative and reconciles this once roles load.
  const [isCloudEngineerEnabled, setIsCloudEngineerEnabled] = useState(() => {
    try {
      return localStorage.getItem(CE_MODE_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      localStorage.setItem(CE_MODE_STORAGE_KEY, String(isCloudEngineerEnabled));
    } catch {
      /* localStorage unavailable (private mode) — non-fatal */
    }
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
