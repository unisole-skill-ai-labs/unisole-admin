import { configureStore, createSlice } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { resources } from "./config/resources";
import authReducer, { logout } from "./store/auth-slice";

const STORAGE_KEY = "unisole-admin:baseUrl";

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const getBase = () => localStorage.getItem(STORAGE_KEY) || DEFAULT_BASE_URL;

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    baseUrl: localStorage.getItem(STORAGE_KEY) || DEFAULT_BASE_URL,
  },
  reducers: {
    setBaseUrl(state, action) {
      state.baseUrl = action.payload;
      localStorage.setItem(STORAGE_KEY, action.payload);
    },
  },
});

export const { setBaseUrl } = settingsSlice.actions;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth = async (args, apiInstance, extraOptions) => {
  const result = await rawBaseQuery(args, apiInstance, extraOptions);
  if (result.error && result.error.status === 401) {
    apiInstance.dispatch(logout());
  }
  return result;
};

// One generic CRUD endpoint set per resource, generated from the config.
// Endpoint naming: "<resource>:list|get|create|update|remove|custom"
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: resources.map((r) => r.name),
  endpoints: (build) => {
    const eps = {};
    for (const r of resources) {
      const path = (suffix) => `${getBase()}${r.path}${suffix}`;

      eps[`${r.name}:list`] = build.query({
        query: (baseUrl) => ({ url: `${baseUrl}${r.path}` }),
        providesTags: (result) =>
          result
            ? [
              ...result.map((row) => ({ type: r.name, id: row.id })),
              { type: r.name, id: "LIST" },
            ]
            : [{ type: r.name, id: "LIST" }],
      });
      eps[`${r.name}:get`] = build.query({
        query: (id) => ({ url: path(`/${id}`) }),
      });
      eps[`${r.name}:create`] = build.mutation({
        query: (body) => ({ url: path(""), method: "POST", body }),
        invalidatesTags: [{ type: r.name, id: "LIST" }],
      });
      eps[`${r.name}:update`] = build.mutation({
        query: ({ id, body }) => ({
          url: path(`/${id}`),
          method: "PUT",
          body,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: r.name, id },
          { type: r.name, id: "LIST" },
        ],
      });
      eps[`${r.name}:remove`] = build.mutation({
        query: (id) => ({ url: path(`/${id}`), method: "DELETE" }),
        invalidatesTags: (_result, _error, id) => [
          { type: r.name, id },
          { type: r.name, id: "LIST" },
        ],
      });
      eps[`${r.name}:custom`] = build.query({
        query: (customUrl) => ({ url: `${getBase()}${customUrl}` }),
      });
    }
    return eps;
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
