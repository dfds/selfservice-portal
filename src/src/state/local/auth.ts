import { getGraphAccessToken, getSelfServiceAccessToken } from "@/AuthService";
import {
  AuthenticationResult,
  PublicClientApplication,
} from "@azure/msal-browser";
import { Slice, createSlice } from "@reduxjs/toolkit";

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

      if (redirectResponse?.account != null) {
        msalInstance.setActiveAccount(redirectResponse.account);
      }

      if (
        !msalInstance.getActiveAccount() &&
        msalInstance.getAllAccounts().length > 0
      ) {
        msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
      }

      if (msalInstance.getAllAccounts().length > 0) {
        state.isSignedIn = true;
        state.isSessionActive = true;
        state.initialLoadFinished = true;
        getSelfServiceAccessToken();
      } else {
        state.isSignedIn = false;
        state.isSessionActive = false;
        state.initialLoadFinished = true;
      }
    },

    sessionExpired: (state) => {
      state.isSessionActive = false;
      state.initialLoadFinished = true;
    },
  },
});

export default auth.reducer;

export const { refreshAuthState, sessionExpired } = auth.actions;
export { AuthStruct };
