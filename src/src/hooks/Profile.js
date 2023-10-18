import { useEffect, useState } from "react";
import { useSelfServiceRequest } from "./SelfServiceApi";

export function useProfile() {
    const { inProgress, responseData, setErrorOptions, sendRequest } =
        useSelfServiceRequest();
    const [isLoadedProfile, setIsLoadedProfile] = useState(false);
    const [profileInfo, setProfileInfo] = useState(null);

    useEffect(() => {
        sendRequest({
            urlSegments: ["me"],
        });
    }, []);

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
    };
}

export function useStats() {
    const { inProgress, responseData, setErrorOptions, sendRequest } =
        useSelfServiceRequest();
    const [isLoadedStats, setIsLoadedStats] = useState(false);
    const [statsInfo, setStatsInfo] = useState(null);

    useEffect(() => {
        sendRequest({
            urlSegments: ["stats"],
        });
    }, []);

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