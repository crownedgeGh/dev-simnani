## 1. Dependencies & Setup

- [ ] 1.1 Install `axios` and `sonner` npm packages
- [ ] 1.2 Read `node_modules/next/dist/docs/` to understand Next.js 16 route group and layout nesting behaviour
- [ ] 1.3 Apply shadcn celestial theme from `https://tweakcn.com/r/themes/cmm71zs0s000004k2e67feff5` and install shadcn primitives: Button, Dialog, Input, Select, Badge, Switch, Separator, Popover
- [ ] 1.4 Install any additional shadcn components required: DropdownMenu, Sheet (for mobile drawer), Tooltip

## 2. Data Layer & Storage

- [ ] 2.1 Create `lib/adminStorage.js` — `seedAdminData()` function that checks each `se_admin_*` key and seeds from static lib arrays on first run
- [ ] 2.2 Create `lib/adminAxios.js` — Axios instance with request/response interceptors implementing the localStorage adapter (GET/POST/PUT/PATCH/DELETE routing to localStorage)
- [ ] 2.3 Add activity log append helper in `lib/adminAxios.js` — every successful mutation appends to `se_admin_activity_log`
- [ ] 2.4 Seed demo callback data (5 records) as part of `seedAdminData()`

## 3. Admin Auth

- [ ] 3.1 Create `context/AdminAuthContext.jsx` — `AdminAuthProvider`, `useAdminAuth()` hook, `se_admin_token` localStorage key, hardcoded credential `admin@simnani.com` / `admin123`
- [ ] 3.2 Create `components/admin/AdminGuard.jsx` — client component that reads token from localStorage and redirects to `/admin/login` if absent

## 4. Admin Route Group & Layout

- [ ] 4.1 Create `app/(admin)/admin/login/page.js` — admin login page with email/password form, using shadcn celestial theme; on success stores token and redirects to `/admin`
- [ ] 4.2 Create `app/(admin)/admin/layout.js` — wraps all admin pages in `AdminAuthProvider`, `AdminGuard`, `<Toaster />`, and the admin shell (sidebar + topbar)
- [ ] 4.3 Create `components/admin/layout/AdminSidebar.jsx` — collapsible sidebar with nav links: Dashboard, Properties, Users, Projects, Leads, Freelancer & CP, Callbacks, Settings; active link highlight; collapse to icon-only mode
- [ ] 4.4 Create `components/admin/layout/AdminTopbar.jsx` — page title, admin user display name, logout button; hamburger menu for mobile
- [ ] 4.5 Create `components/admin/layout/AdminMobileDrawer.jsx` — Sheet-based mobile nav drawer triggered by hamburger in topbar
- [ ] 4.6 Create `components/admin/layout/AdminPageHeader.jsx` — reusable page header with title, description, breadcrumb, Refresh button, and optional action slot
- [ ] 4.7 Verify root layout (`app/layout.js`) does NOT render Navbar/Footer for the `(admin)` route group (use route group isolation to prevent bleed)

## 5. Reusable Admin Table Component

- [ ] 5.1 Create `components/admin/ui/AdminTable.jsx` — accepts `columns` (config array), `data`, `loading`, `onRowClick`, `pageSize`, `emptyMessage` props
- [ ] 5.2 Implement search input within AdminTable — filters rows by `searchKeys` or all string fields
- [ ] 5.3 Implement column sort (ascending/descending) toggled by clicking sortable column headers
- [ ] 5.4 Implement filter panel — renders filter dropdowns for columns with `filterOptions`; AND logic across filters
- [ ] 5.5 Implement pagination — prev/next + page number buttons; default page size 10
- [ ] 5.6 Implement row actions — dropdown menu per row using the `actions` prop array `{ label, icon, onClick, variant }`
- [ ] 5.7 Implement toggle column type — renders Switch for boolean fields; calls `onToggle(row, newValue)` callback
- [ ] 5.8 Implement status badge column type — color-coded badge driven by `statusColors` prop map
- [ ] 5.9 Implement loading skeleton state — shimmering placeholder rows when `loading === true`
- [ ] 5.10 Implement empty state — illustration + message + clear-filters CTA when `data.length === 0 && !loading`
- [ ] 5.11 Implement responsive card layout — below `lg:` breakpoint, each row transforms to a vertical card with all fields and actions; tested on 375px and 768px viewports

## 6. Shared Admin UI Components

- [ ] 6.1 Create `components/admin/ui/AdminDialog.jsx` — reusable dialog wrapper (shadcn Dialog) with title, description, and footer action slots
- [ ] 6.2 Create `components/admin/ui/AdminConfirmModal.jsx` — confirmation dialog with message prop and `onConfirm`/`onCancel` callbacks; no `window.confirm()` usage
- [ ] 6.3 Create `components/admin/ui/AdminFormField.jsx` — label + input/select/textarea wrapper with error message display
- [ ] 6.4 Create `components/admin/ui/AdminStatusBadge.jsx` — standalone status badge component with color mapping
- [ ] 6.5 Create `components/admin/ui/AdminKpiCard.jsx` — KPI metric card with title, value, subtitle, optional icon

