import { getGraphAccessToken, getSelfServiceAccessToken } from "@/AuthService";
import { allTokensAvailable, tokenCache } from "@/auth/context";
import {
  AuthenticationResult,
  PublicClientApplication,
} from "@azure/msal-browser";
import { Slice, createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

class AuthStruct {
  isSignedIn: boolean;
  isSessionActive: boolean;
  initialLoadFinished: boolean;
  throwaway: string;
}

class RefreshAuthAction {
  msalInstance: PublicClientApplication;
  redirectResponse: AuthenticationResult;
}

export const auth: Slice<AuthStruct> = createSlice({
  name: "auth",
  initialState: {
    isSignedIn: false as boolean,
    isSessionActive: false as boolean,
    initialLoadFinished: false as boolean,
    throwaway: "pog",
  },
  reducers: {
    refreshAuthState: (state, action) => {
      const { msalInstance, redirectResponse } =
        action.payload as RefreshAuthAction;

      if (redirectResponse != null) {
        if (redirectResponse.account != null) {
          msalInstance.setActiveAccount(redirectResponse.account);
          const decoded = jwtDecode(redirectResponse.accessToken);
          if (decoded.aud === "00000003-0000-0000-c000-000000000000") {
            tokenCache.put("msgraph", redirectResponse.accessToken);
          } else {
            tokenCache.put("selfservice-api", redirectResponse.accessToken);
          }
        }
      }

      if (msalInstance.getAllAccounts().length > 0) {
        state.isSignedIn = true;

        if (allTokensAvailable()) {
          state.isSessionActive = true;
        } else {
          console.log("Tokens missing, acquiring");
          if (!tokenCache.hasTokenExpired("msgraph")) {
            getSelfServiceAccessToken();
          }

          if (!tokenCache.hasTokenExpired("selfservice-api")) {
            getGraphAccessToken();
          }
        }
      } else {
        state.isSignedIn = false;
        state.isSessionActive = false;
      }

      state.initialLoadFinished = true;
    },
  },
});

function isTokenExpired(token: string): boolean {
  const decoded = jwtDecode(token);
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp > currentTime;
}

export default auth.reducer;

export const { refreshAuthState } = auth.actions;
export { AuthStruct };
