# Simnani Estate — Full Application Brief for QA/Testing

> Purpose: this document is written for an automated or manual testing agent/bot to exercise the Simnani Estate web app end-to-end. It describes every route, role, API, data model, and — critically — which "features" are real (backed by MongoDB) versus static/stub demo behavior that will always "succeed" without persisting anything. Testing purpose only — no production secrets are included.

Stack: Next.js 16 (App Router), React 19, Tailwind v4, MongoDB (Mongoose), Cloudflare R2 for media uploads. JavaScript only (no TypeScript).

---

## 1. Public Pages (no login required)

| URL | Notes |
|---|---|
| `/` | Homepage |
| `/about`, `/help`, `/services`, `/pricing` | Static info pages |
| `/legal`, `/legal/privacy-policy`, `/legal/terms-conditions` | Legal pages |
| `/buy`, `/sell`, `/rent`, `/lease` | Transaction-type listing pages |
| `/commercial`, `/commercial/[category]` | Commercial listings (dynamic category) |
| `/farming`, `/farming/[category]` | Farmland listings |
| `/industrial`, `/industrial/[category]` | Industrial listings |
| `/invest`, `/invest/[category]` | Investment listings |
| `/seized-property`, `/seized-property/[category]` | Seized/distressed property listings |
| `/properties` | Generic search/listing page |
| `/property/[id]` | Property detail page (cached 60s) |
| `/property/[id]/enquire` | Enquiry form (see §7 — **stub, does not persist**) |
| `/property/[id]/schedule-visit` | Schedule visit form (see §7 — **stub**) |
| `/projects`, `/projects/[id]` | Developer project listings + detail |
| `/projects/[id]/enquire`, `/projects/[id]/schedule-visit` | Same stubs as above, for projects |
| `/agent/[accountId]` | Public broker profile page |
| `/request-callback` | Callback request form (see §7 — **stub**) |
| `/auth` | Login |
| `/auth/register` | Account-type picker |
| `/auth/register/broker`, `/buyer`, `/common-person`, `/employee`, `/freelancer`, `/investor` | Per-role registration wizards |

## 2. Logged-in User Pages

Require a valid `se_session` cookie (see §3 for how to obtain one).

| URL | Notes |
|---|---|
| `/account`, `/account/notifications`, `/account/privacy`, `/account/support` | Self-service account pages (notifications/support currently use **static demo data**, `lib/demoAccount.js`) |
| `/account/saved-properties` | Client-rendered saved listings |
| `/post-property` | Create a listing (real — posts to MongoDB) |
| `/post-property/edit/[id]` | Edit own listing |
| `/portal/broker`, `/portal/broker/add-property` | Broker portal |
| `/portal/common-person`, `/portal/investor`, `/portal/employee` | Other role portals (`/portal/employee` uses static demo data, `lib/demoEmployeePortal.js`) |
| `/portal/company-cp`, `/portal/field-cp`, `/portal/digital-cp` | Channel Partner portals (see §5 — **mixed real/demo data**) |
| `/portal/digital-cp/campaign/[projectId]` | Digital CP campaign detail |
| `/portal/listing/[id]` | Owner's view of their own listing |

A CP account can only open the portal matching its own `cpType` — the server bounces it to the correct `/portal/{cpType}-cp` otherwise.

## 3. Admin Panel

Base path `/admin`. Gated by a separate admin-only login — **not** the same auth system as regular users.

| URL | Notes |
|---|---|
| `/admin/login` | Admin login (single hardcoded admin identity via env vars, not a DB user) |
| `/admin/dashboard` | Landing page after login |
| `/admin/properties`, `/admin/properties/closed`, `/admin/properties/add`, `/admin/properties/edit/[id]`, `/admin/properties/[id]` | Property CRUD |
| `/admin/sg-properties`, `/admin/sg-users` | Secondary listings/users views |
| `/admin/users`, `/admin/users/[accountId]` | User management |
| `/admin/leads`, `/admin/interested`, `/admin/callbacks` | Lead/inquiry inboxes |
| `/admin/analytics` | GA4-backed analytics dashboard |
| `/admin/plans` | Subscription/plan management |
| `/admin/brokers`, `/admin/brokers/featured` | Broker directory / featured broker curation |
| `/admin/skills` | Freelancer skill taxonomy management |
| `/admin/freelancer-cp` (+ `/company`, `/digital`, `/field`, `/head-cp`, `/[cpType]/[accountId]`) | CP network management — **this is where "Head CP" functionality lives**; there is no separate Head CP login, it's just the admin panel |

