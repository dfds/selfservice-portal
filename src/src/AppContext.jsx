import React, { useState, useEffect, useContext, useMemo } from "react";
import { useCurrentUser } from "./AuthService";
import * as ApiClient from "./SelfServiceApiClient";
import { useLatestNews } from "hooks/LatestNews";
import ErrorContext from "./ErrorContext";
import { useCapabilityAdd } from "@/state/remote/queries/capabilities";
import { MetricsWrapper } from "./MetricsWrapper";
import PreAppContext from "./preAppContext";
import { useSelector } from "react-redux";
import {
  useUpdateMyPersonalInformation,
  useMe,
  useRegisterMyVisit,
} from "./state/remote/queries/me";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateEcrRepository } from "./state/remote/queries/ecr";
import {
  useCreateReleaseNote,
  useToggleNoteActivity,
} from "@/state/remote/queries/releaseNotes";
import { create } from "domain";

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
  const queryClient = useQueryClient();
  const user = useCurrentUser();
  const validAuthSession = useSelector((s) => s.auth.isSessionActive);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(
    user.isAuthenticated,
  );
  const [appStatus, setAppStatus] = useState({
    hasLoadedMyCapabilities: false,
    hasLoadedMyCapabilitiesCosts: false,
    hasLoadedMyCapabilitiesResourcesCounts: false,
  });

  const [topics, setTopics] = useState([]);
  const [schemas, setSchemas] = useState([]);
  const [myProfile, setMyProfile] = useState([]);
  const [myCapabilities, setMyCapabilities] = useState([]);
  const { data: me, isFetched: isMeFetched } = useMe();
  const { isCloudEngineerEnabled } = useContext(PreAppContext);
  const [showOnlyMyCapabilities, setShowOnlyMyCapabilities] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showDeletedCapabilities, setShowDeletedCapabilities] = useState(false);

  const [stats, setStats] = useState([]);
  const news = useLatestNews();

  const [shouldAutoReloadTopics, setShouldAutoReloadTopics] = useState(false);
  const { handleError } = useContext(ErrorContext);
  const selfServiceApiClient = useMemo(
    () =>
      new ApiClient.SelfServiceApiClient(handleError, isCloudEngineerEnabled),
    [handleError, isCloudEngineerEnabled],
  );
  const metricsWrapper = useMemo(
    () => new MetricsWrapper(selfServiceApiClient),
    [selfServiceApiClient],
  );

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["me"] });
    queryClient.invalidateQueries({ queryKey: ["capabilities", "list"] });
    queryClient.invalidateQueries({ queryKey: ["selfassessments", "list"] });
  }, [selfServiceApiClient]);

  const capabilityAdd = useCapabilityAdd();
  const createEcrRepository = useCreateEcrRepository();
  const createReleaseNote = useCreateReleaseNote();
  const toggleNoteActivity = useToggleNoteActivity();
  const reloadUser = () => {
    queryClient.invalidateQueries({ queryKey: ["me"] });
  };

  const reloadSelfAssessments = (input) => {
    queryClient.invalidateQueries({ queryKey: ["selfassessments", "list"] });
  };

  useEffect(() => {
    if (me != null) {
      setMyProfile(me);
    }
  }, [isMeFetched]);

  async function addNewCapability(
    name,
    description,
    invitations,
    jsonMetadataString,
  ) {
    capabilityAdd.mutate({
      payload: {
        name: name,
        description: description,
        invitees: invitations,
        jsonMetadata: jsonMetadataString,
      },
    });
    await sleep(2000);
    queryClient.invalidateQueries({ queryKey: ["capabilities", "list"] });
    queryClient.invalidateQueries({ queryKey: ["me"] });
  }

  async function addNewRepository(data) {
    createEcrRepository.mutate(
      {
        payload: {
          name: data.name,
          description: data.description,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["ecr", "repositories"] });
        },
      },
    );
  }

  async function addNewReleaseNote(data) {
    createReleaseNote.mutate(
      {
        payload: {
          title: data.title,
          content: data.content,
          releaseDate: data.releaseDate,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["releasenotes", "list"] });
        },
      },
    );
  }

  async function toggleReleaseNoteIsActive(note) {
    var link = note._links?.toggleIsActive?.href;
    if (!link) {
      console.error("No link found for toggling release note activity.");
      return;
    }

    toggleNoteActivity.mutate(
      {
        href: link,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["releasenotes", "list"] });
        },
      },
    );
  }

  function checkIfCloudEngineer(roles) {
    const regex = /^\s*cloud\.engineer\s*$/i;
    const match = roles?.some((element) => regex.test(element.toLowerCase()));
    return match;
  }

  const updateMyPersonalInformation = useUpdateMyPersonalInformation();
  const registerMyVisit = useRegisterMyVisit();
  useEffect(() => {
    if (user && user.isAuthenticated) {
      updateMyPersonalInformation.mutate({
        user: user,
        profileDefinition: me,
      });
      registerMyVisit.mutate({
        profileDefinition: me,
      });
    }
  }, [user]);

  // ---------------------------------------------------------

  const state = {
    user,
    myProfile,
    myCapabilities,
    appStatus,
    topics,
    setTopics,
    schemas,
    setSchemas,
    stats,
    news,
    shouldAutoReloadTopics,
    setShouldAutoReloadTopics,
    selfServiceApiClient,
    metricsWrapper,
    addNewCapability,
    truncateString,
    reloadUser,
    reloadSelfAssessments,
    addNewRepository,
    addNewReleaseNote,
    toggleReleaseNoteIsActive,
    isAllWithValues,
    getValidationError,
    checkIfCloudEngineer,
    showOnlyMyCapabilities,
    setShowOnlyMyCapabilities,
    globalFilter,
    setGlobalFilter,
    showDeletedCapabilities,
    setShowDeletedCapabilities,
  };

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export { AppContext as default, AppProvider };
