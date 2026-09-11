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
    updateUser(state, action) {
      const user = action.payload;
      if (!user) return;
      state.user = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (user.token) {
        state.token = user.token;
        localStorage.setItem(TOKEN_KEY, user.token);
      }
      try {
        window.dispatchEvent(new Event("authChange"));
      } catch {
        // ignore in non-browser environments
      }
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

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
