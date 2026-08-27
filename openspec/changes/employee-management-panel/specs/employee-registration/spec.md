## ADDED Requirements

### Requirement: Employee account type selection
The system SHALL offer "Employee" as a selectable account type on the sign-up account-type screen, alongside Buyer, Investor, Broker, Freelancer, and Common Person.

#### Scenario: Employee option visible and selectable
- **WHEN** a visitor opens the account type selection screen (`/auth/register`)
- **THEN** an "Employee" card is shown with a label and description distinguishing it from Broker/Freelancer (e.g. "Manage assigned leads and close sales for your district")
- **AND** selecting it and continuing navigates to the employee registration route

### Requirement: Employee registration wizard
The system SHALL provide a multi-step registration wizard for the Employee account type that collects full name, mobile number, email, employee code, and assigned district/territory before account creation.

#### Scenario: Complete registration with valid details
- **WHEN** a user fills in full name, a valid 10-digit mobile number, email, employee code, and selects an assigned district from the available cities
- **AND** submits the final step
- **THEN** the system generates an employee account ID in the format `SG-EMP-XXXXXX`
- **AND** the system logs the user in and persists a profile containing `accountType: "employee"`, the entered fields, and `assignedDistrict`

#### Scenario: Incomplete required fields blocked
- **WHEN** a user attempts to advance a step without filling all required fields for that step (e.g. leaves mobile number blank or invalid)
- **THEN** the system SHALL prevent advancing to the next step and SHALL display a validation message

#### Scenario: District assignment required
- **WHEN** a user reaches the territory-assignment step of the wizard
- **THEN** the system SHALL require selection of exactly one assigned district before the step can be completed

### Requirement: Post-registration redirect to employee portal
The system SHALL redirect a newly registered employee to the Employee Portal immediately after successful registration.

#### Scenario: Redirect after signup
- **WHEN** an employee completes registration successfully
- **THEN** the system navigates the user to `/portal/employee`
