## ADDED Requirements

### Requirement: Admin shell with sidebar and topbar
The admin layout SHALL render a full-page shell comprising: a collapsible left sidebar (navigation), a top bar (page title, admin user name, logout), and a main content area. The public Navbar and Footer SHALL NOT appear within this shell.

#### Scenario: Admin views any admin page on desktop
- **WHEN** admin navigates to any `/admin/*` page on a `lg:` or wider viewport
- **THEN** the sidebar is visible on the left, topbar at the top, and main content fills the rest

#### Scenario: Admin views on mobile
- **WHEN** admin is on a viewport below `lg:`
- **THEN** the sidebar is hidden; a hamburger icon in the topbar opens a mobile drawer

### Requirement: Sidebar navigation links
The sidebar SHALL include navigation links to all major admin sections: Dashboard, Properties, Users, Projects, Leads, Freelancer & CP, Callbacks, and Settings. The active link SHALL be visually highlighted.

#### Scenario: Admin navigates to Properties
- **WHEN** admin clicks "Properties" in the sidebar
- **THEN** the route changes to `/admin/properties` and the Properties link is highlighted as active

### Requirement: Admin page header with refresh button
Every admin page SHALL render a page header containing: the page title, an optional breadcrumb, a description, and a Refresh button. The Refresh button SHALL re-fetch/re-read data for that page only.

#### Scenario: Admin clicks Refresh on Properties page
- **WHEN** admin clicks the Refresh button on `/admin/properties`
- **THEN** the properties data is re-read from localStorage and the table updates; a loading state is shown during the fetch

### Requirement: Responsive admin shell
The admin shell MUST be fully responsive: sidebar collapses to a drawer on mobile, content areas use mobile-first layouts.

#### Scenario: Admin collapses the sidebar on desktop
- **WHEN** admin clicks the collapse toggle
- **THEN** the sidebar narrows to icon-only view and the content area expands
