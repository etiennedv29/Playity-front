import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value: {
      search:""
    },
  };

  export const searchesSlice = createSlice({
    name: "searches",
    initialState,
    reducers: {
        saveSearchValue: (state, action) => {
            state.value.search=action.payload
        },}})

export const { saveSearchValue } = searchesSlice.actions;
export default searchesSlice.reducer;