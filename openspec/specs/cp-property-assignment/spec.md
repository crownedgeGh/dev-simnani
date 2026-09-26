## Purpose

TBD - created by syncing change `cp-hierarchy-system`. Update this Purpose section with a short description of the cp-property-assignment capability.

## Requirements

### Requirement: Head CP assigns a property to a Company CP
Head CP (the admin panel user) SHALL be able to assign any existing property/project to a single Company CP directly from the properties list, creating a `cpAssignment` record at level `head-to-company`.

#### Scenario: Assigning an unassigned property
- **WHEN** Head CP clicks "Assign to Company CP" on a property row in `/admin/properties` and selects a Company CP from the active CP network
- **THEN** a `cpAssignment` record is created with `level: "head-to-company"`, `propertyId`, `assignedToCpType: "company"`, `assignedToName`, `status: "Assigned"`, and the property row shows an "Assigned to <Company CP name>" badge

#### Scenario: Re-assigning an already-assigned property
- **WHEN** Head CP opens the assignment picker on a property that already has an active `head-to-company` assignment
- **THEN** the picker shows the current Company CP as pre-selected and, on confirming a different Company CP, the previous assignment is marked superseded and a new `cpAssignment` record is created

#### Scenario: No Company CP exists yet
- **WHEN** Head CP opens the assignment picker and there are no active Company CP partners in the network
- **THEN** the picker shows an empty state directing Head CP to add a Company CP partner first, and the assign action is disabled

### Requirement: Company CP delegates an assigned project to a Field CP or Digital CP
A Company CP SHALL be able to view every property assigned to them by Head CP and delegate each one to exactly one Field CP or one Digital CP from their own network, creating a `cpAssignment` record at level `company-to-field` or `company-to-digital` linked via `parentAssignmentId`.

#### Scenario: Delegating to a Field CP
- **WHEN** Company CP opens an assigned project and chooses "Delegate to Field CP", selecting a specific Field CP partner
- **THEN** a `cpAssignment` record is created with `level: "company-to-field"`, `parentAssignmentId` pointing at the Head CP → Company CP assignment, `assignedToCpType: "field"`, `assignedToName`, and `status: "Assigned"`

#### Scenario: Delegating to a Digital CP
- **WHEN** Company CP opens an assigned project and chooses "Delegate to Digital CP", selecting a specific Digital CP partner
- **THEN** a `cpAssignment` record is created with `level: "company-to-digital"`, `parentAssignmentId` pointing at the Head CP → Company CP assignment, `assignedToCpType: "digital"`, `assignedToName`, and `status: "Assigned"`

#### Scenario: Project not yet delegated
- **WHEN** Company CP views their "Assigned Projects" list and a project has no `company-to-field`/`company-to-digital` child assignment yet
- **THEN** the project shows a "Not yet delegated" status alongside the Delegate action

### Requirement: Field CP and Digital CP see only what was delegated to them
A Field CP or Digital CP SHALL only see projects in their "Assigned Projects" view where a `cpAssignment` record names them as `assignedToName` at level `company-to-field` or `company-to-digital` respectively.

#### Scenario: Field CP views assigned projects
- **WHEN** a Field CP opens their dashboard's "Assigned Projects" view
- **THEN** only properties with an active `company-to-field` assignment naming that Field CP are listed

#### Scenario: Digital CP views assigned projects
- **WHEN** a Digital CP opens their dashboard's "Assigned Projects" view
- **THEN** only properties with an active `company-to-digital` assignment naming that Digital CP are listed

#### Scenario: Project delegated to a different partner
- **WHEN** a Field CP or Digital CP is not the `assignedToName` on any `cpAssignment` for a given property
- **THEN** that property does not appear anywhere in their dashboard
