import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";
import { useSelector } from "react-redux";

export function useProfile(user) {
  const { responseData, sendRequest } = useSelfServiceRequest();
  const [isLoadedProfile, setIsLoadedProfile] = useState(false);
  const [profileInfo, setProfileInfo] = useState(null);
  const [triggerReload, setTriggerReload] = useState(false);
  const validAuthSession = useSelector((s) => s.auth.isSessionActive);

  const reload = () => {
    setTriggerReload(!triggerReload);
  };

  useEffect(() => {
    if (validAuthSession) {
      sendRequest({
        urlSegments: ["me"],
      });
    }
  }, [user, triggerReload, validAuthSession]);

  useEffect(() => {
    if (responseData !== null) {
      setProfileInfo(responseData);
    }
  }, [responseData]);

  useEffect(() => {
    if (profileInfo !== null) {
      setIsLoadedProfile(true);
    }
  }, [profileInfo]);

  return {
    isLoadedProfile,
    profileInfo,
    reload,
  };
}

export function useStats(user) {
  const { responseData, sendRequest } = useSelfServiceRequest();
  const [isLoadedStats, setIsLoadedStats] = useState(false);
  const [statsInfo, setStatsInfo] = useState(null);
  const validAuthSession = useSelector((s) => s.auth.isSessionActive);

  useEffect(() => {
    if (validAuthSession) {
      sendRequest({
        urlSegments: ["stats"],
      });
    }
  }, [user, validAuthSession]);

  useEffect(() => {
    if (responseData !== null) {
      setStatsInfo(responseData);
    }
  }, [responseData]);

  useEffect(() => {
    if (statsInfo !== null) {
      setIsLoadedStats(true);
    }
  }, [statsInfo]);

  return {
    isLoadedStats,
    statsInfo,
  };
}

export function useTopVisitors(myProfileDefinition) {
  const { responseData, sendRequest } = useSelfServiceRequest();
  const [isLoadedVisitors, setIsLoadedVisitors] = useState(false);
  const [visitorsInfo, setVisitorsInfo] = useState(null);

  const visitorsLink = myProfileDefinition?._links?.topVisitors;

  useEffect(() => {
    if (visitorsLink) {
      sendRequest({
        urlSegments: [visitorsLink.href],
      });
    }
  }, [visitorsLink]);

  useEffect(() => {
    if (responseData?.items.length >= 0) {
      setVisitorsInfo(responseData?.items || []);
    }
  }, [responseData]);

  useEffect(() => {
    if (visitorsInfo) {
      if (visitorsInfo.length !== 0) {
        setIsLoadedVisitors(true);
      }
    }
  }, [visitorsInfo]);

  return {
    isLoadedVisitors,
    visitorsInfo,
  };
}
