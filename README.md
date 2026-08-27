# Unisole Admin

Modern, intuitive administrative dashboard for the [Unisole Engine](https://github.com/anomalyco/unisole-engine) EdTech Platform API. Built with Vite, React 18, Redux Toolkit (RTK Query), and Lucide Icons.

## Features

- **Phone OTP Authentication**: Secure mobile OTP sign-in with uppercase `ADMIN` authorization check and dev quick-fill helper.
- **Executive Dashboard Overview**: Real-time KPI cards (Learners, Published Pathways, Curriculum Courses, Active Enrollments, Revenue in ₹) and live activity feeds.
- **Pathways & Curriculum Builder**: Manage pathways, pricing, lifecycle status (`DRAFT`, `PUBLISHED`, `ARCHIVED`), and visually link categories, target colleges, and ordered course sequences.
- **Curriculum Hierarchy Workspace**: Unified 3-tab workspace for Courses, Modules, and Lessons with position-based sequence ordering.
- **Colleges & Categories Management**: Manage partner universities and domain taxonomy.
- **Learners & Enrollments**: Directory with phone search, role badges, 1-click deactivation, enrollment filters, and manual enrollment grant dialog.
- **Billing & Payments Ledger**: Real-time transaction audit table with Razorpay order IDs, payment IDs, and INR rupee formatting.
- **Engine Health Monitor**: Live API connectivity check against `/health`.

## Getting Started

### Prerequisites

Requires the Engine API running (default `http://localhost:3000`):

```sh
npm install
npm run dev
# open http://localhost:5173
```

## Docker

```sh
docker compose up --build
# open http://localhost:5173
```

## Project Structure

```
src/
  components/
    curriculum/         Courses, Modules, Lessons tabs & sequencers
    dashboard/          KPI metrics & recent activity feeds
    metadata/           Colleges & Categories management
    pathways/           Pathways management & visual PathwayBuilderModal
    payments/           Razorpay transaction ledger
    students/           Learners directory & enrollment management
  pages/
    login.jsx           Phone OTP login page
  store/
    auth-slice.js       Auth state & JWT token persistence
  store.js              RTK Query endpoints for /api/admin/*
  App.jsx               App shell, topbar & navigation
  App.css               Modern dark design system
```
