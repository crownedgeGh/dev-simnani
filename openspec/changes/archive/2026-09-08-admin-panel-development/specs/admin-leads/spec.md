## ADDED Requirements

### Requirement: Unified leads table
The system SHALL display a unified view of all leads from all portals at `/admin/leads`: freelancer leads, CP leads (all three CP types), and employee-assigned leads. Each lead row SHALL include: Lead ID, Customer, Phone, Project/Property, Source, Submitted By (portal type), Date, Status (badge), Assigned To, Commission, Actions.

#### Scenario: Admin opens leads page
- **WHEN** admin navigates to `/admin/leads`
- **THEN** all leads from all portals are shown in a single table

### Requirement: Lead source filtering
Admin SHALL filter leads by source portal: Freelancer, CP-Digital, CP-Field, CP-Company, Employee.

#### Scenario: Admin filters by CP-Digital leads
- **WHEN** admin selects "CP-Digital" from the Source filter
- **THEN** only digital CP leads are shown

### Requirement: Lead status pipeline management
Admin SHALL change any lead's status via an inline select or edit dialog. Valid statuses (from the portal data): New, Contacted, Qualified, Site Visit Scheduled, Site Visit Completed, Converted, Lost, Pending Verification, Verified, Assigned.

#### Scenario: Admin moves a lead to "Site Visit Scheduled"
- **WHEN** admin changes status to "Site Visit Scheduled"
- **THEN** status badge updates and toast fires

### Requirement: Lead assignment
Admin SHALL be able to assign a lead to an employee or Field CP from a dropdown.

#### Scenario: Admin assigns a lead to an employee
- **WHEN** admin selects an employee from the "Assign To" dropdown
- **THEN** `assignedTo` updates in the table and toast fires

### Requirement: Lead search
Admin SHALL search leads by customer name or phone number.

#### Scenario: Admin searches by customer name
- **WHEN** admin types "Karan" in search
- **THEN** only leads with customer name containing "Karan" are shown

### Requirement: Lead detail view
Clicking a lead row SHALL open a detail panel (slide-over or dialog) with full lead information including notes, follow-up history, and site visit info.

#### Scenario: Admin clicks a lead row
- **WHEN** admin clicks on any lead row
- **THEN** a detail panel opens with all lead information

### Requirement: Commission status in leads table
Leads with a commission value SHALL show the commission amount and approval status inline.

#### Scenario: Admin views a converted lead
- **WHEN** a lead has status "Converted" and a commission value
- **THEN** commission amount and approval status are visible in the row
