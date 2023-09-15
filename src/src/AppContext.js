import React, { useState, useEffect, useContext, useMemo } from "react";
import { useCurrentUser } from "./AuthService";
import * as ApiClient from "./SelfServiceApiClient";
import { useLatestNews } from "hooks/LatestNews";
import ErrorContext from "./ErrorContext";
import { useCapabilities } from "hooks/Capabilities";
import { MetricsWrapper } from "./MetricsWrapper";

const AppContext = React.createContext(null);

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

function truncateString(str) {
  const maxLength = 70;
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + "...";
  } else {
    return str;
  }
}

function AppProvider({ children }) {
  const user = useCurrentUser();
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(
    user.isAuthenticated,
  );
  const [appStatus, setAppStatus] = useState({
    hasLoadedMyCapabilities: false,
    hasLoadedMyCapabilitiesCosts: false,
    hasLoadedMyCapabilitiesResourcesCounts: false,
  });

  const [topics, setTopics] = useState([]);
  const [myCapabilities, setMyCapabilities] = useState([]);

  const [stats, setStats] = useState([]);
  const news = useLatestNews();

  const [shouldAutoReloadTopics, setShouldAutoReloadTopics] = useState(false);
  const [myProfile, setMyProfile] = useState(null);
  const { handleError } = useContext(ErrorContext);
  const selfServiceApiClient = useMemo(
    () => new ApiClient.SelfServiceApiClient(handleError),
    [handleError],
  );
  const metricsWrapper = useMemo(
    () => new MetricsWrapper(selfServiceApiClient),
    [selfServiceApiClient],
  );

  const { addCapability } = useCapabilities();

  async function addNewCapability(name, description) {
    addCapability(name, description);
    await sleep(3000);
    await loadMyProfile();
  }

  async function loadMyProfile() {
    const profile = await selfServiceApiClient.getMyPortalProfile();
    const { capabilities, autoReloadTopics } = profile;

    const stats = await selfServiceApiClient.getStats();

    setMyCapabilities(capabilities);
    setStats(stats);
    setAppStatus((prev) => ({ ...prev, ...{ hasLoadedMyCapabilities: true } }));
    setShouldAutoReloadTopics(autoReloadTopics);

    setMyProfile(profile);
  }

  useEffect(() => {
    if (isAuthenticatedUser !== user.isAuthenticated) {
      setIsAuthenticatedUser(user.isAuthenticated);
    }
    if (user && user.isAuthenticated) {
      loadMyProfile();
    }
  }, [user]);

  useEffect(() => {
    if (user && user.isAuthenticated && myProfile) {
      selfServiceApiClient.updateMyPersonalInformation(myProfile, user);
      selfServiceApiClient.registerMyVisit(myProfile);
    }
  }, [myProfile, user]);

  function updateMetrics() {
    metricsWrapper.tryUpdateMetrics().then(() => {
      setAppStatus(prev => ({
        ...prev,
        hasLoadedMyCapabilitiesCosts: metricsWrapper.hasLoaded(MetricsWrapper.CostsKey),
        hasLoadedMyCapabilitiesResourcesCounts: metricsWrapper.hasLoaded(MetricsWrapper.ResourceCountsKey)
      }));
    });
  }

  function updateResourcesCount() {
    setAppStatus((prev) => ({ ...prev, ...{ hasLoadedResources: true } }));
  }

  useEffect(() => {
    updateMetrics();
    updateResourcesCount();
  }, [myCapabilities]);

  useEffect(() => {
    const metricsInterval = setInterval(() => {
      updateMetrics();
    }, 1000 * 60);
    const costsInterval = setInterval(() => {
      updateResourcesCount();
    }, 1000 * 60);
    return () => {
      clearInterval(metricsInterval)
      clearInterval(costsInterval)
    };
  }, []);

  // ---------------------------------------------------------

  const state = {
    user,
    myProfile,
    myCapabilities,
    appStatus,
    topics,
    setTopics,
    stats,
    news,
    shouldAutoReloadTopics,
    setShouldAutoReloadTopics,
    selfServiceApiClient,
    metricsWrapper,
    addCapability,
    getCapabilityJsonMetadataSchema: selfServiceApiClient.getCapabilityJsonMetadataSchema,
    addNewCapability,
    truncateString,
  };

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export { AppContext as default, AppProvider };
