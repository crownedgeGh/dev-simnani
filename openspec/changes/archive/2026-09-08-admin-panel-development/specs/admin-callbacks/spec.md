## ADDED Requirements

### Requirement: Callback requests listing
The system SHALL display all callback request submissions from `se_admin_callbacks` at `/admin/callbacks`. Columns: Request ID, Name, Phone, Email, Property/Topic of Interest, Message, Submitted Date, Status (badge: Pending / In Progress / Handled), Assigned To, Admin Notes, Actions.

#### Scenario: Admin opens callbacks page
- **WHEN** admin navigates to `/admin/callbacks`
- **THEN** all callback requests are shown in the table

### Requirement: Mark callback as handled
Admin SHALL mark a callback request as "Handled" via an action button. Status SHALL update immediately.

#### Scenario: Admin marks a callback as handled
- **WHEN** admin clicks "Mark Handled" on a callback row
- **THEN** status changes to "Handled", badge updates, and toast fires

### Requirement: Add admin notes to a callback
Admin SHALL add internal notes to a callback request via an edit dialog.

#### Scenario: Admin adds a note
- **WHEN** admin opens edit dialog, types a note, and saves
- **THEN** the note is stored and visible in the row

### Requirement: Assign callback to a team member
Admin SHALL assign a callback to a team member (employee name) for follow-up.

#### Scenario: Admin assigns a callback
- **WHEN** admin enters an assignee name and saves
- **THEN** the "Assigned To" column updates immediately

### Requirement: Filter callbacks by status
Admin SHALL filter callbacks by status: Pending, In Progress, Handled.

#### Scenario: Admin views only pending callbacks
- **WHEN** admin selects "Pending" filter
- **THEN** only pending callbacks are shown

### Requirement: Seed demo callback data
On first admin load, the system SHALL seed 5 demo callback requests into `se_admin_callbacks`.

#### Scenario: First admin login
- **WHEN** `se_admin_callbacks` is absent from localStorage
- **THEN** 5 demo callback records are created and the table is pre-populated
