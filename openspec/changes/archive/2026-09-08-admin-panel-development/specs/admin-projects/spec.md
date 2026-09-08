## ADDED Requirements

### Requirement: Projects listing
The system SHALL display all projects (seeded from `lib/projects.js`, stored in `se_admin_projects`) in the AdminTable at `/admin/projects`. Columns: Image, Name, Location, Starting Price, Developer, Status (badge), Actions.

#### Scenario: Admin opens projects page
- **WHEN** admin navigates to `/admin/projects`
- **THEN** all projects are shown in the table

### Requirement: Create project
Admin SHALL create a new project via a dialog form with fields: name, location, starting price, developer, status (Under Construction / Ready to Move / Ready to Register / Possession Year), image URL.

#### Scenario: Admin creates a new project
- **WHEN** admin fills the form and clicks "Add Project"
- **THEN** the project appears in the table immediately and a success toast fires

### Requirement: Edit project
Admin SHALL edit a project's fields via an edit dialog pre-filled with current values.

#### Scenario: Admin edits project status
- **WHEN** admin opens edit dialog, changes status to "Ready to Move", saves
- **THEN** the status badge in the table updates immediately and toast fires

### Requirement: Delete project
Admin SHALL delete a project after confirming a deletion dialog. The row is removed immediately.

#### Scenario: Admin deletes a project
- **WHEN** admin confirms delete
- **THEN** the project row is removed and a success toast fires

### Requirement: Project status management
Project status SHALL be one of: "Under Construction", "Ready to Move", "Ready to Register", "Possession [Year]". Status SHALL display as a badge in the table.

#### Scenario: Admin views project statuses
- **WHEN** table loads
- **THEN** each project's status shows as a color-coded badge

### Requirement: Promotion assets association
For each project, admin SHALL be able to view associated promotion assets (photos, videos, brochure URL) from `se_admin_promotion_assets`. A "View Assets" action in the row opens a dialog listing the assets.

#### Scenario: Admin views assets for a project
- **WHEN** admin clicks "View Assets" on a project row
- **THEN** a dialog shows photos, video filenames, and brochure URL for that project
