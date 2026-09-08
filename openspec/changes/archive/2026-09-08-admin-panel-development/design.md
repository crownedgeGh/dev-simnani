## Context

Simnani Estate is a Next.js 16 App Router application with a dark navy/gold design system (Tailwind v4). All data currently lives in static JS modules (`lib/properties.js`, `lib/projects.js`, `lib/demoPortal.js`, `lib/demoEmployeePortal.js`). There is a client-side auth system backed by localStorage (`se_auth_token`, `se_user_profile`). No backend API exists — the project explicitly uses localStorage as the persistence layer.

The admin panel must be built as a completely isolated module within the same Next.js app — separate route segment, separate auth, separate data layer — without touching any existing public-facing code.

## Goals / Non-Goals

**Goals:**
- Deliver a production-quality, fully responsive admin panel at `/admin/*`
- Isolated admin auth (`se_admin_token`) that does not conflict with public auth
- Single reusable `AdminTable` with all filtering/sorting/pagination/responsive behavior
- Full CRUD for Properties, Projects, Users, Freelancer data, CP data, Leads, Callbacks
- Axios used for all data operations (localStorage adapter), saving all mutations to localStorage
- Sonner-based toast system across entire admin panel
- Instant UI updates after every mutation — no page reloads
- Refresh button per page that re-reads from localStorage
- shadcn celestial theme scoped to `/admin/*` layout

**Non-Goals:**
- Real backend API integration (deferred — localStorage only for now)
- Public portal modification (zero changes to existing pages/components)
- Role-based admin permissions beyond a single admin user
- Real-time push updates / WebSocket
- File/image upload to cloud (image URLs only)

## Decisions

### D1: Isolated admin route segment with its own layout
**Decision**: `app/admin/layout.js` renders its own `<AdminAuthProvider>`, sidebar, and topbar — completely replacing Navbar/Footer for the admin section. The root `layout.js` remains untouched.

**Rationale**: Next.js App Router layout nesting means `app/admin/layout.js` wraps only `/admin/*` pages. The public Navbar/Footer are defined in the root layout and are NOT rendered inside route groups or nested layouts that override them — we use a root-level exclusion pattern where `app/admin/layout.js` returns its own full `<html>/<body>` shell. Actually, since Next.js 16 doesn't support multiple `<html>` roots, the admin layout will use a route group or full-page override pattern: wrap the admin body in a full-bleed div that covers the viewport and hides Navbar/Footer via CSS (or use `(admin)` route group so the root layout can conditionally render Navbar/Footer).

**Chosen approach**: Use `app/(admin)/admin/layout.js` route group pattern so admin pages get their own sub-layout without root layout interference. The root layout will skip Navbar/Footer for the `(admin)` group by checking path prefix.

**Alternative considered**: Separate Next.js app in a monorepo — rejected as overkill for a localhost-data admin panel.

### D2: Axios with localStorage adapter (no real HTTP)
**Decision**: Create `lib/adminAxios.js` — an Axios instance with request/response interceptors that translate CRUD HTTP verbs into localStorage read/write operations. Collections are stored as JSON arrays under keys like `se_admin_properties`.

**Rationale**: User requirement explicitly states "use Axios for API calls, save all data in localStorage". This pattern simulates a real REST API and makes future backend migration easy — just swap the interceptors.

```
GET /admin/properties → JSON.parse(localStorage.getItem('se_admin_properties'))
POST /admin/properties → push + JSON.stringify + setItem
PUT /admin/properties/:id → find + replace + setItem
DELETE /admin/properties/:id → filter + setItem
```

**Seeding**: On first load (when `se_admin_*` key is absent), seed from the static lib arrays.

### D3: Single AdminTable component (not per-page tables)
**Decision**: `components/admin/ui/AdminTable.jsx` — columns are passed as config prop; the component handles search, sort, filter, pagination, loading skeleton, empty state, and responsive card view internally.

