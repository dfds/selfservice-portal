import { useEffect, useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import {
  CacheLookupPolicy,
  InteractionRequiredAuthError,
} from "@azure/msal-browser";
import { getUserProfile, getUserProfilePictureUrl } from "./GraphApiClient";
import {
  msalInstance,
  selfServiceApiScopes,
  graphScopes,
  tokenCache,
} from "./auth/context";
import store from "./state/local/store";
import { refreshAuthState, sessionExpired } from "./state/local/auth";

export function callApi(
  url,
  accessToken,
  method = "GET",
  payload = null,
  isCloudEngineerEnabled = false,
) {
  const headers = new Headers();

  const bearer = `Bearer ${accessToken}`;
  headers.append("Authorization", bearer);

  if (!isCloudEngineerEnabled) {
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

export function callApiMultipart(
  url,
  accessToken,
  formData,
  isCloudEngineerEnabled = false,
) {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${accessToken}`);

  if (!isCloudEngineerEnabled) {
    headers.append("x-selfservice-permissions", "1");
  }

  // Content-Type is intentionally omitted so the browser sets the multipart boundary.
  return fetch(url, {
    method: "POST",
    headers,
    mode: "cors",
    body: formData,
  });
}

// Skips MSAL's hidden-iframe renewal once the refresh token has expired, so the
// call fails at once with InteractionRequiredAuthError. The iframe cannot
// succeed here: build.dfds.cloud is behind ALB authenticate-oidc, which
// redirects the iframe to its own Entra login (X-Frame-Options: DENY), and
// Safari sends no Entra session cookie to the iframe (AADSTS160021). Each
// attempt ended in monitor_window_timeout after 10 s.
const SILENT_POLICY = CacheLookupPolicy.AccessTokenAndRefreshToken;

let selfServiceTokenInFlight = null;

export async function getSelfServiceAccessToken() {
  if (selfServiceTokenInFlight) {
    return selfServiceTokenInFlight;
  }

  const account = msalInstance.getActiveAccount();
  if (!account) {
    store.dispatch(sessionExpired());
    return null;
  }

  selfServiceTokenInFlight = (async () => {
    try {
      const { accessToken } = await msalInstance.acquireTokenSilent({
        scopes: selfServiceApiScopes,
        account: account,
        cacheLookupPolicy: SILENT_POLICY,
      });
      tokenCache.put("selfservice-api", accessToken);
      store.dispatch(refreshAuthState({ msalInstance: msalInstance }));
      return accessToken;
    } catch (e) {
      console.log("getSelfServiceAccessToken failed:", e);
      tokenCache.remove("selfservice-api");

      // AuthTemplate renders nothing until the first token settles auth state,
      // so before a session is active any error (BrowserAuthError, network
      // failure) has to fall through to the sign-in screen.
      if (
        e instanceof InteractionRequiredAuthError ||
        !store.getState().auth.isSessionActive
      ) {
        store.dispatch(sessionExpired());
      }
      return null;
    } finally {
      selfServiceTokenInFlight = null;
    }
  })();

  return selfServiceTokenInFlight;
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
      cacheLookupPolicy: SILENT_POLICY,
    });
    tokenCache.put("msgraph", accessToken);
    store.dispatch(refreshAuthState({ msalInstance: msalInstance }));

    return accessToken;
  } catch (e) {
    console.log("getGraphAccessToken silent acquisition failed:", e);
    tokenCache.remove("msgraph");
    return null;
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
