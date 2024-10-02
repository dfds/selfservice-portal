import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ["payload.msalInstance"],
      },
    }),
});

export default store;
