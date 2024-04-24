import { createSlice } from "@reduxjs/toolkit";

export const capabilities = createSlice({
    name: "capabilities",
    initialState: {
      myCapabilities: [],
    },
    reducers: {
      updateMyCapabilities: (state, action) => {
        state.myCapabilities = action.payload;
      },
    },
  });
  
  // Action creators are generated for each case reducer function
  export const { updateMyCapabilities } = capabilities.actions;
  
  export default capabilities.reducer;