## 1. Mock Data Layer

- [x] 1.1 Create `lib/demoEmployeePortal.js` with `EMPLOYEE_STATS` (overview KPIs), `EMPLOYEE_LEADS` (customer, phone, property, source, date, status, district, priority, lastFollowUp, nextFollowUp, notes[]), `SITE_VISITS` (id, leadId, customer, property, date, time, status, attended, feedback, nextAction), `SALES_TARGET` (monthlyTarget, achieved), `PERFORMANCE` (month, leads, contacted, siteVisits, completedVisits, negotiations, bookings, salesValue, conversionRate), and `TERRITORY` (district, cities[], projects[])
- [x] 1.2 Ensure `EMPLOYEE_LEADS` and `TERRITORY` use district values that match existing `LOCATIONS` city names in `lib/locations.js` so filtering works end-to-end
- [x] 1.3 Add a `district` field derivation for territory property filtering (map `PROPERTIES[].location` city to `TERRITORY.district`)

## 2. Employee Registration

- [x] 2.1 Add "Employee" entry to `ACCOUNT_TYPES` in `components/auth/AccountTypeSelect.jsx` (icon from `react-icons/md` or `react-icons/bi`, e.g. `MdBadge` or `BiIdCard`)
- [x] 2.2 Create `components/auth/EmployeeRegistrationWizard.jsx` modeled on `BrokerRegistrationWizard.jsx`: steps for personal details (name, mobile, email), employee code, and district/territory assignment (select from `LOCATIONS`)
- [x] 2.3 Use shared `inputClass`/`selectClass` from `components/auth/inputStyles.js` for all fields; validate mobile via `isMobileValid` from `lib/auth.js`
- [x] 2.4 Generate employee account ID via `generateAccountId("EMP")` on submit; call `login(token, profile)` with `accountType: "employee"`, `assignedDistrict`, and entered fields
- [x] 2.5 Create `app/auth/register/employee/page.js` rendering `EmployeeRegistrationWizard`
- [x] 2.6 On successful submit, redirect to `/portal/employee` via `useRouter().push`

## 3. Employee Dashboard Shell

- [x] 3.1 Create `app/portal/employee/page.js` following `app/portal/broker/page.js` pattern: `PortalHeader` (eyebrow "Employee Portal", title with employee name from `useAuth()`, subtitle mentioning assigned district) + `EmployeeDashboard`
- [x] 3.2 Create `components/portal/EmployeeDashboard.jsx` using the existing `Tabs` component with 8 tabs: Overview, My Leads, Site Visits, Follow-ups, Properties, Sales, Performance, My Territory
- [x] 3.3 Wire `EmployeeDashboard` to accept `stats, leads, siteVisits, salesTarget, performance, territory, properties` props from the page and manage lead/visit status changes via local `useState`
- [x] 3.4 Filter `leads` and `properties` passed into the dashboard by the employee's `assignedDistrict` (read from `useAuth().user`) at the page level before rendering

## 4. Overview Tab

