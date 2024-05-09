import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./CounterSlice";
import  selectedCapabilityReducer  from "./capabilityState";
import capabilitiesReducer from "./capabilitiesState"
import kafkaCounterReducer from "./kafkaCounter";

export default configureStore({
  reducer: {
    counter: counterReducer,
    selectedCapability: selectedCapabilityReducer,
    capabilities: capabilitiesReducer,
    kafkaCounter: kafkaCounterReducer,
  },
});
