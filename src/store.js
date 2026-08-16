import { configureStore, createSlice } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { resources } from "./config/resources";

const STORAGE_KEY = "unisole-admin:baseUrl";

const getBase = () => localStorage.getItem(STORAGE_KEY) || "http://localhost:3000";

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    baseUrl: localStorage.getItem(STORAGE_KEY) || "http://localhost:3000",
  },
  reducers: {
    setBaseUrl(state, action) {
      state.baseUrl = action.payload;
      localStorage.setItem(STORAGE_KEY, action.payload);
    },
  },
});

export const { setBaseUrl } = settingsSlice.actions;

// One generic CRUD endpoint set per resource, generated from the config.
// Endpoint naming: "<resource>:list|get|create|update|remove|custom"
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
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
    settings: settingsSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
