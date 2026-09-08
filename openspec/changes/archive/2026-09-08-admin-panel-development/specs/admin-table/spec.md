## ADDED Requirements

### Requirement: Reusable AdminTable component with column config
The system SHALL provide a single `AdminTable` component accepting a `columns` prop (array of column config objects) and a `data` prop (array of row objects). All other table features (search, sort, filter, pagination, actions) SHALL be driven by the column config.

#### Scenario: Rendering a properties table
- **WHEN** `AdminTable` is passed `columns` with keys for title, type, price, status, featured and `data` from the properties array
- **THEN** a table renders with the correct columns, data rows, and header labels

### Requirement: Search
AdminTable SHALL include a search input that filters rows by matching the query against all string fields (or a configurable `searchKeys` prop).

#### Scenario: Admin searches for a property
- **WHEN** admin types "Villa" in the search input
- **THEN** only rows where title or location contains "Villa" (case-insensitive) are shown

### Requirement: Sorting
AdminTable SHALL support column-level ascending/descending sort toggled by clicking a column header that has `sortable: true`.

#### Scenario: Admin sorts by price ascending
- **WHEN** admin clicks the "Price" column header once
- **THEN** rows are sorted by price ascending; clicking again sorts descending

### Requirement: Filtering
AdminTable SHALL support a filter panel/dropdown for columns that have `filterOptions` defined in their config. Multiple filters SHALL be combinable (AND logic).

#### Scenario: Admin filters by property type "buy"
- **WHEN** admin selects "buy" from the Type filter
- **THEN** only rows with `type === "buy"` are displayed

### Requirement: Pagination
AdminTable SHALL paginate rows at a configurable `pageSize` (default 10). Page controls SHALL include prev/next and direct page number buttons.

#### Scenario: Admin navigates to page 2
- **WHEN** there are more than 10 rows and admin clicks "Next"
- **THEN** rows 11–20 are displayed

### Requirement: Row actions
AdminTable SHALL support an `actions` prop — an array of action definitions `{ label, icon, onClick, variant }`. Actions SHALL render in a per-row dropdown or inline buttons.

#### Scenario: Admin deletes a property row
- **WHEN** admin opens row actions and clicks "Delete"
- **THEN** a confirmation dialog appears; on confirm, the row is removed and a success toast fires

### Requirement: Toggle control in rows
AdminTable SHALL support a `toggle` column type that renders a Switch for boolean fields (e.g., `featured`). Toggling SHALL immediately call an `onToggle` callback and update the UI.

#### Scenario: Admin toggles featured status
- **WHEN** admin clicks the featured Switch for a property
- **THEN** the switch state updates immediately and a toast "Featured status updated" fires

### Requirement: Status badge
AdminTable SHALL support a `status` column type that renders a color-coded badge. Badge colors SHALL be driven by a `statusColors` prop map.

#### Scenario: Active property shows green badge
- **WHEN** a property has `status: "Active"`
- **THEN** the status cell renders a green badge labeled "Active"

### Requirement: Loading state
AdminTable SHALL show a skeleton loading state (shimmering placeholder rows) when a `loading` prop is true.

#### Scenario: Admin refreshes the properties page
- **WHEN** the Refresh button is clicked and data is being re-read
- **THEN** the table shows skeleton rows until data resolves

### Requirement: Empty state
AdminTable SHALL show a configurable empty state illustration and message when `data` is empty and `loading` is false.

#### Scenario: No properties match the search
- **WHEN** admin searches for a term with no matches
- **THEN** the table shows "No results found" message and a clear-filters CTA

### Requirement: Responsive card layout on mobile
Below the `lg:` breakpoint, AdminTable SHALL transform each row into a vertical card showing all key fields and action buttons. The card layout MUST maintain all information and actions available in the desktop table view.

#### Scenario: Admin views properties table on a 375px-wide phone
- **WHEN** viewport is below 1024px
- **THEN** each property renders as a card with title, price, status badge, featured toggle, and Edit/Delete buttons; no horizontal scrolling table is shown

### Requirement: Clickable row navigation
AdminTable SHALL support an `onRowClick` prop. When provided, clicking any non-action cell in a row SHALL trigger `onRowClick(row)`.

#### Scenario: Admin clicks a property row
- **WHEN** admin clicks anywhere on a property row (not on action buttons)
- **THEN** `onRowClick` is called with the property data and navigation to the detail page occurs
