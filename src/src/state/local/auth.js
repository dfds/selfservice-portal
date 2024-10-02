import { createSlice } from "@reduxjs/toolkit";

export const auth = createSlice({
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
