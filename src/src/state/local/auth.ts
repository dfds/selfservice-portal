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
      if (msalInstance.getAllAccounts().length > 0) {
        state.isSignedIn = true;

        if (redirectResponse != null) {
          if (redirectResponse.account != null) {
            msalInstance.setActiveAccount(redirectResponse.account);
            state.isSessionActive = true;
          }
        }

        let activeAccount = msalInstance.getActiveAccount();
        if (activeAccount != null) {
          state.isSessionActive = isTokenExpired(activeAccount.idToken);
        }
      } else {
        state.isSignedIn = false;
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