---

## 4. Authentication — Two Completely Separate Systems

### 4a. Regular user auth (buyer/broker/investor/freelancer/common-person/employee)

- Real DB-backed opaque session token, stored in an httpOnly cookie `se_session` (30-day expiry), looked up against a `Session` Mongo collection, not a JWT.
- `localStorage` only caches `se_auth_user` (a JSON profile blob) for instant UI hydration — it is **not** authoritative; the app always re-validates via `GET /api/auth/me` and clears the cache on 401.
- Login methods:
  - **OTP login**: `POST /api/auth/send-otp` → `POST /api/auth/login`. ⚠️ **`OTP_LIVE = true` is hardcoded in `lib/otp.js` — real SMS OTPs are sent via a live SMS gateway.** A testing bot doing OTP login flows needs either (a) a way to receive the real SMS, or (b) someone to flip `OTP_LIVE` to `false` in `lib/otp.js` for the test run (when false, OTP verification accepts any code). OTPs are 5-minute TTL, max 5 verify attempts, hashed (SHA-256) at rest.
  - **Password login**: `POST /api/auth/login-password` (mobile + password).
  - **Password reset**: `POST /api/auth/reset-password`, OTP-gated.
  - First-time OTP login with an unrecognized mobile number **auto-creates** a minimal `common-person` account.
- **Registration wizards do not use OTP verification at all** — they're plain multi-step forms that create a `User` doc then log the user in directly. Account types: `buyer`, `broker`, `investor`, `freelancer`, `common-person`, `employee`.
  - Freelancer wizard has an extra first step: choosing CP type (`company` / `digital` / `field`), then skills.
  - Broker wizard has a conditional field: `reraNumber` required only if `reraRegistered = true`.
  - New freelancer/CP accounts get `cpApprovalStatus: "active"` by default — there is no pending-approval gate at signup; an admin can only later flip someone to `"hold"` (which blocks portal access and shows a "CP under review" modal).
  - **No invitation code is required for self-registration** — the `InvitationCode` model exists as a separate, admin-issued onboarding aid only.

### 4b. Admin auth — entirely separate

- `POST /api/admin/login` checks a single hardcoded identity from env vars (`ADMIN_EMAIL` + bcrypt `ADMIN_PASSWORD_HASH`) — **there is no admin row in the database.**
- On success, sets a signed (HMAC-SHA256, timing-safe compare) cookie `se_admin_session`, 12-hour expiry.
- Every `/api/admin/*` route (and shared CP routes that accept admin override) check this cookie server-side via `isAdminRequest()`.
- **"Head CP" has no login of its own** — it is simply the admin panel viewed at `/admin/freelancer-cp/head-cp`. There is no `head` value in the CP-type enum (only `company`/`digital`/`field`).

---

## 5. Channel Partner (CP) Hierarchy — verified against code

Strict top-down chain: **Head CP (= admin panel) → Company CP → Field CP or Digital CP.**

- **Property assignment** (`models/Assignment.js`, `POST /api/assignments`):
  - `level: "head-to-company"` — only creatable by an authenticated admin request. This is "Head CP hands a property to a Company CP."
  - `level: "company-to-field"` / `"company-to-digital"` — creatable by a logged-in Company CP, or by an admin acting on a Company CP's behalf. If a `parentAssignmentId` is supplied, the server verifies the parent really was a `head-to-company` assignment addressed to that same Company CP — a Company CP cannot delegate a property it was never given.
