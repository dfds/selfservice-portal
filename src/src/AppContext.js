import React, { useState, useEffect, useContext, useMemo } from "react";
import { useCurrentUser } from "./AuthService";
import * as ApiClient from "./SelfServiceApiClient";
import { useLatestNews } from "hooks/LatestNews";
import ErrorContext from "./ErrorContext";
import { useCapabilities } from "hooks/Capabilities";
import { MetricsWrapper } from "./MetricsWrapper";
import { useProfile, useStats } from "hooks/Profile";
import { useECRRepositories } from "hooks/ECRRepositories";
import { useSelector, useDispatch } from "react-redux";
import { updateMyCapabilities }  from "./redux/capabilitiesState";

const AppContext = React.createContext(null);

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), duration);
  });
}

function getValidationError(value, errorText) {
  const isValid =
    value !== undefined && value != null && value !== "" && value.length > 0;

  return isValid ? "" : errorText;
}

function isAllWithValues(data) {
  let result = true;
  data.forEach((x) => {
    if (x === undefined || x == null || x === "") {
      result = false;
    }
  });
  return result;
}

function truncateString(str, maxLength) {
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
  const dispatch = useDispatch();

  const { addCapability } = useCapabilities();
  const { createRepository, reload, repositories, isLoading } =
    useECRRepositories();
  const { profileInfo, isLoadedProfile, reload: reloadUser } = useProfile(user);
  const { statsInfo, isLoadedStats } = useStats(user);

  async function addNewCapability(
    name,
    description,
    invitations,
    jsonMetadataString,
  ) {
    addCapability(name, description, invitations, jsonMetadataString);
    await sleep(3000);
    await loadMyProfile();
    // reload();
  }

  async function addNewRepository(name, description) {
    await createRepository(name, description);
    reload();
  }

  async function loadMyProfile() {
    if (isLoadedProfile && isLoadedStats) {
      const profile = profileInfo;
      const { capabilities, autoReloadTopics } = profile;

      dispatch(updateMyCapabilities(capabilities));

      const stats = statsInfo;

      setMyCapabilities(capabilities);
      setStats(stats);
      setAppStatus((prev) => ({
        ...prev,
        ...{ hasLoadedMyCapabilities: true },
      }));
      setShouldAutoReloadTopics(autoReloadTopics);

      setMyProfile(profile);
    }
  }

  useEffect(() => {
    if (isAuthenticatedUser !== user.isAuthenticated) {
      setIsAuthenticatedUser(user.isAuthenticated);
    }
    if (user && user.isAuthenticated) {
      loadMyProfile();
    }
  }, [user, profileInfo, statsInfo]);

  useEffect(() => {
    if (user && user.isAuthenticated && myProfile) {
      selfServiceApiClient.updateMyPersonalInformation(myProfile, user);
      selfServiceApiClient.registerMyVisit(myProfile);
    }
  }, [myProfile, user]);

  function updateMetrics() {
    metricsWrapper.tryUpdateMetrics().then(() => {
      setAppStatus((prev) => ({
        ...prev,
        hasLoadedMyCapabilitiesCosts: metricsWrapper.hasLoaded(
          MetricsWrapper.CostsKey,
        ),
        hasLoadedMyCapabilitiesResourcesCounts: metricsWrapper.hasLoaded(
          MetricsWrapper.ResourceCountsKey,
        ),
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
      clearInterval(metricsInterval);
      clearInterval(costsInterval);
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
    addNewCapability,
    truncateString,
    reloadUser,
    addNewRepository,
    reload,
    repositories,
    isLoading,
    isAllWithValues,
    getValidationError,
  };

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export { AppContext as default, AppProvider };
