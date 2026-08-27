# AGENTS.md

Guidance for AI coding agents working in **unisole-admin** — the React + Redux Toolkit administrative dashboard for the Unisole Engine API.

## Project Overview

- Stack: Vite 6 + React 18 + `@reduxjs/toolkit` (RTK Query) + `react-redux` + `lucide-react`, plain JSX.
- Purpose: Modern EdTech administrative console providing curriculum hierarchy building (Pathways → Courses → Modules → Lessons), college/category mapping, learner access governance, and billing ledger.
- Communicates with the `unisole-engine` backend (`/api/auth/*` and `/api/admin/*`).

## Commands

```sh
npm install          # install dependencies
npm run dev          # dev server on http://localhost:5173
npm run build        # production build -> dist/
npm run preview      # serve the built dist/
docker compose up --build   # run the containerized admin on :5173
```

Verification = `npm run build` + browser check.

## Architecture

- `src/main.jsx` — React root, wraps `App` in `<Provider store={store}>`.
- `src/store.js` — RTK Query `adminApi` with endpoints for `/api/admin/*` (`students`, `colleges`, `categories`, `pathways`, `courses`, `modules`, `lessons`, `enrollments`, `payments`). Uses tag-based automatic cache invalidation on mutations.
- `src/store/auth-slice.js` — Authentication slice storing JWT token and user profile (`role: 'ADMIN'`).
- `src/pages/login.jsx` — Phone OTP login flow (`POST /api/auth/send-otp` and `POST /api/auth/verify-otp`).
- `src/components/` — Modular feature components:
  - `dashboard/DashboardOverview.jsx` — KPI summary cards & live feeds.
  - `pathways/PathwaysManager.jsx` & `PathwayBuilderModal.jsx` — Pathway pricing, status, and visual course/category/college sequence builder.
  - `curriculum/CurriculumManager.jsx` — 3-tab workspace for Courses, Modules, and Lessons.
  - `metadata/CollegesAndCategories.jsx` — Partner colleges & domain categories.
  - `students/StudentsAndEnrollments.jsx` — Learner directory & enrollment grantor.
  - `payments/PaymentsView.jsx` — Billing ledger with INR rupee formatting.
- `src/App.jsx` — App shell with topbar (health badge, API base URL switcher, admin profile, logout) and navigation sidebar.
- `src/App.css` — Modern design system with responsive tables, glassmorphism cards, and status pills.

## API Conventions

All admin operations talk to `/api/admin/*` prefixed routes with `Authorization: Bearer <token>` headers attached automatically via `fetchBaseQuery` in `src/store.js`.
