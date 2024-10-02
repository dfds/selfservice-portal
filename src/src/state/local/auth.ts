import { Slice, createSlice } from "@reduxjs/toolkit";

class AuthStruct {
  isSignedIn: Boolean;
  isSessionActive: Boolean;
  throwaway: string;
}

export const auth: Slice<AuthStruct> = createSlice({
  name: "auth",
  initialState: {
    isSignedIn: false,
    isSessionActive: false,
    throwaway: "pog",
  },
  reducers: {
    refreshAuthState: (state, action) => {
      const { msalInstance } = action.payload;
      if (msalInstance.getAllAccounts().length > 0) {
        state.isSignedIn = true;
      } else {
        state.isSignedIn = false;
      }
    },
  },
});

export default auth.reducer;

export const { refreshAuthState } = auth.actions;
export { AuthStruct };