## 7. Dashboard Page

- [ ] 7.1 Create `app/(admin)/admin/page.js` — redirects to `/admin/dashboard`
- [ ] 7.2 Create `app/(admin)/admin/dashboard/page.js` — dashboard page using `AdminPageHeader` and KPI cards
- [ ] 7.3 Implement KPI cards: Total Properties, Total Users, Total Leads, Active Projects, Pending Commissions, Pending Callbacks — values read via `adminAxios`
- [ ] 7.4 Implement Recent Activity feed — last 10 entries from `se_admin_activity_log`
- [ ] 7.5 Implement Property breakdown by type stat list
- [ ] 7.6 Implement Lead pipeline summary (counts per status stage)
- [ ] 7.7 Wire Refresh button to re-read all KPI data with loading state

## 8. Properties Management

- [ ] 8.1 Create `app/(admin)/admin/properties/page.js` — properties listing page
- [ ] 8.2 Define `PROPERTY_COLUMNS` config for AdminTable (image thumbnail, title, type badge, location, price, beds/baths/area, status badge, featured toggle, actions)
- [ ] 8.3 Implement property search (by title/location) and filters (type, status, featured)
- [ ] 8.4 Create `components/admin/properties/PropertyFormDialog.jsx` — create/edit dialog with all property fields; validates required fields before submit
- [ ] 8.5 Wire "Add Property" button → opens empty `PropertyFormDialog`; on submit: calls `adminAxios.post`, updates local state, fires success toast
- [ ] 8.6 Wire "Edit" row action → opens pre-filled `PropertyFormDialog`; on submit: calls `adminAxios.put`, updates row in state, fires success toast
- [ ] 8.7 Wire "Delete" row action → opens `AdminConfirmModal`; on confirm: calls `adminAxios.delete`, removes row from state, fires success toast
- [ ] 8.8 Wire featured toggle → calls `adminAxios.patch`, updates row `featured` in state, fires toast "Featured enabled/disabled"
- [ ] 8.9 Wire status change → inline select or part of edit dialog; calls `adminAxios.patch`, updates status badge in row immediately
- [ ] 8.10 Wire `onRowClick` → navigate to `/admin/properties/[id]`
- [ ] 8.11 Create `app/(admin)/admin/properties/[id]/page.js` — property detail view with all fields, image, and Edit/Delete/Back actions

## 9. Users Management

- [ ] 9.1 Create `app/(admin)/admin/users/page.js` — users listing page
- [ ] 9.2 Define `USER_COLUMNS` config for AdminTable (name, mobile, email, account type badge, account ID, date, status badge, actions)
- [ ] 9.3 Implement user filters (by accountType, status) and search (name, mobile, email)
- [ ] 9.4 Create `components/admin/users/UserEditDialog.jsx` — edit accountType and status
- [ ] 9.5 Wire "Edit" row action → opens `UserEditDialog`; on submit: updates state and fires toast
- [ ] 9.6 Wire "Soft Delete" row action → `AdminConfirmModal`; on confirm: sets status "Deleted", fires warning toast
- [ ] 9.7 Wire `onRowClick` → navigate to `/admin/users/[accountId]`
- [ ] 9.8 Create `app/(admin)/admin/users/[accountId]/page.js` — user profile detail view

## 10. Projects Management

- [ ] 10.1 Create `app/(admin)/admin/projects/page.js` — projects listing page
- [ ] 10.2 Define `PROJECT_COLUMNS` config for AdminTable (image, name, location, starting price, developer, status badge, actions)
- [ ] 10.3 Create `components/admin/projects/ProjectFormDialog.jsx` — create/edit dialog with all project fields
- [ ] 10.4 Wire "Add Project" → `ProjectFormDialog`; on submit: `adminAxios.post`, updates state, toast
- [ ] 10.5 Wire "Edit" → pre-filled `ProjectFormDialog`; on submit: `adminAxios.put`, updates state, toast
- [ ] 10.6 Wire "Delete" → `AdminConfirmModal`; on confirm: removes row, toast
- [ ] 10.7 Create `components/admin/projects/ProjectAssetsDialog.jsx` — dialog showing photos/videos/brochure for a project
- [ ] 10.8 Wire "View Assets" row action → opens `ProjectAssetsDialog`

## 11. Freelancer & CP Management

