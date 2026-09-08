## ADDED Requirements

### Requirement: Axios instance with localStorage adapter
The system SHALL provide `lib/adminAxios.js` — an Axios instance with request interceptors that translate HTTP method + URL into localStorage CRUD operations. No real HTTP requests are made.

Routing table:
- `GET /admin/:collection` → `JSON.parse(localStorage.getItem('se_admin_:collection')) ?? []`
- `POST /admin/:collection` → append item + save
- `PUT /admin/:collection/:id` → find by `id` + replace + save
- `PATCH /admin/:collection/:id` → find by `id` + merge + save
- `DELETE /admin/:collection/:id` → filter out + save

#### Scenario: GET request for properties
- **WHEN** code calls `adminAxios.get('/admin/properties')`
- **THEN** the interceptor returns the parsed `se_admin_properties` localStorage value as `{ data: [...] }`

#### Scenario: POST request creates a property
- **WHEN** code calls `adminAxios.post('/admin/properties', newProperty)`
- **THEN** the interceptor appends `newProperty` to the array and saves it to `se_admin_properties`

#### Scenario: DELETE request removes a property
- **WHEN** code calls `adminAxios.delete('/admin/properties/buy-1')`
- **THEN** the interceptor filters out the item with `id === "buy-1"` and saves

### Requirement: LocalStorage collection keys
The data layer SHALL use the following localStorage keys:

| Collection | Key |
|---|---|
| properties | `se_admin_properties` |
| users | `se_admin_users` |
| projects | `se_admin_projects` |
| leads | `se_admin_leads` |
| callbacks | `se_admin_callbacks` |
| freelancerLeads | `se_admin_freelancer_leads` |
| freelancerProperties | `se_admin_freelancer_properties` |
| cpLeads | `se_admin_cp_leads` |
| cpNetwork | `se_admin_cp_network` |
| campaignVideos | `se_admin_campaign_videos` |
| commissions | `se_admin_commissions` |
| promotionAssets | `se_admin_promotion_assets` |
| activityLog | `se_admin_activity_log` |

#### Scenario: Admin data is isolated
- **WHEN** code reads `se_admin_properties`
- **THEN** it does not affect or read from the public `PROPERTIES` array import

### Requirement: Data seeding on first load
The system SHALL seed all localStorage collections from the corresponding static lib arrays on first admin load (when the key is absent or null). Seeding SHALL occur in `lib/adminStorage.js` via a `seedAdminData()` function called once in the admin layout.

#### Scenario: Fresh browser — no localStorage data
- **WHEN** admin visits the panel for the first time with empty localStorage
- **THEN** all `se_admin_*` keys are populated from the static lib data and the tables show populated data

#### Scenario: Subsequent visits
- **WHEN** admin revisits after previous session
- **THEN** existing localStorage data is used as-is without overwriting admin changes

### Requirement: Activity log
Every successful CRUD operation SHALL append an entry to `se_admin_activity_log` with shape `{ action, entityType, entityId, entityTitle, timestamp, adminEmail }`.

#### Scenario: Admin creates a project
- **WHEN** admin creates a new project
- **THEN** an entry `{ action: "created", entityType: "project", entityTitle: "...", ... }` is appended to the activity log

### Requirement: Instant UI update contract
All admin pages SHALL update their local React state immediately after a successful Axios adapter call — no page reload required. The Axios adapter response SHALL return the mutated data array so the caller can set state directly.

#### Scenario: Property deleted
- **WHEN** `adminAxios.delete('/admin/properties/buy-1')` resolves
- **THEN** the page removes the property from its local state array immediately; no refresh required