- [x] 4.1 Create `components/portal/employee/OverviewTab.jsx` rendering `StatCard` tiles for all 9 KPIs from the proposal (assigned leads, new leads, follow-ups due today, site visits scheduled, site visits completed, interested customers, bookings, pending follow-ups, month's sales value), responsive grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`
- [x] 4.2 Derive counts (new leads, follow-ups due today, etc.) from `leads`/`siteVisits` state rather than hardcoding, so KPI tiles reflect live status changes

## 5. My Leads Tab

- [x] 5.1 Create `components/portal/employee/LeadsTab.jsx` rendering lead cards (customer, phone, property, source, date, last/next follow-up, priority) using `Badge` for status and priority
- [x] 5.2 Add a status-change control (select or button group) per lead implementing the pipeline New → Contacted → Interested → Site Visit Scheduled → Site Visit Done → Negotiation → Booked → Lost, calling a status-update handler passed from `EmployeeDashboard`
- [x] 5.3 Add a new `LEAD_TONE`/`PRIORITY_TONE` mapping to `Badge` tones for the 8 statuses and priority levels (reuse existing `Badge` tones: gold/muted/success, extend only if a tone is missing)

## 6. Site Visit Management Tab

- [x] 6.1 Create `components/portal/employee/SiteVisitsTab.jsx` with a "Today's Site Visits" section listing visits for the current date sorted by time
- [x] 6.2 Add a "Schedule Visit" form/modal: select customer (from leads), select property, date/time picker, submit adds to `siteVisits` state with status "Scheduled"
- [x] 6.3 Add per-visit outcome controls: mark Done, toggle attended/no-show, feedback textarea, next-action input; update visit state on save
- [x] 6.4 When a visit is marked Done, optionally prompt to advance the linked lead's status (Site Visit Done → Negotiation) for continuity with the Leads tab

## 7. Follow-ups Tab

- [x] 7.1 Create `components/portal/employee/FollowUpsTab.jsx` listing leads whose `nextFollowUp` date is today, as a responsive table on desktop / stacked cards on mobile
- [x] 7.2 Add "Call" (`tel:` link) and "WhatsApp" (`https://wa.me/<digits>`) quick actions per row using phone number from the lead
- [x] 7.3 Add "Add Note" control (textarea + save) appending to the lead's `notes[]`
- [x] 7.4 Add "Schedule Follow-up" control (date/time input) updating the lead's `nextFollowUp`

## 8. Properties (Territory Inventory) Tab

- [x] 8.1 Create `components/portal/employee/TerritoryPropertiesTab.jsx` reusing `PropertyGrid` filtered to properties in the employee's assigned district
- [x] 8.2 Add a "Share" action per property card (native Web Share API with `navigator.share` where available, falling back to copying a link) — implement as a small helper, not a new dependency

## 9. Sales / Booking Tab

- [x] 9.1 Create `components/portal/employee/SalesTab.jsx` with `StatCard`s for total bookings, pending bookings, booking amount, sale value, commission
- [x] 9.2 Add a target-vs-achieved progress section (monthly target, achieved amount, `%` computed as achieved/target, rendered as a labeled progress bar using `bg-gold-400` fill on `bg-navy-800` track)

## 10. Performance Tab

- [x] 10.1 Create `components/portal/employee/PerformanceTab.jsx` displaying the current month's leads, contacted, site visits, completed visits, negotiations, bookings, sales value, and conversion rate as a stat grid
- [x] 10.2 Derive conversion rate display as `(bookings / leads * 100).toFixed(1)%` when computed from live counts, falling back to the mock `PERFORMANCE.conversionRate` field otherwise

## 11. My Territory Tab

- [x] 11.1 Create `components/portal/employee/TerritoryTab.jsx` showing assigned district, cities/areas list, assigned projects list, leads-in-territory count, upcoming site visits count, and available inventory count

## 12. Responsiveness & Design System Pass

- [x] 12.1 Verify all new components use only theme tokens (`bg-navy-*`, `text-cream`, `text-gold-*`, `border-navy-700/60`) — no raw hex
- [x] 12.2 Verify `tracked-label` used for all badges/eyebrows/section labels and `font-display` used for headings and monetary values
- [x] 12.3 Verify all icons use `react-icons` (`md`/`fi`/`bi`/`fa6`), no raw SVGs
- [x] 12.4 Manually check `/portal/employee` and `/auth/register/employee` at 375px, 768px, and 1440px widths; confirm no horizontal overflow and touch targets ≥44px
- [x] 12.5 Run `npm run lint` and fix any issues introduced by new files

## 13. Verification

- [x] 13.1 Walk through: sign up as Employee → assign district → land on `/portal/employee` → verify leads/properties are scoped to that district
- [x] 13.2 Walk through: advance a lead through the full status pipeline and confirm Overview/Performance tiles update accordingly
- [x] 13.3 Walk through: schedule a site visit, mark it Done with feedback, confirm it reflects in Today's Site Visits and Overview counts
- [x] 13.4 Walk through: add a follow-up note and reschedule, confirm it moves off "Today's Follow-ups" once rescheduled to a future date
