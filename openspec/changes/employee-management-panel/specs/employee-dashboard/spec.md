## ADDED Requirements

### Requirement: Employee portal access
The system SHALL provide an Employee Portal at `/portal/employee`, gated behind authentication using the existing `useAuth()` mechanism, consistent with other portal routes.

#### Scenario: Authenticated employee views portal
- **WHEN** a logged-in user with an employee profile navigates to `/portal/employee`
- **THEN** the system renders the Employee Dashboard with the employee's name and assigned district in the page header

### Requirement: Dashboard overview KPIs
The system SHALL display a dashboard overview showing total assigned leads, new leads, follow-ups due today, site visits scheduled, site visits completed, interested customers, bookings/conversions, pending follow-ups, and this month's sales value.

#### Scenario: Overview tab shows all KPI tiles
- **WHEN** the employee opens the Overview tab
- **THEN** the system displays a KPI tile for each of: total assigned leads, new leads, follow-ups due today, site visits scheduled, site visits completed, interested customers, bookings, pending follow-ups, and this month's sales value

### Requirement: My Leads list scoped to assigned district
The system SHALL display leads assigned to the employee, scoped to the employee's assigned district, each showing customer name, phone, property interested in, lead source, lead date, status, last follow-up, next follow-up, and priority.

#### Scenario: Leads filtered by assigned district
- **WHEN** the employee opens the My Leads tab
- **THEN** only leads whose district matches the employee's `assignedDistrict` are shown
- **AND** each lead card shows customer name, phone, property interested in, source, date, status, last follow-up, next follow-up, and priority

### Requirement: Lead status pipeline
The system SHALL support updating a lead's status through the pipeline: New → Contacted → Interested → Site Visit Scheduled → Site Visit Done → Negotiation → Booked → Lost.

#### Scenario: Employee advances a lead's status
- **WHEN** the employee selects a new status for a lead from the pipeline
- **THEN** the system updates the lead's displayed status immediately
- **AND** the updated status is reflected in the Overview KPI counts and Performance tab on next render

### Requirement: Site visit scheduling
The system SHALL allow the employee to schedule a site visit by selecting a customer, a property, and a date/time.

#### Scenario: Schedule a new site visit
- **WHEN** the employee selects a customer, a property, and a date/time and confirms
- **THEN** the system adds the visit to the site visits list with status "Scheduled"

### Requirement: Today's site visits list
The system SHALL display a "Today's Site Visits" list showing each visit's time, customer, and property, ordered by time.

#### Scenario: Today's visits shown in time order
- **WHEN** the employee opens the Site Visits tab
- **THEN** visits scheduled for the current date are listed in ascending time order, each showing time, customer name, and property name

### Requirement: Site visit outcome tracking
The system SHALL allow the employee to update a site visit's status (attended or no-show), record feedback, and set a next action.

#### Scenario: Mark visit as completed with feedback
- **WHEN** the employee marks a scheduled visit as "Done", indicates whether the customer attended, and enters feedback text and a next action
- **THEN** the system updates the visit's status and stores the feedback and next action for display

### Requirement: Today's follow-ups
The system SHALL display a "Today's Follow-ups" list showing customer, property, last contact, next follow-up, and status, for follow-ups due today.

#### Scenario: Follow-ups due today are listed
- **WHEN** the employee opens the Follow-ups tab
- **THEN** the system lists all leads whose next-follow-up date is today, each showing customer, property, last contact, next follow-up time, and status

### Requirement: Follow-up quick actions
The system SHALL provide quick actions on each follow-up entry to call the customer, message on WhatsApp, add a note, and schedule the next follow-up.

#### Scenario: Employee uses a quick action
- **WHEN** the employee selects "Call" or "WhatsApp" on a follow-up entry
- **THEN** the system opens a `tel:` link or a `wa.me` WhatsApp link respectively, pre-populated with the customer's phone number

#### Scenario: Employee adds a note and reschedules
- **WHEN** the employee enters a note and selects a new follow-up date/time for a lead
- **THEN** the system stores the note against the lead and updates its next-follow-up date

### Requirement: Territory property inventory
The system SHALL display properties/projects available in the employee's assigned district, showing photo, price, location, and availability, with an option to share the property.

#### Scenario: Inventory filtered by assigned district
- **WHEN** the employee opens the Properties tab
- **THEN** the system shows properties whose location matches the employee's assigned district
- **AND** each property links to its existing property detail page

#### Scenario: Share property with customer
- **WHEN** the employee selects "Share" on a property
- **THEN** the system provides a shareable link or message pre-filled with the property's details

### Requirement: Sales and booking summary
The system SHALL display total bookings, pending bookings, booking amount, sale value, commission/incentive, monthly target, and percentage of target achieved.

#### Scenario: Sales tab shows target progress
- **WHEN** the employee opens the Sales tab
- **THEN** the system displays total bookings, pending bookings, sale value, commission, the monthly target amount, the achieved amount, and the achievement percentage computed as achieved ÷ target

### Requirement: Monthly performance report
The system SHALL display a monthly performance summary showing leads count, contacted count, site visits count, completed visits count, negotiations count, bookings count, sales value, and conversion rate.

#### Scenario: Performance tab shows monthly metrics
- **WHEN** the employee opens the Performance tab
- **THEN** the system displays leads, contacted, site visits, completed visits, negotiations, bookings, sales value, and conversion rate for the current month

### Requirement: My Territory summary
The system SHALL display the employee's assigned district, cities/areas, assigned projects, count of leads in territory, upcoming site visits, and available inventory count.

#### Scenario: Territory tab shows assignment summary
- **WHEN** the employee opens the My Territory tab
- **THEN** the system displays the assigned district, its cities/areas, assigned projects, the count of leads in the territory, the number of upcoming site visits, and the count of available inventory items

### Requirement: Responsive layout
The system SHALL render the Employee Portal correctly at mobile (375px), tablet (768px), and desktop (1440px) widths, with all interactive elements at least 44x44px on mobile.

#### Scenario: Dashboard usable on mobile
- **WHEN** the Employee Portal is viewed at a 375px viewport width
- **THEN** all tabs, KPI tiles, lead cards, and action buttons remain usable and readable without horizontal overflow, and touch targets are at least 44x44px