- [ ] 11.1 Create `app/(admin)/admin/freelancer-cp/page.js` — hub page with tabs: Freelancer Leads, CP Network, Campaign Videos, Commissions
- [ ] 11.2 Implement "Freelancer Leads" tab — AdminTable with freelancer lead columns; inline status change select; calls `adminAxios.patch`, updates state, toast
- [ ] 11.3 Implement "Freelancer Properties" sub-section — freelancer-submitted properties with Pending Review / Live / Rejected status management
- [ ] 11.4 Implement "CP Network" tab — AdminTable with CP member columns; filter by cpType; status (Active/Suspended) management
- [ ] 11.5 Implement CP Leads sub-table within "CP Network" tab — all CP leads with full status pipeline; assign lead to Field CP dropdown; calls `adminAxios.patch`, toast
- [ ] 11.6 Implement "Campaign Videos" tab — AdminTable with video columns; "Approve" action (status → Approved); "Suggest Edit" action (opens note dialog, status → Suggested Edit); calls `adminAxios.patch`, toast
- [ ] 11.7 Implement "Commissions" tab — all commission records; "Approve" action (approvalStatus → Approved); "Put On Hold" action; calls `adminAxios.patch`, toast
- [ ] 11.8 Create `components/admin/freelancer-cp/VideoModerationDialog.jsx` — dialog for entering suggested edit note

## 12. Leads Management

- [ ] 12.1 Create `app/(admin)/admin/leads/page.js` — unified leads page
- [ ] 12.2 Seed unified `se_admin_leads` from `FREELANCER_LEADS`, `CP_LEADS`, `EMPLOYEE_LEADS` with a `portalSource` discriminator field
- [ ] 12.3 Define `LEAD_COLUMNS` config for AdminTable (lead ID, customer, phone, project/property, source, submitted by, date, status badge, assigned to, commission, actions)
- [ ] 12.4 Implement filters: by source portal (Freelancer/CP-Digital/CP-Field/CP-Company/Employee), by status, by project
- [ ] 12.5 Implement search by customer name or phone
- [ ] 12.6 Wire status change action → `adminAxios.patch`, updates badge in table immediately, toast
- [ ] 12.7 Wire "Assign" action → dropdown select, `adminAxios.patch`, updates assigned column, toast
- [ ] 12.8 Wire `onRowClick` → opens lead detail slide-over/dialog with full info (notes, follow-up history, site visit)
- [ ] 12.9 Create `components/admin/leads/LeadDetailPanel.jsx` — slide-over or dialog with all lead info

## 13. Callbacks Management

- [ ] 13.1 Create `app/(admin)/admin/callbacks/page.js` — callbacks listing page
- [ ] 13.2 Define `CALLBACK_COLUMNS` for AdminTable (request ID, name, phone, email, topic, message excerpt, date, status badge, assigned to, admin notes, actions)
- [ ] 13.3 Implement filter by status (Pending/In Progress/Handled)
- [ ] 13.4 Wire "Mark Handled" action → `adminAxios.patch`, status → Handled, badge updates, toast
- [ ] 13.5 Create `components/admin/callbacks/CallbackEditDialog.jsx` — edit notes and assignee; on submit: `adminAxios.patch`, updates row, toast

## 14. Settings Page

- [ ] 14.1 Create `app/(admin)/admin/settings/page.js` — admin settings page with sections: Admin Account (display name, email — read only), Danger Zone (clear all admin data / reset to seed data)
- [ ] 14.2 Implement "Reset to seed data" action — `AdminConfirmModal`; on confirm: removes all `se_admin_*` keys and calls `seedAdminData()`, fires toast "Data reset to defaults"

## 15. Toast Integration Audit

- [ ] 15.1 Verify every CRUD operation in Properties, Users, Projects, Leads, Freelancer/CP, Callbacks fires the correct success/error toast using `toast.success()` / `toast.error()` from `sonner`
- [ ] 15.2 Verify no `window.alert()`, `window.confirm()`, or `window.prompt()` calls exist anywhere in `components/admin/**` or `app/(admin)/**`
- [ ] 15.3 Verify `<Toaster />` is mounted exactly once in `app/(admin)/admin/layout.js`

## 16. Responsive Design Verification

- [ ] 16.1 Test admin shell (sidebar/topbar/drawer) at 375px, 768px, and 1280px viewports
- [ ] 16.2 Test AdminTable card layout at 375px (mobile) — all columns visible as card fields, actions accessible
- [ ] 16.3 Test AdminTable at 768px (tablet) — card layout still applies below `lg:`
- [ ] 16.4 Test all dialog/sheet components on mobile — no overflow, usable inputs
- [ ] 16.5 Verify touch targets are at least 44×44px on mobile

## 17. Build & Lint Verification

- [ ] 17.1 Run `npm run lint` and fix all ESLint errors in admin files
- [ ] 17.2 Run `npm run dev` and manually navigate each admin page: login → dashboard → properties → users → projects → leads → freelancer-cp → callbacks → settings
- [ ] 17.3 Verify data seeding: clear localStorage, reload admin, confirm all tables have populated demo data
- [ ] 17.4 Verify instant UI updates: create/edit/delete a property without refreshing — confirm state updates immediately
- [ ] 17.5 Verify Refresh button on each page shows loading skeleton then updates data
