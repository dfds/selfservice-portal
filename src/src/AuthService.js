import { useEffect, useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { getUserProfile, getUserProfilePictureUrl } from "./GraphApiClient";
import {
  msalInstance,
  selfServiceApiScopes,
  graphScopes,
  tokenCache,
} from "./auth/context";
import store from "./state/local/store";
import { refreshAuthState } from "./state/local/auth";

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

  try {
    const { accessToken } = await msalInstance.acquireTokenSilent({
      scopes: selfServiceApiScopes,
      account: account,
    });
    tokenCache.put("selfservice-api", accessToken);
    store.dispatch(refreshAuthState({ msalInstance: msalInstance }));

    return accessToken;
  } catch (e) {
    console.log(e);
    await msalInstance.acquireTokenRedirect({
      scopes: selfServiceApiScopes,
      account: account,
    });
  }
}

export async function getGraphAccessToken() {
  const account = msalInstance.getActiveAccount();
  if (!account) {
    return null;
  }

  try {
    const { accessToken } = await msalInstance.acquireTokenSilent({
      scopes: graphScopes,
      account: account,
    });
    tokenCache.put("msgraph", accessToken);
    store.dispatch(refreshAuthState({ msalInstance: msalInstance }));

    return accessToken;
  } catch (e) {
    console.log(e);
    await msalInstance.acquireTokenRedirect({
      scopes: graphScopes,
      account: account,
    });
  }
}

export function useCurrentUser() {
  const { accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState({ isAuthenticated: false });

  useEffect(() => {
    const currentAccount = accounts && accounts.length > 0 ? accounts[0] : null;

    if (isAuthenticated && currentAccount) {
      async function getUserInfo() {
        const profile = await getUserProfile();

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
