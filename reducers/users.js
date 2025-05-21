import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {
    _id: "",
    token: "",
    username: "",
    firstName: "",
    avatar: "",
    connectionWithSocials: "",
  },
};

export const usersSlice = createSlice({
  name: "users",

  initialState,
  reducers: {
    login: (state, action) => {
      state.value._id = action.payload._id;
      state.value.token = action.payload.token;
      state.value.username = action.payload.username;
      state.value.firstName = action.payload.firstName;
      state.value.avatar = action.payload.avatar;
      state.value.connectionWithSocials = action.payload.connectionWithSocials;
    },
    logout: (state) => {
      state.value.token = "";
      state.value.username = "";
      state.value.firstName = "";
      state.value._id = "";
      state.value.avatar = "";
      state.value.connectionWithSocials = "";
    },
  },
});

export const { login, logout } = usersSlice.actions;
export default usersSlice.reducer;
