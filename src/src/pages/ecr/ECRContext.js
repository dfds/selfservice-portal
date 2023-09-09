import React, { createContext, useEffect, useState } from "react";
import * as repositoriesApiClient from "./dummyClient";
import { add, set } from "date-fns";

const ECRContext = createContext();

function ECRProvider({ children }) {
  //const { repositoriesClient } = useContext(AppContext);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [showNewRepositoryDialog, setShowNewRepositoryDialog] = useState(false);
  const [isCreatingNewRepository, setIsCreatingNewRepository] = useState(false);
  const [pollForUpdates, setPollForUpdates] = useState(true);
  
  const fetchRepositories = async () => {
    const result = await repositoriesApiClient.getRepositories();
    let stopPolling = true;
    result.forEach((repo) => {
      if (repo.status === "pending") {
        stopPolling = false;
      }
    });
    console.log("Continue polling: " + !stopPolling);
    setPollForUpdates(!stopPolling);
    console.log("Setting repositories to: " + result.length + " items.");
    console.log(result);
    setRepositories(result);
  };

  const addRepository = async (repository) => {
    await repositoriesApiClient.addRepository(repository);
  }

  const toggleSelectedRepository = (repositoryId) => {
    setSelectedRepository((prev) => {
      if (prev === repositoryId) {
        return null;
      }
      return repositoryId;
    });
  };

  const state = {
    repositories,
    selectedRepository,
    toggleSelectedRepository,
    addRepository,
    showNewRepositoryDialog,
    setShowNewRepositoryDialog,
    isCreatingNewRepository,
    setIsCreatingNewRepository,
    setPollForUpdates
  };

  /*useEffect(() => {
    fetchRepositories();
  }, []);*/

  useEffect(() => {
    if (pollForUpdates) {
        const interval = setInterval(() => {
            console.log("Polling...")
            fetchRepositories()
        }, 2000);
        return () => clearInterval(interval);
    }
  }, [pollForUpdates]);

  return (
    <ECRContext.Provider value={state}>{children}</ECRContext.Provider>
  );
}

export { ECRContext as default, ECRProvider };
