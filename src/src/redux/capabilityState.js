import { createSlice } from "@reduxjs/toolkit";

export const selectedCapability = createSlice({
    name: "selectedCapability",
    initialState: {
      members: [],
      topics: [],
      selectedTopic: [],
    },
    reducers: {
      updateMembers: (state, action) => {
        state.members = action.payload;

      },
      updateTopics: (state, action) => {
        state.topics = action.payload
      },

      increment: (state) => {
        // Redux Toolkit allows us to write "mutating" logic in reducers. It
        // doesn't actually mutate the state because it uses the Immer library,
        // which detects changes to a "draft state" and produces a brand new
        // immutable state based off those changes
        state.value += 1;
      },
      updateSelectedTopic: (state, action) => {
        state.selectedTopic = action.payload
      },
      decrement: (state) => {
        state.value -= 1;
      },
      incrementByAmount: (state, action) => {
        state.value += action.payload;
      },
    },
  });
  
  // Action creators are generated for each case reducer function
  export const { increment, decrement, incrementByAmount, updateMembers, updateTopics, updateSelectedTopic } = selectedCapability.actions;
  
  export default selectedCapability.reducer;