**Column config shape**:
```js
{
  key: 'title',
  label: 'Property',
  sortable: true,
  render: (value, row) => <CustomCell value={value} row={row} />,
  filterOptions: ['Active', 'Pending', 'Rejected'], // optional
}
```

**Responsive behavior**: Below `lg:` breakpoint, each row becomes a card showing key fields vertically, with action buttons at the bottom.

### D4: shadcn celestial theme scoped to admin
**Decision**: Install shadcn UI components and the tweakcn celestial theme (https://tweakcn.com/r/themes/cmm71zs0s000004k2e67feff5). The theme CSS variables are applied only within the admin layout root div (`.admin-theme-celestial` and `.admin-shell` class), preventing bleed into the public portal.

**Why shadcn**: The user explicitly requested this theme. shadcn/ui provides accessible, composable primitives (Dialog, Popover, Switch, Select) that would take significant effort to rebuild from scratch.

### D5: AdminAuthContext (separate from AuthContext)
**Decision**: `context/AdminAuthContext.jsx` — provides `{ isAdminAuthenticated, adminLogin, adminLogout }`. Guards all `/admin/*` routes. Hardcoded demo credential: `admin@simnani.com` / `admin123`.

**Token key**: `se_admin_token` — separate from `se_auth_token`.

### D6: Toast system — Sonner
**Decision**: Use `sonner` library (`npm install sonner`). A single `<Toaster />` is placed in `app/(admin)/admin/layout.js`. All admin components call `import { toast } from 'sonner'` directly.

**Rationale**: Sonner is the modern standard in the shadcn/ui ecosystem, lightweight, zero-config, and supports promise-based async toasts natively.

### D7: State management — React useState + localStorage re-reads
**Decision**: Each admin page manages its own state. After any mutation, the page immediately updates its local state array (optimistic update) and calls the Axios adapter to persist. The Refresh button triggers a full re-read from localStorage and replaces local state.

**No global store (Redux/Zustand)**: Overkill for a localStorage-backed admin; simple useState suffices and keeps the architecture understandable.

## Risks / Trade-offs

- **localStorage limits** (~5-10 MB): Storing large property arrays with image URLs is safe; binary uploads would not be. → Mitigation: Images stored as URLs only, never base64.
- **Multi-tab conflicts**: Two admin tabs mutating localStorage simultaneously could cause stale reads. → Mitigation: Refresh button exists; `storage` event listener can be added in a future enhancement.
- **shadcn component tree size**: Installing many shadcn components adds bundle weight. → Mitigation: Install only required components (Dialog, Input, Select, Badge, Switch, Button, Sonner).
- **Admin route group complexity**: Route groups in Next.js 16 may behave differently from training data. → Mitigation: Read `node_modules/next/dist/docs/` before implementing the layout.

## Migration Plan

1. Install dependencies: `axios`, `sonner`, shadcn celestial theme.
2. Create `lib/adminAxios.js` with localStorage adapter + seeding logic.
3. Create `context/AdminAuthContext.jsx`.
4. Create `app/(admin)/admin/` route group with `layout.js`, `login/page.js`.
5. Build `components/admin/ui/AdminTable.jsx` (core reusable primitive).
6. Build shared admin UI components: `AdminSidebar`, `AdminTopbar`, `AdminPageHeader`, `AdminDialog`, `AdminConfirmModal`, `AdminFormField`.
7. Implement pages in order: Dashboard → Properties → Users → Projects → Leads → Freelancer/CP → Callbacks → Settings.
8. Wire toast notifications to all mutations.
9. Verify responsive behavior at mobile/tablet/desktop breakpoints.

## Open Questions

- Should the admin dashboard show charts (e.g., Chart.js/Recharts) or just numeric KPI cards? → Defaulting to KPI cards + sparkline stats to avoid heavy chart dependency unless user requests.
- Should admin property edits propagate back to the public portal's `PROPERTIES` array? → No — admin localStorage data (`se_admin_properties`) is separate from the static import. Public portal continues to read the static JS. A future migration step would sync these.
