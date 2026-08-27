# Admin Frontend Decisions

This file records the frontend standard for `unisole-admin`.

## Role

- Internal operations console for platform staff.
- Focused on management of pathways, curriculum, colleges, categories, students, enrollments, and payments.

## Stack

- Vite
- React
- TypeScript
- React Router
- Redux Toolkit
- RTK Query
- shadcn/ui
- Tailwind CSS

## Backend Usage

- Primary API groups:
  - `/api/auth/*`
  - `/api/admin/*`

## Architecture Notes

- Use router-based navigation rather than local tab state for major screens.
- Keep auth/session state in Redux Toolkit.
- Keep remote data in RTK Query.
- Use shadcn/ui for forms, tables, dialogs, drawers, alerts, buttons, badges, and layout primitives.

## Recommended Folder Shape

- `src/app`
- `src/features`
- `src/pages`
- `src/components/ui`
- `src/components/shared`
- `src/api`
- `src/lib`

## Admin-Specific Rules

- Protect all screens behind admin auth.
- Treat API base URL and token handling as app-level concerns.
- Keep the UI dense, table-heavy, and operations-focused.
