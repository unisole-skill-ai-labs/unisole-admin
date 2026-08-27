import { createSlice } from "@reduxjs/toolkit";

const TOKEN_KEY = "unisole-admin:token";
const USER_KEY = "unisole-admin:user";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: (() => {
      try {
        return JSON.parse(localStorage.getItem(USER_KEY)) || null;
      } catch {
        return null;
      }
    })(),
    isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  },
  reducers: {
    setCredentials(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