- **Lead routing** (`models/CpLead.js`, `/api/cp-leads`):
  - Only a Digital or Field CP can create a lead; it starts at `routingStage: "<cpType>-cp"`, `forwarded: false`.
  - Visibility: admin sees everything; a CP sees its own submitted leads; a Company CP sees leads from Field/Digital CPs it has an active delegation (`Assignment`) relationship with.
  - Every lead is described in the Head CP UI itself as landing there first and never skipping straight to Field/Digital — matches the Assignment-level ordering above.
- **Commission**: created/updated when a lead is marked Converted (`models/Commission.js`); admin approves/holds via `/admin` → Commissions-adjacent flows and `/api/commissions`.

**⚠️ Important testing caveat — mixed real/demo data on CP dashboards:** `/portal/field-cp` and `/portal/digital-cp` render most of their stats/leads/network/commissions/campaign-video widgets from **static fixtures in `lib/demoPortal.js`** (`CP_STATS`, `CP_LEADS`, `CP_COMMISSIONS`, `CP_NETWORK`, `CP_PROMOTION_ASSETS`, `CP_CAMPAIGN_VIDEOS`, `CP_FIELD_ACTIVITY_TODAY`, `CP_DIGITAL_CAMPAIGN_JOINS`) — **not** live queries. Only: (a) "my listings" on these portals, and (b) Field CP's own site-visit log, and (c) Company CP's "network" tab, hit real MongoDB. A test bot should cross-check numbers against the actual API (`/api/cp-leads`, `/api/commissions`, `/api/assignments`, `/api/site-visits`) rather than trusting what's rendered on these dashboards.

---

## 6. Property Listings

- `lib/properties.js` is a large **static demo catalog** (hardcoded ids like `buy-1`, `invest-2`, Unsplash images) that is merged into every live query result.
- `lib/propertiesServer.js` is the real data layer: fetches from MongoDB's `Property` collection and merges with the static catalog (a live DB doc wins if its `id` collides with a static one). It also synthesizes pseudo-properties from `lib/projects.js` (developer projects).
- **Practical implication for testing**: demo listings never disappear from listing pages even after you mark a real listing "Closed"/"Sold" — don't assume a listing page's item count reflects only DB state.
- Property `type` (section): `buy, sell, rent, invest, commercial, farming, industrial, lease, seized-property`. `purpose` (sale/rent/lease) is independent — e.g. a property filed under "Commercial" can still appear on `/rent` if its `purpose` is rent.
- Posting a property (`/post-property`, `POST /api/properties` or `PUT /api/properties/[id]` for edits) is **real** — persists to MongoDB. Media uploads go through `POST /api/upload`, which issues a presigned Cloudflare R2 URL (jpeg/png/webp/mp4/webm/mov only).
- Property statuses: `Active / Pending Review / Rejected / Closed / Sold`.

---

## 7. Lead-Capture Forms — Real vs. Stub (important!)

| Form | Where | Backend call? |
|---|---|---|
| **Contact form** (home page "Contact Us" section) | `/` | ✅ Real — `POST /api/contact-inquiry`, persists to `ContactInquiry` collection, visible to admin |
| **Enquiry form** | `/property/[id]/enquire`, `/projects/[id]/enquire` | ❌ **Stub** — `setTimeout`, fabricates a fake enquiry ID client-side, nothing persisted |
| **Schedule Visit form** | `/property/[id]/schedule-visit`, `/projects/[id]/schedule-visit` | ❌ **Stub** — same pattern, nothing persisted |
| **Request Callback form** | `/request-callback` | ❌ **Stub** — same pattern, nothing persisted |

**Testing implication**: a bot should not expect Enquiry/Schedule-Visit/Callback submissions to ever appear in the admin panel or database — they will always show a "success" UI state regardless of backend health. Only the home-page Contact form is a genuine integration test of the backend.

---

## 8. Data Models (MongoDB / Mongoose, `models/*.js`)

