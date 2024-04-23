import { createSlice } from "@reduxjs/toolkit";

export const selectedCapability = createSlice({
    name: "selectedCapability",
    initialState: {
      members: [],
      topics: [],
      selectedTopic: [],
      id: null,
      details: {},
    },
    reducers: {
      updateMembers: (state, action) => {
        state.members = action.payload;

      },
      updateTopics: (state, action) => {
        state.topics = action.payload
      },
      updateSelectedTopic: (state, action) => {
        state.selectedTopic = action.payload
      },
      updateCapabilityId: (state, action) => {
        state.id = action.payload;
      },
      updateDetails: (state, action) => {
        state.details = action.payload;
      }
    },
  });
  
  // Action creators are generated for each case reducer function
  export const { updateMembers, updateTopics, updateSelectedTopic, updateCapabilityId, updateDetails } = selectedCapability.actions;
  
  export default selectedCapability.reducer;