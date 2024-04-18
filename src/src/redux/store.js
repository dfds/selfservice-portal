import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./CounterSlice";
import  selectedCapabilityReducer  from "./capabilityState";

export default configureStore({
  reducer: {
    counter: counterReducer,
    selectedCapability: selectedCapabilityReducer,
  },
});
