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

### Deployment (EC2, alongside the engine)

The image builds entirely inside a Linux container, so it always installs the correct native binaries — no Windows/WSL `node_modules` issues on the server.

1. Point one DNS A record (`uni.admin.unisole.org`) at the EC2 public IP.
2. Set the default API URL for the deployed bundle:
   ```sh
   VITE_API_BASE_URL=https://uni.admin.unisole.org docker compose up --build -d
   ```
   (Without it, the panel defaults to `http://localhost:3000`, which is wrong from a browser.)
3. Install nginx + the server block from `deploy/nginx-admin.conf` (proxy admin on `:5173` and reverse-proxy `/api/*`, `/health` to the engine on `127.0.0.1:3000`), then:
   ```sh
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d uni.admin.unisole.org
   ```
4. Keep the engine internal: EC2 security group should only open `22`, `80`, `443`.

The panel and its API share one origin (`https://uni.admin.unisole.org`) — nginx proxies `/api/*` to the engine, so the engine's port `3000` is never exposed to the internet and CORS isn't involved.

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
