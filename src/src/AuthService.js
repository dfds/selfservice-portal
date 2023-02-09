import { useEffect, useState } from "react";
import { useMsal, useMsalAuthentication, useIsAuthenticated } from "@azure/msal-react";
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { getUserProfile, getUserProfilePictureUrl } from "./GraphApiClient";

const graphScopes = ["user.read"];
const selfServiceApiScopes = ["api://3007f683-c3c2-4bf9-b6bd-2af03fb94f6d/access_as_user"];

const msalInstance = new PublicClientApplication({
    auth: {
        clientId: "3007f683-c3c2-4bf9-b6bd-2af03fb94f6d",
        authority: "https://login.microsoftonline.com/73a99466-ad05-4221-9f90-e7142aa2f6c1",
        redirectUri: process.env.REACT_APP_AUTH_REDIRECT_URL
    },
    cache: {
        cacheLocation: "localStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
});

export  { msalInstance as MsalInstance };

export function callApi(url, accessToken, method = "GET", payload = null) {
    const headers = new Headers();

    const bearer = `Bearer ${accessToken}`;
    headers.append("Authorization", bearer);

    const options = {
        method: method,
        headers: headers,
        mode: "cors"
    };

    if (method.toUpperCase() === "POST" && payload) {
        options.body = JSON.stringify(payload);
        options.headers.append("Content-Type", "application/json");
    }

    return fetch(url, options);
}

export async function getSelfServiceAccessToken() {
    const account = msalInstance.getActiveAccount();
    if (!account) {
        return null;
    }

    const { accessToken } = await msalInstance.acquireTokenSilent({ scopes: selfServiceApiScopes , account: account });
    return accessToken;
}

export async function getGraphAccessToken() {
    const account = msalInstance.getActiveAccount();
    if (!account) {
        return null;
    }

    const { accessToken } = await msalInstance.acquireTokenSilent({ scopes: graphScopes , account: account });
    return accessToken;
}

export function useCurrentUser() {
    useMsalAuthentication(InteractionType.Redirect, { scopes: graphScopes });
    
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [user, setUser] = useState({ isAuthenticated: false });

    useEffect(() => {
        const currentAccount = accounts && accounts.length > 0 
            ? accounts[0] 
            : null;

        if (isAuthenticated && currentAccount) {
            msalInstance.setActiveAccount(currentAccount);
            setUser(prev => ({...prev, ...{isAuthenticated: true}}));

            async function getUserInfo() {
                const profile = await getUserProfile();
                setUser(prev => ({...prev, ...profile}));

                const profilePictureUrl = await getUserProfilePictureUrl();
                setUser(prev => ({...prev, ...{profilePictureUrl: profilePictureUrl}}));
            }
            getUserInfo();
        }
    
    }, [instance, accounts, isAuthenticated]);

    return user;
}