## Context

Simnani Estate is a Next.js 16 App Router project with **no backend** — auth is a mock localStorage token (`context/AuthContext.jsx`), and every existing portal (`app/portal/broker`, `/investor`, `/buyer`, `/freelancer`, `/common-person`) renders a dashboard component fed by static arrays from `lib/demoPortal.js` / `lib/demoAccount.js`. There is no database, no API route, and no real lead/CRM data model anywhere in the repo today.

The Employee Management Panel must fit this same pattern: a new account type, a new registration wizard, and a new portal dashboard driven by mock data, with client-side (React state, not persisted) interactions for status changes, scheduling, and notes — exactly like `BrokerDashboard.jsx` already does for tabs and leads.

Given the length of the requested feature (8 sections: overview, leads, site visits, follow-ups, territory inventory, sales/booking, performance, territory management), the dashboard is built as one `EmployeeDashboard.jsx` component using the existing `Tabs` pattern, not eight separate routes — this matches `BrokerDashboard.jsx` exactly and avoids introducing a new navigation paradigm.

## Goals / Non-Goals

**Goals:**
- Add "Employee" as a selectable account type at sign-up, with a dedicated multi-step registration wizard capturing district/territory assignment.
- Ship a fully responsive, tab-based Employee Portal at `/portal/employee` covering all 8 requested sections, backed by realistic mock data.
- Scope displayed leads, site visits, and inventory to the signed-up employee's assigned district (via mock data filtering, not real auth-based row-level security).
- Support the full lead status pipeline (New → Contacted → Interested → Site Visit Scheduled → Site Visit Done → Negotiation → Booked → Lost) as client-side state transitions.
- Reuse existing design-system primitives (`StatCard`, `Badge`, `Tabs`, `PortalHeader`, `inputClass`/`selectClass`) rather than inventing new ones.

**Non-Goals:**
- No real backend, database, or API route — this change does not introduce persistence beyond `localStorage` (already used for auth) and in-memory React state. Data resets on page reload, same as every other portal in this repo today.
- No real-time features (no live notifications, no websocket).
- No actual telephony/WhatsApp integration — "Call" and "WhatsApp" actions use `tel:`/`https://wa.me/` links only.
- No admin-side "assign leads to employee" UI — this change is the employee-facing consumption side only. Lead assignment is represented as pre-assigned mock data.
- No role/permission enforcement beyond the existing `useAuth()` gate (any authenticated user could technically hit `/portal/employee`; we do not add server-side role checks since none exist elsewhere in the app).

## Decisions

**1. One dashboard component with internal tabs, not 8 routes.**
Mirrors `BrokerDashboard.jsx`. Alternative considered: separate routes per section (`/portal/employee/leads`, `/portal/employee/site-visits`, ...) — rejected because it doubles boilerplate (8 `page.js` files) for a demo-data feature and breaks from the existing single-route-per-role convention. Exception: none needed — `Tabs` already supports 8 entries responsively (it wraps/scrolls on mobile, same as broker's 5).

**2. New `lib/demoEmployeePortal.js` file, not additions to `lib/demoPortal.js`.**
`demoPortal.js` currently holds broker-prefixed exports (`BROKER_STATS`, `BROKER_LEADS`, ...). Employee data is a materially different shape (leads carry district/priority/next-follow-up/site-visit fields the broker leads don't). A dedicated file keeps naming clean (`EMPLOYEE_STATS`, `EMPLOYEE_LEADS`, `SITE_VISITS`, `FOLLOW_UPS`, `SALES_TARGET`, `PERFORMANCE`, `TERRITORY`) and avoids bloating one file. Follows the existing per-concern `lib/` file convention (`properties.js`, `locations.js`, `propertyContent.js` are already split by domain).

**3. Lead status is client-side `useState` on the dashboard, seeded from mock data.**
Matches how every other portal handles interaction (e.g., `AddPropertyWizard` builds objects only in memory). A status change (e.g., marking a site visit "Done") updates component state; it is not written back to `lib/`. This is called out explicitly in Non-Goals so it isn't mistaken for a persistence bug.

**4. District/territory scoping is a static field on the employee's mock profile, not derived from auth.**
The registration wizard captures `assignedDistrict` and stores it in the profile via `login(token, profile)` (existing `AuthContext` API — `updateProfile`/`login` already accept arbitrary profile shape). The employee dashboard page reads `user.assignedDistrict` from `useAuth()` and filters the mock `EMPLOYEE_LEADS` / territory inventory arrays by matching `district` field — same pattern as any other profile-driven personalization already in the codebase (e.g., `DEMO_USER.name` interpolated into `PortalHeader` greeting).

**5. Territory inventory reuses `PROPERTIES` from `lib/properties.js`, filtered by `location` containing the assigned city.**
Avoids duplicating property data. `PropertyGrid` (already used by `BrokerDashboard`) is reused for the Properties tab, keeping card design/consistent with the rest of the site (photos, price, location already on the `PROPERTIES` shape). Amenities/documents fields don't currently exist on `PROPERTIES` — Property detail already renders extended content via `lib/propertyContent.js`; the Properties tab links out to the existing `/property/[id]` page for full detail rather than re-implementing an amenities/documents view inline.

**6. New `EmployeeRegistrationWizard.jsx` follows the exact structural pattern of `BrokerRegistrationWizard.jsx`** (multi-step, shared `inputClass`/`selectClass`, calls `login()` on submit with a generated `SG-EMP-XXXXXX` id via `generateAccountId("EMP")` from `lib/auth.js`). District selection step uses `LOCATIONS` (city list) from `lib/locations.js` as the assignable-district source, since that's the only existing city taxonomy in the repo.

**7. Status pipeline and priority are rendered via the existing `Badge` component with a new tone mapping**, not a new visual primitive — consistent with `LEAD_TONE` in `BrokerDashboard.jsx`.

## Risks / Trade-offs

- **[Risk] Mock-only data means "assign lead to employee" has no real workflow** → Mitigation: explicitly scoped as Non-Goal in this change; call out in tasks.md as a natural follow-up change once a real backend exists.
- **[Risk] No server-side authorization means any signed-in user (any account type) can navigate to `/portal/employee`** → Mitigation: matches existing behavior of every other `/portal/*` route in this repo (no role gating exists anywhere today); not a regression introduced by this change. Flagged here so it isn't silently assumed to be secure.
- **[Risk] Eight dashboard sections in one client component could get large/hard to read** → Mitigation: split into one sub-component per tab (`OverviewTab`, `LeadsTab`, `SiteVisitsTab`, `FollowUpsTab`, `TerritoryPropertiesTab`, `SalesTab`, `PerformanceTab`, `TerritoryTab`) under `components/portal/employee/`, composed by `EmployeeDashboard.jsx` — mirrors how `BrokerDashboard.jsx` inlines tabs today but scales better at 8 sections instead of 5.
- **[Trade-off] Reusing `PROPERTIES` for territory inventory means "available units/plots" and "documents" fields aren't real** → Acceptable: same fidelity level as the rest of the demo site; a real inventory/units model is out of scope until a backend exists.

## Open Questions

None — proceeding with mock-data-driven implementation consistent with the rest of the codebase's current (backend-less) state.
