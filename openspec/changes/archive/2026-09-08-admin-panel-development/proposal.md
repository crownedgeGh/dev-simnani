## Why

Simnani Estate currently has no centralized admin control surface — properties, user accounts, freelancer/channel-partner leads, campaign videos, and projects can only be managed by editing source files directly. An Admin Panel gives administrators a real-time, GUI-driven interface to manage every major platform domain without touching code, enabling operational autonomy and faster iteration.

## What Changes

- **New route segment** `app/admin/` with its own layout (sidebar + topbar), scoped outside the public Navbar/Footer shell.
- **Admin authentication** — a separate admin login (localStorage-persisted, `se_admin_token`) with route guard protecting all `/admin/*` pages.
- **Reusable `AdminTable` component** — single configurable table with search, sort, filter, pagination, row actions, status badges, toggles, loading/empty states and responsive card fallback for mobile/tablet.
- **Properties Management** — full CRUD over `PROPERTIES` (seeded from `lib/properties.js`, persisted to localStorage). Featured toggle, status management, clickable row → property detail view.
- **Users Management** — list, view, edit and soft-delete registered users (from `se_user_profile` records); filter by `accountType` (buyer, broker, investor, freelancer, common-person, employee).
- **Freelancer / Channel Partner Management** — admin control over all three CP types (Company, Digital, Field): lead status changes, commission approvals, campaign video review (Approve / Suggest Edit), network member management.
- **Projects Management** — CRUD over `PROJECTS` (status, price, developer, image).
- **Leads Management** — unified view of all leads from all portals (freelancer leads, CP leads, employee leads) with status pipeline management and assignment.
- **Callback Requests Management** — view and manage all `/request-callback` submissions.
- **Dashboard / Analytics Overview** — platform-wide stats: total properties, users, leads, conversions, commissions pending.
- **Toast notifications** — single Toaster component throughout; all CRUD operations emit success/error toasts.
- **Instant UI updates** — all operations mutate in-memory state immediately; no full-page reloads.
- **Refresh button** — every admin page has a per-section refresh button; triggers re-fetch from localStorage.
- **shadcn celestial theme** — installed via `npx shadcn@latest add https://tweakcn.com/r/themes/cmm71zs0s000004k2e67feff5`; applied exclusively within the admin layout scope.

## Capabilities

### New Capabilities

- `admin-auth`: Separate admin login flow with localStorage token (`se_admin_token`), admin route guard HOC/middleware, and admin session management.
- `admin-layout`: Collapsible sidebar navigation, top bar with admin user info and logout, breadcrumbs, responsive mobile drawer — wrapping all `/admin/*` pages.
- `admin-table`: Reusable `AdminTable` component — columns config, search, multi-field sort, filter panel, pagination, row click, action menu (edit/delete/toggle), status badge, loading skeleton, empty state, responsive card transformation below `lg:`.
- `admin-dashboard`: Platform-wide analytics page — KPI cards (properties, users, leads, conversions, commission pipeline), recent activity feed.
- `admin-properties`: Properties listing with full CRUD — create/edit form dialog, delete confirm, featured toggle, status badge (Active/Pending/Rejected), clickable row to admin property detail page.
- `admin-users`: User accounts listing — view profile, edit account type/status, soft-delete. Filter by accountType, status.
- `admin-freelancer-cp`: Three-tab management panel for Company CP, Digital CP, and Field CP — lead pipeline management (status change, assignment), campaign video moderation (approve/suggest edit/reject), commission approval, network member CRUD.
- `admin-projects`: Projects CRUD — add/edit/delete projects with name, location, price, developer, status, image.
- `admin-leads`: Unified leads table across all portals — search by customer/phone, filter by source/status/project, bulk status update, assignment management.
- `admin-callbacks`: Callback request queue — view submissions, mark as handled, add admin notes.
- `admin-toast`: Single centralized toast system (Sonner or custom) used across all admin pages; no browser alerts.
- `admin-data-layer`: LocalStorage-backed data layer using Axios (intercepted to localStorage) — `se_admin_properties`, `se_admin_users`, `se_admin_leads`, `se_admin_projects`, `se_admin_callbacks`, `se_admin_freelancer_data`, `se_admin_cp_data` keys.

### Modified Capabilities

- *(none — all existing public portal functionality remains unchanged)*

## Impact

- **New files**: `app/admin/**` pages, `app/admin/layout.js`, `components/admin/**` components, `lib/adminStorage.js`, `lib/adminAxios.js`, `context/AdminAuthContext.jsx`.
- **Existing files**: No existing files are modified — the admin panel is an additive, isolated module.
- **Dependencies**: `axios` (install if not present), `sonner` (toast library), shadcn celestial theme components (Button, Dialog, Input, Select, Badge, Switch, etc.).
- **Data**: All admin data persists in localStorage under `se_admin_*` keys; seeded on first load from the existing `lib/properties.js`, `lib/projects.js`, `lib/demoPortal.js`, `lib/demoEmployeePortal.js` arrays.
- **Auth**: Admin login is completely separate from the public `se_auth_token` auth — a new `se_admin_token` key with a hardcoded demo admin credential (`admin@simnani.com` / `admin123`).
