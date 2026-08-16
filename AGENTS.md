# AGENTS.md

Guidance for AI coding agents working in **unisole-admin** — the React + Redux Toolkit admin panel for the Unisole Engine API.

## Project Overview

- Stack: Vite 6 + React 18 + `@reduxjs/toolkit` (RTK Query) + `react-redux`, plain JSX (no TypeScript).
- Purpose: a data-driven CRUD admin UI over every Unisole Engine resource. The panel is **generic**: all resources, fields, required columns, enums, and custom actions come from `src/config/resources.js`, not from component code.
- The Engine API it talks to lives in `/mnt/c/code/unisole-engine` (a separate repo). The panel sends real HTTP requests to that API.

## Commands

```sh
npm install          # install deps
npm run dev          # dev server on http://localhost:5173
npm run build        # production build -> dist/
npm run preview      # serve the built dist/
docker compose up --build   # run the containerized panel on :5173
```

There are no tests and no linter configured. Verification = `npm run build` + manual check in the browser.

## Architecture

- `src/main.jsx` — React root, wraps `App` in `<Provider store={store}>`.
- `src/store.js` — Redux store. Key pieces:
  - `settings` slice holds `baseUrl` (persisted to `localStorage` under `unisole-admin:baseUrl`).
  - `api` is one RTK Query `createApi` with **dynamically generated** endpoints: per resource, endpoints `"<name>:list|get|create|update|remove|custom"` (e.g. `users:list`).
  - Base URL resolution: query callbacks call `getBase()` (reads `localStorage`) at request time — **never** use a second argument to the `query` callback; RTK Query calls `query(arg)` with one argument only.
- `src/config/resources.js` — the single source of truth: `{ name, label, path, fields, required, actions }` for each of the 21 engine resources. Adding a resource = adding one entry here.
- `src/App.jsx` — sidebar (resource list), generic data table, create/edit `FormModal`, `JsonModal` for view/custom-request JSON output, base-URL input + health check. `ResourcePanel` is remounted with `key={name:baseUrl}` when the resource or base URL changes.

## RTK Query Gotchas (read before editing store.js/App.jsx)

- Generated hook names are `use${capitalize(endpointName)}Query/Mutation` with only the **first** letter uppercased and **no `Get` prefix** (`users:list` → `useUsers:listQuery`). Don't hand-write these — use the helper:
  ```js
  const endpointHook = (resource, op) => api.endpoints[`${resource}:${op}`];
  const listHook = endpointHook(name, "list");           // use it, don't name-generate
  const { data, error, isFetching, refetch } = listHook(baseUrl);
  ```
- The `query:` callback receives **only the arg** (`query(arg)`). There is no second `api`/`queryApi` argument. Reading Redux state from inside `query` is not possible — read `localStorage` (via `getBase()`) instead.
- The `:list` query takes `baseUrl` as its arg so a URL change produces a new cache key and auto-refetches.
- Mutations invalidate the `"LIST"` tag (and the row tag for update/remove) so the table refreshes automatically.

## Docker

- `Dockerfile`: multi-stage — `node:22-alpine` runs `npm ci` + `vite build`, then `nginx:1.27-alpine` serves `dist/`.
- `nginx.conf`: SPA fallback (`try_files ... /index.html`), gzip, immutable caching for `/assets/`.
- `docker-compose.yml`: single `admin` service, port `5173:80`.
- `npm ci` runs inside the container on Linux, so native binaries (`@rollup/rollup-linux-x64-gnu`, `@esbuild/linux-x64`) are always correct there.
- Default API URL is configurable at build time via the `VITE_API_BASE_URL` build arg (reads `import.meta.env.VITE_API_BASE_URL` in `src/store.js`; falls back to `http://localhost:3000`). See `.env.example` and `deploy/nginx-admin.conf` for EC2 usage.

## Critical Environment Warning

`/mnt/c/code/unisole-admin/node_modules` sits on a shared Windows drive. **Never let Windows npm and WSL npm both write to it** — a Windows-side `npm install` replaces the native binaries with `@esbuild/win32-x64` / `@rollup/rollup-win32-x64-*`, which breaks `npm run build` under WSL (rollup tries to load `@rollup/rollup-linux-x64-gnu` and fails). Pick ONE environment for npm operations; if it breaks, run `npm ci` from that environment. `npm run dev` works either way (Vite dev doesn't use the rollup binary).

## Conventions

- No comments unless asked. Match existing formatting.
- Data flows from `resources.js` config → generic table/form. Avoid hard-coding per-resource UI in components; prefer extending the config.
- The panel is an API consumer: keep `path` values in `resources.js` aligned with the Engine routes (`/api/<plural>`).
