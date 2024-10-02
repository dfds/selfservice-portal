import { useEffect, useState } from "react";
import {
  useMsal,
  useIsAuthenticated,
} from "@azure/msal-react";
import { getUserProfile, getUserProfilePictureUrl } from "./GraphApiClient";
import {
  msalInstance,
  selfServiceApiScopes,
  graphScopes,
} from "./auth/context";

export function callApi(
  url,
  accessToken,
  method = "GET",
  payload = null,
  isEnabledCloudEngineer = false,
) {
  const headers = new Headers();

  const bearer = `Bearer ${accessToken}`;
  headers.append("Authorization", bearer);

  if (!isEnabledCloudEngineer) {
    headers.append("x-selfservice-permissions", "1");
  }

  const options = {
    method: method,
    headers: headers,
    mode: "cors",
  };

  if (["POST", "PUT", "PATCH"].includes(method.toUpperCase()) && payload) {
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

  const { accessToken } = await msalInstance.acquireTokenSilent({
    scopes: selfServiceApiScopes,
    account: account,
  });
  return accessToken;
}

export async function getGraphAccessToken() {
  const account = msalInstance.getActiveAccount();
  if (!account) {
    return null;
  }

  const { accessToken } = await msalInstance.acquireTokenSilent({
    scopes: graphScopes,
    account: account,
  });
  return accessToken;
}

export function useCurrentUser() {
  const { accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState({ isAuthenticated: false });

  useEffect(() => {
    const currentAccount = accounts && accounts.length > 0 ? accounts[0] : null;

    if (isAuthenticated && currentAccount) {
      msalInstance.setActiveAccount(currentAccount);
      // setUser(prev => ({...prev, ...{isAuthenticated: true}}));

      async function getUserInfo() {
        const profile = await getUserProfile();
        //setUser(prev => ({...prev, ...profile, ...{isAuthenticated: true}}));

        const profilePictureUrl = await getUserProfilePictureUrl();
        setUser((prev) => ({
          ...prev,
          ...profile,
          ...{ profilePictureUrl: profilePictureUrl, isAuthenticated: true },
          ...{ roles: currentAccount.idTokenClaims.roles },
        }));
      }

      getUserInfo();
    }
  }, [accounts, isAuthenticated]);

  return user;
}
