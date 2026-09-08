## ADDED Requirements

### Requirement: Properties listing with AdminTable
The system SHALL render all properties (seeded from `lib/properties.js`, stored in `se_admin_properties`) in the AdminTable component at `/admin/properties`. Columns SHALL include: Image thumbnail, Title, Type (badge), Location, Price, Beds/Baths/Area, Status (badge), Featured (toggle), and Actions.

#### Scenario: Admin opens properties page
- **WHEN** admin navigates to `/admin/properties`
- **THEN** all properties are displayed in the AdminTable with the defined columns

### Requirement: Property status management
Each property SHALL have a status field: "Active", "Pending Review", or "Rejected". The status SHALL be displayed as a color-coded badge and be editable via an inline select or the edit dialog.

#### Scenario: Admin changes property status to Rejected
- **WHEN** admin opens a property's edit dialog and sets status to "Rejected"
- **THEN** the status badge updates to red "Rejected" immediately after save and a toast fires

### Requirement: Featured property toggle
Each property row SHALL include a Switch (toggle) for the `featured` boolean field. Toggling SHALL immediately persist the change and update the public-facing `featured` indicator.

#### Scenario: Admin enables featured for a property
- **WHEN** admin flips the Featured switch on a non-featured property
- **THEN** `featured` becomes `true`, the switch shows enabled state, a toast "Featured enabled" fires

#### Scenario: Admin disables featured for a property
- **WHEN** admin flips the Featured switch on a featured property
- **THEN** `featured` becomes `false`, a toast "Featured disabled" fires

### Requirement: Property search and filtering
The properties page SHALL support: search by title/location, filter by type (buy/sell/rent/invest/commercial/farming/industrial/lease/seized), filter by status, filter by featured.

#### Scenario: Admin filters by type "rent"
- **WHEN** admin selects "rent" from the Type filter
- **THEN** only rental properties appear in the table

### Requirement: Create property (admin)
The admin SHALL be able to create a new property via a dialog form with fields: title, type, price, location, beds, baths, area, image URL, status, featured. On submit, the property is added to `se_admin_properties` and appears at the top of the table.

#### Scenario: Admin creates a new property
- **WHEN** admin clicks "Add Property", fills the form, and submits
- **THEN** the new property appears in the table immediately and a success toast fires

### Requirement: Edit property
The admin SHALL be able to edit any property via an edit dialog pre-filled with the property's current values. On save, the row updates immediately.

#### Scenario: Admin edits a property's price
- **WHEN** admin opens edit dialog, changes the price, and saves
- **THEN** the updated price appears in the table row immediately and a success toast fires

### Requirement: Delete property
The admin SHALL be able to delete a property after confirming a deletion dialog. The row is removed immediately from the table.

#### Scenario: Admin deletes a property
- **WHEN** admin clicks Delete, confirms in the dialog
- **THEN** the property row is removed and a success toast fires

### Requirement: Clickable property row → detail view
Clicking a property row SHALL navigate to `/admin/properties/[id]` which shows a full read-only detail view of the property.

#### Scenario: Admin clicks on a property row
- **WHEN** admin clicks on the property title or row
- **THEN** navigation goes to `/admin/properties/[id]` showing all property details

### Requirement: Property detail admin view
The property detail page SHALL display all property fields, the property image, and action buttons (Edit, Delete, Back).

#### Scenario: Admin views property detail
- **WHEN** admin is at `/admin/properties/[id]`
- **THEN** all fields are shown including image, status, featured flag, and edit/delete actions

### Requirement: Property sorting and pagination
The properties table SHALL support sorting by: title (A-Z), price (ascending/descending), date added. Pagination SHALL default to 10 rows per page.

#### Scenario: Admin sorts properties by price descending
- **WHEN** admin clicks the Price column header twice
- **THEN** properties are sorted from highest to lowest price
