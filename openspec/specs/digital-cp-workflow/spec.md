## Purpose

TBD - created by syncing change `cp-hierarchy-system`. Update this Purpose section with a short description of the digital-cp-workflow capability.

## Requirements

### Requirement: Digital CP uploads promotional creative for an assigned project
A Digital CP SHALL be able to upload a campaign video or creative asset against a project that has been delegated to them, submitting it for moderation.

#### Scenario: Uploading a campaign video
- **WHEN** a Digital CP opens an assigned project and uploads a campaign video with a name
- **THEN** a `campaignVideo` record is created linked to that project, scoped to that Digital CP's `partnerName`, with `status: "Pending Review"`

#### Scenario: Uploading against a project not assigned to them
- **WHEN** a Digital CP attempts to upload creative for a project with no `company-to-digital` assignment naming them
- **THEN** the upload action is not available for that project

### Requirement: Head CP or Company CP moderates Digital CP creative
Uploaded campaign creative SHALL go through the existing moderation flow (Approve / Suggest Edit) before being treated as live/promotable.

#### Scenario: Creative approved
- **WHEN** a reviewer approves a `campaignVideo` with `status: "Pending Review"`
- **THEN** its `status` becomes `"Approved"` and it counts toward the Digital CP's approved-creative metrics

#### Scenario: Edit suggested
- **WHEN** a reviewer suggests an edit on a `campaignVideo`, adding a note
- **THEN** its `status` becomes `"Suggested Edit"` and the note is visible to the Digital CP who uploaded it

### Requirement: Digital CP tracks ad-generated lead and commission performance
A Digital CP SHALL be able to see, for each assigned project, how many leads their promotion has generated (leads with `submittedBy.cpType: "digital"` tied to that project) and their resulting commission status, even though those leads route through Head CP → Company CP before any further action.

#### Scenario: Viewing performance for an assigned project
- **WHEN** a Digital CP opens an assigned project's performance view
- **THEN** it shows the count of leads generated for that project by them and the approval status of any resulting commissions

#### Scenario: No leads yet generated
- **WHEN** a Digital CP has an assigned project with zero leads generated so far
- **THEN** the performance view shows a zero-state rather than an error
