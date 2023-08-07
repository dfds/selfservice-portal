import React, {useState, useEffect, useContext, useMemo} from "react";
import {useCurrentUser} from "./AuthService";
import * as ApiClient from "./SelfServiceApiClient";
import {useLatestNews} from "hooks/LatestNews";
import ErrorContext from "./ErrorContext";
import {useCapabilities} from "hooks/Capabilities";
import {CapabilityCostsWrapper} from "./CapabilityCostsWrapper";

const AppContext = React.createContext(null);

function sleep(duration) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), duration);
    });
}

function AppProvider({children}) {
    const user = useCurrentUser();
    const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(user.isAuthenticated);
    const [appStatus, setAppStatus] = useState({
        hasLoadedMyCapabilities: false,
        hasLoadedCosts: false,
    });

    const [topics, setTopics] = useState([]);
    const [myCapabilities, setMyCapabilities] = useState([]);

    const [stats, setStats] = useState([]);
    const news = useLatestNews();
    const [shouldAutoReloadTopics, setShouldAutoReloadTopics] = useState(true);
    const [myProfile, setMyProfile] = useState(null);
    const {handleError} = useContext(ErrorContext);
    const selfServiceApiClient = useMemo(() => new ApiClient.SelfServiceApiClient(handleError), [handleError]);
    const capabilityCosts = useMemo(() => new CapabilityCostsWrapper(selfServiceApiClient), [selfServiceApiClient]);

    const {addCapability} = useCapabilities();

    async function loadMyProfile() {
        const profile = await selfServiceApiClient.getMyPortalProfile();
        const {capabilities, autoReloadTopics} = profile;

        const stats = await selfServiceApiClient.getStats();

        setMyCapabilities(capabilities);
        setStats(stats);
        setAppStatus(prev => ({...prev, ...{hasLoadedMyCapabilities: true}}));
        setShouldAutoReloadTopics(autoReloadTopics);

        setMyProfile(profile);
    }

    async function addNewCapability(name, description) {
        addCapability(name, description);
        await sleep(3000);
        await loadMyProfile();
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
            selfServiceApiClient.updateMyPersonalInfirmation(myProfile, user);
            selfServiceApiClient.registerMyVisit(myProfile);
        }
    }, [myProfile, user]);

    useEffect(() => {
        capabilityCosts.checkForCapabilityCostsUpdate().then(loaded => {
                setAppStatus(prev => ({...prev, ...{hasLoadedCosts: loaded}}));
            }
        )
    }, []);

// ---------------------------------------------------------

    const state = {
        user,
        myProfile,
        myCapabilities,
        addNewCapability,
        appStatus,
        topics,
        setTopics,
        stats,
        news,
        shouldAutoReloadTopics,
        selfServiceApiClient,
        capabilityCosts,
    };

    return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export {AppContext as default, AppProvider}
