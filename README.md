# Unisole Admin

A generic admin panel for the [Unisole Engine](https://github.com/anomalyco/unisole-engine) API. Built with Vite, React 18, and Redux Toolkit (RTK Query). It renders CRUD tables + forms for all 21 engine resources, driven entirely by `src/config/resources.js`.

## Features

- Sidebar with all engine resources (users, courses, modules, lessons, tests, orders, payments, etc.)
- Generic data table with create / edit / delete modals
- JSON view modal (raw response, GET) and a free-form custom request modal
- Configurable API base URL (persisted in `localStorage`) with live health indicator
- Auto-refetch on row changes via RTK Query tag invalidation

## Getting Started

Requires the Engine API running (default `http://localhost:3000`):

```sh
npm install
npm run dev
# open http://localhost:5173
```

The API URL is set in the top-right field (default `http://localhost:3000`); click the health dot to check connectivity.

## Docker

```sh
docker compose up --build
# open http://localhost:5173
```

Multi-stage image: builds the app with Node 22, then serves the static bundle with nginx (`Dockerfile`, `nginx.conf`). SPA routing falls back to `index.html`.

## Project Structure

```
src/
  main.jsx              React root + Redux Provider
  store.js              Redux store + dynamically generated RTK Query API
  config/resources.js   Source of truth for all resources/fields/actions
  App.jsx               Sidebar, table, modals, base-URL settings
  App.css               Styles
```

## Adding a Resource

Add one entry to `src/config/resources.js` — table, form, and modals for the new resource appear automatically.

See `AGENTS.md` for development conventions and known gotchas.
