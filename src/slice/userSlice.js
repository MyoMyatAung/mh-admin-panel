import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("token") || "",
};

export const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload); // Store token in localStorage
    },
    logout: (state) => {
      state.token = "";
      localStorage.removeItem("token"); // Remove token from localStorage
    },
  },
});

export const { login, logout } = UserSlice.actions;
export default UserSlice.reducer;