- **User** — accountId, fullName, mobile, email, password(hidden), city/state, `cpType` (company/digital/field), `cpApprovalStatus` (active/hold), `accountType` (buyer/broker/investor/freelancer/common-person/employee), status, reraNumber (broker), plan (free/standard/premium) + planStatus/limit/expiry, savedProperties[], skills[] (freelancer), isFeaturedBroker.
- **Property** — id, title, type, category, price, location/city, beds/baths/halls, area, status (Active/Pending Review/Rejected/Closed/Sold), ownerId, postedByRole, large set of listing-detail fields (furnishing, parking, facing, floor, gallery images, video, contact info).
- **Lead** — general sales lead (name, phone, property, status: New/Contacted/Site Visit).
- **CpLead** — CP-specific lead with `routingStage` and `forwarded` flag driving the Head→Company→Field/Digital chain.
- **Assignment** — the property-forwarding record (`level`: head-to-company / company-to-field / company-to-digital), with `parentAssignmentId` chaining.
- **Client** — converted/managed client record.
- **Commission** — amount, `approvalStatus` (Pending/Approved/On Hold), tied to a lead + CP account.
- **ContactInquiry** — the one real lead-capture form's backing collection.
- **SiteVisit** — Field CP visit log (Scheduled/Moving/Visit Done/No Show), with live photos and follow-ups.
- **AdLink** — Digital CP's trackable campaign links.
- **CampaignVideo** — Digital CP ad creative under moderation (Pending Review/Approved/Suggested Edit/Rejected).
- **InvitationCode** — admin-issued onboarding codes (not required for self-registration).
- **Subscription** — plan purchase requests (Pending/Approved/Hold/Rejected).
- **SkillCategory**, **Otp**, **Session** — supporting collections.

---

## 9. Environment / Config Notes for Test Setup

- MongoDB: `MONGODB_URI` env var (falls back to local `mongodb://127.0.0.1:27017/simnani_estates` if unset).
- Media uploads: Cloudflare R2 (`R2_*` env vars) — only jpeg/png/webp/mp4/webm/mov accepted by `/api/upload`.
- SMS OTP: live gateway (apitxt.com) via `OTP_GATEWAY_*` env vars; `OTP_LIVE = true` hardcoded in `lib/otp.js` — **flip to `false` for automated OTP-login testing** so any code is accepted, or arrange real SMS receipt.
- Admin credentials: `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` (bcrypt) + `ADMIN_SESSION_SECRET` env vars — no DB admin account exists to query/reset.
- Analytics: GA4 env vars feed `/admin/analytics`.
- Demo/static data sources still live in the app alongside real DB data (don't mistake these for bugs): `lib/properties.js`, `lib/projects.js`, `lib/demoAccount.js`, `lib/demoPortal.js`, `lib/demoEmployeePortal.js`. Admin panel also seeds some client-side localStorage demo data on first load (`seedAdminData()`).

---

## 10. Suggested Test Coverage Priorities

1. **Auth flows** — OTP login, password login, password reset, each registration wizard (buyer/broker/investor/freelancer×3 cpTypes/common-person/employee), session persistence/expiry, logout.
2. **Admin login** — separate credential set, session expiry at 12h, lockout/invalid-credential handling.
3. **Property lifecycle** — post (all sections/purposes), edit, mark sold, admin approve/reject, verify it appears/disappears correctly across `/buy`, `/rent`, `/sell`, `/invest`, category pages, and `/property/[id]`.
4. **CP hierarchy** — as admin, assign a property head→company; as Company CP, delegate it to a Field or Digital CP; confirm a Field/Digital CP who was *not* delegated the property cannot see it. Submit a CP lead and confirm routingStage transitions and visibility rules across roles.
5. **Forms** — confirm the home Contact form round-trips to `/api/admin/interested` or `/admin/leads`; confirm Enquiry/Schedule-Visit/Callback forms show success UI but intentionally do **not** create any backend record (this is expected current behavior, not a bug to report unless the user says otherwise).
6. **Role-based access control** — attempt cross-role portal access (e.g., Field CP account hitting `/portal/digital-cp` URL directly) and confirm bounce-back; attempt unauthenticated access to `/post-property`, `/portal/*`, `/account`, `/admin/*`.
7. **Responsive/UI** — all pages at 375px / 768px / 1440px per the project's design system (dark navy/gold theme, `font-display` headings, `tracked-label` eyebrows).
