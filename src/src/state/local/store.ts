import { configureStore } from "@reduxjs/toolkit";
import authReducer, { AuthStruct } from "./auth";

export class StoreReducers {
  auth: AuthStruct;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: [
          "payload.msalInstance",
          "payload.redirectResponse",
        ],
      },
    }),
});

export default store;

export { store };
