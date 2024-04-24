import { createSlice } from "@reduxjs/toolkit";

export const capabilities = createSlice({
    name: "capabilities",
    initialState: {
      myCapabilities: [],
      otherCapabilities: [],
    },
    reducers: {
      updateMyCapabilities: (state, action) => {
        state.myCapabilities = action.payload;
      },
      updateOtherCapabilities: (state, action) => {
        state.otherCapabilities = action.payload;
      }
    },
  });
  
  // Action creators are generated for each case reducer function
  export const { updateMyCapabilities, updateOtherCapabilities } = capabilities.actions;
  
  export default capabilities.reducer;