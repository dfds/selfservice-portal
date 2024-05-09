import { createSlice } from "@reduxjs/toolkit";

export const kafkacounter = createSlice({
    name: "kafkacounter",
    initialState: {
      counter: 0,
    },
    reducers: {
      updateKafkaCounter: (state, action) => {
        state.counter += 1;
      },
    },
  });
  
  // Action creators are generated for each case reducer function
  export const { updateKafkaCounter, } = kafkacounter.actions;
  
  export default kafkacounter.reducer;