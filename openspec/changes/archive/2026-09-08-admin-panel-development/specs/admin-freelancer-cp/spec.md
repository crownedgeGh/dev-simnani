## ADDED Requirements

### Requirement: Freelancer & CP management hub with tabs
The system SHALL provide a management page at `/admin/freelancer-cp` with four tabs: "Freelancer Leads", "CP Network", "Campaign Videos", "Commissions".

#### Scenario: Admin opens freelancer-cp page
- **WHEN** admin navigates to `/admin/freelancer-cp`
- **THEN** the page renders with four tabs; the default tab is "Freelancer Leads"

### Requirement: Freelancer leads management
The "Freelancer Leads" tab SHALL display all freelancer-submitted leads (from `se_admin_freelancer_leads`, seeded from `FREELANCER_LEADS`) in the AdminTable. Columns: Lead ID, Customer, Phone, Project, Date, Status (badge), Commission, Notes, Actions.

#### Scenario: Admin views freelancer leads
- **WHEN** admin clicks "Freelancer Leads" tab
- **THEN** all freelancer leads display with correct columns

#### Scenario: Admin changes a lead status to "Converted"
- **WHEN** admin changes lead status via inline select or edit dialog
- **THEN** status badge updates immediately and a toast fires

### Requirement: CP Network management (all three CP types)
The "CP Network" tab SHALL display all channel partners from `se_admin_cp_network` (seeded from `CP_NETWORK`). Columns: CP ID, Name, CP Type (badge: Company/Digital/Field), Leads Submitted, Site Visits, Deals Closed, Status, Actions.

#### Scenario: Admin views CP network
- **WHEN** admin clicks "CP Network" tab
- **THEN** all CP members appear; filter by CP type (digital/field/company) is available

#### Scenario: Admin suspends a CP member
- **WHEN** admin changes a CP member's status to "Suspended"
- **THEN** the status badge updates and a toast fires

### Requirement: CP Leads management (admin view across all CP types)
Within the "CP Network" tab or a sub-tab, admin SHALL view all CP leads (from `se_admin_cp_leads`, seeded from `CP_LEADS`). Admin SHALL be able to: change status (Pending Verification → Verified → Assigned → Site Visit Scheduled → Converted/Lost), assign leads to Field CPs, and approve/hold commissions.

#### Scenario: Admin verifies a pending CP lead
- **WHEN** admin changes a CP lead status from "Pending Verification" to "Verified"
- **THEN** status updates immediately and a toast fires

#### Scenario: Admin assigns a verified lead to a Field CP
- **WHEN** admin selects a Field CP from a dropdown in the assign action
- **THEN** the `assignedTo` field updates and the status changes to "Assigned"

### Requirement: Campaign video moderation
The "Campaign Videos" tab SHALL display all campaign videos submitted by Digital CPs (from `se_admin_campaign_videos`, seeded from `CP_CAMPAIGN_VIDEOS`). Columns: Video ID, Partner Name, Project, Video Name, Status (badge: Pending Review / Approved / Suggested Edit), Notes, Posted Links.

Admin SHALL be able to: Approve a video, add a "Suggested Edit" note, or reject a video.

#### Scenario: Admin approves a campaign video
- **WHEN** admin clicks "Approve" on a video with "Pending Review" status
- **THEN** status changes to "Approved", the toast fires

#### Scenario: Admin suggests an edit on a video
- **WHEN** admin enters a note and clicks "Suggest Edit"
- **THEN** status changes to "Suggested Edit", note is stored, and toast fires

### Requirement: Commission management
The "Commissions" tab SHALL display all commission records (seeded from `CP_COMMISSIONS` and `BROKER_COMMISSIONS`). Columns: Lead ID, Customer, Project, Amount, Approval Status (badge: Approved / Pending / On Hold), Actions (Approve, Put On Hold).

#### Scenario: Admin approves a commission
- **WHEN** admin clicks "Approve" on a pending commission
- **THEN** `approvalStatus` becomes "Approved" and toast fires

### Requirement: Freelancer property submissions management
The admin SHALL view all freelancer-submitted properties (from `se_admin_freelancer_properties`, seeded from `FREELANCER_PROPERTIES`). Admin can change status (Pending Review → Live / Rejected).

#### Scenario: Admin approves a freelancer property submission
- **WHEN** admin changes a property submission status from "Pending Review" to "Live"
- **THEN** status badge updates and toast fires
