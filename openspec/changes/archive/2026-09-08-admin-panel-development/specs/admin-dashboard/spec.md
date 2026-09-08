## ADDED Requirements

### Requirement: Platform KPI cards
The admin dashboard SHALL display KPI cards showing: Total Properties, Total Users (registered accounts), Total Leads (all sources), Active Projects, Pending Commissions count, and Callback Requests pending. Each card SHALL show the metric value and a label.

#### Scenario: Admin opens the dashboard
- **WHEN** admin navigates to `/admin`
- **THEN** KPI cards render with counts read from localStorage (`se_admin_*` keys)

### Requirement: Recent activity feed
The dashboard SHALL display a "Recent Activity" feed listing the last 10 admin actions (property created, lead status changed, etc.) stored in `se_admin_activity_log` in localStorage.

#### Scenario: Admin creates a property then views dashboard
- **WHEN** admin returns to the dashboard after creating a property
- **THEN** the activity feed shows "Property created: [title]" as the most recent entry

### Requirement: Property breakdown by type
The dashboard SHALL show a breakdown of properties by type (buy, sell, rent, invest, commercial, farming, etc.) as a simple stat list.

#### Scenario: Admin views type breakdown
- **WHEN** the dashboard loads
- **THEN** a breakdown panel shows counts for each property type

### Requirement: Lead pipeline summary
The dashboard SHALL show a lead pipeline summary table with counts per status stage (New, Contacted, Site Visit, Converted, Lost) across all lead sources.

#### Scenario: Admin checks lead pipeline
- **WHEN** dashboard loads
- **THEN** a pipeline row shows lead counts at each stage

### Requirement: Dashboard refresh
The dashboard SHALL have a Refresh button per the admin-layout spec, re-reading all KPI data from localStorage.

#### Scenario: Admin refreshes dashboard
- **WHEN** admin clicks Refresh
- **THEN** all KPI values re-read from localStorage and update; loading state shown during refresh
