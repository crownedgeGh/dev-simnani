## Why

Simnani Estate currently has portal dashboards for buyers, investors, brokers, freelancers and common-person accounts, but no way for an internal salesperson (a "District Executive") to manage assigned leads through to a booked sale. Leads today have nowhere to live once captured — there is no owner, no follow-up trail, no site-visit tracking, and no visibility into district-level performance. Without this, the business cannot delegate lead conversion to a distributed sales team or measure how well each district is performing.

## What Changes

- Add a new **Employee** account type to the sign-up flow (`AccountTypeSelect`), with its own registration wizard capturing name, mobile, email, assigned district/territory, and employee code.
- Add a new **Employee Portal** (`/portal/employee`) — a full CRM-style management dashboard, built as demo/mock-data-driven (consistent with the rest of the portal, which has no backend yet):
  - **Dashboard Overview**: KPI tiles (assigned leads, new leads, follow-ups due today, site visits scheduled/completed, interested customers, bookings, pending follow-ups, this month's sales value).
  - **My Leads**: leads scoped to the employee's assigned district, each with customer/property/source/status/priority/follow-up dates, and a status pipeline (New → Contacted → Interested → Site Visit Scheduled → Site Visit Done → Negotiation → Booked → Lost).
  - **Site Visit Management**: schedule a visit (customer + property + date/time), a "Today's Site Visits" list, and per-visit status updates (attended / no-show, feedback, next action).
  - **Follow-ups**: a "Today's Follow-ups" table with quick actions (Call, WhatsApp, Add Note, Reschedule).
  - **Properties (Territory Inventory)**: read-only list of properties/projects available in the employee's assigned district, with a "Share with customer" action.
  - **Sales / Booking**: booking counters, sale value, commission, and a monthly target vs. achieved tracker.
  - **Performance**: a monthly performance summary (leads, contacted, visits, negotiations, bookings, sales value, conversion rate).
  - **My Territory**: a summary of the employee's assigned district, cities/areas, projects and territory-wide stats.
- All new dashboard screens and the registration wizard are fully responsive (mobile/tablet/desktop) per project convention.

**BREAKING**: None. This is purely additive — no existing routes, components, or data shapes are modified.

## Capabilities

### New Capabilities
- `employee-registration`: Sign-up flow for the "Employee" account type — account type card, registration wizard, and account creation into the existing localStorage-based auth system.
- `employee-dashboard`: The Employee/District Executive management portal — leads, site visits, follow-ups, territory inventory, sales/booking, and performance reporting, scoped to the employee's assigned district.

### Modified Capabilities
(none — no existing spec files in `openspec/specs/`)

## Impact

- `components/auth/AccountTypeSelect.jsx` — add "Employee" option.
- `components/auth/EmployeeRegistrationWizard.jsx` (new) — registration wizard.
- `app/auth/register/employee/page.js` (new) — registration route.
- `app/portal/employee/page.js`, `app/portal/employee/site-visits/page.js` or equivalent (new) — portal route(s).
- `components/portal/EmployeeDashboard.jsx` (new) + supporting sub-components (new) — dashboard tabs/sections.
- `lib/demoEmployeePortal.js` (new) — mock data: assigned leads, site visits, follow-ups, territory inventory, sales/targets, performance.
- `lib/locations.js` — reused for district/city assignment; no shape change.
- `lib/properties.js` — reused (filtered by district/location) for territory inventory; no shape change.
- No backend/API changes — this repo has no server layer yet, so all data is static/mock and interactions are client-side state only (consistent with existing broker/freelancer portals).
