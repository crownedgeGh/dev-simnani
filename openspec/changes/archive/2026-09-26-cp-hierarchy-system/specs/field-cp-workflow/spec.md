## ADDED Requirements

### Requirement: Field CP schedules a site visit against an assigned project or lead
A Field CP SHALL be able to schedule a site visit for a property/lead that has been delegated to them, recording customer, date/time, and the linked `assignmentId` or `leadId`.

#### Scenario: Scheduling a visit for a delegated project
- **WHEN** a Field CP opens an assigned project and clicks "Schedule Site Visit", entering customer details and a date/time
- **THEN** a `cpSiteVisit` record is created linked to that project's assignment, with `status: "Scheduled"`

#### Scenario: Scheduling a visit for a delegated lead
- **WHEN** a Field CP opens a lead assigned to them (`routingStage: "field-cp"`) and clicks "Schedule Site Visit"
- **THEN** a `cpSiteVisit` record is created linked to that `leadId`, and the lead's `status` becomes `"Site Visit Scheduled"`

### Requirement: Field CP logs the outcome of a completed site visit
A Field CP SHALL be able to record the outcome of a scheduled site visit — attended or no-show, with free-text notes — which updates the linked lead's pipeline status.

#### Scenario: Visit attended
- **WHEN** a Field CP marks a scheduled site visit as "Attended" and adds notes
- **THEN** the `cpSiteVisit` record's `status` becomes `"Completed"`, the note is saved, and the linked lead's `status` becomes `"Site Visit Completed"`

#### Scenario: Customer no-show
- **WHEN** a Field CP marks a scheduled site visit as "No-show"
- **THEN** the `cpSiteVisit` record's `status` becomes `"No-show"`, and the linked lead remains at `"Site Visit Scheduled"` with a note flagging the no-show for follow-up

### Requirement: Field CP advances a lead through negotiation to conversion
A Field CP SHALL be able to move a lead they own through the remaining pipeline stages (`Negotiation` → `Converted` or `Lost`) after a site visit is completed.

#### Scenario: Lead converts to a booking
- **WHEN** a Field CP updates a lead's status to `"Converted"` after negotiation
- **THEN** the lead's `status` is set to `"Converted"` and a commission record is created/updated for that Field CP

#### Scenario: Lead is lost
- **WHEN** a Field CP updates a lead's status to `"Lost"`
- **THEN** the lead's `status` is set to `"Lost"` and it is excluded from the Field CP's active-assignments KPI count
