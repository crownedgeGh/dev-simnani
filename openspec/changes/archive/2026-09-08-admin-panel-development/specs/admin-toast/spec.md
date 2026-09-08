## ADDED Requirements

### Requirement: Single Sonner Toaster in admin layout
The system SHALL mount one `<Toaster />` component (from the `sonner` library) in `app/(admin)/admin/layout.js`. No other toast system SHALL be used within the admin panel.

#### Scenario: Toaster is mounted once
- **WHEN** any admin page renders
- **THEN** exactly one `<Toaster />` is present in the DOM

### Requirement: Success toasts for all create/update/delete operations
Every successful CRUD operation SHALL emit a toast notification using `toast.success(message)`.

#### Scenario: Property created successfully
- **WHEN** admin creates a property and the operation succeeds
- **THEN** a green success toast "Property created successfully" appears

#### Scenario: Property updated successfully
- **WHEN** admin edits a property and saves
- **THEN** a success toast "Property updated successfully" appears

#### Scenario: Property deleted successfully
- **WHEN** admin deletes a property
- **THEN** a success toast "Property deleted successfully" appears

### Requirement: Error toasts for failed operations
When any operation fails (validation error, localStorage error), an error toast SHALL be emitted using `toast.error(message)`.

#### Scenario: Operation fails
- **WHEN** an admin action throws an exception
- **THEN** a red error toast "Operation failed. Please try again." appears

### Requirement: Status change toasts
All status change operations (lead status, user status, commission approval, video moderation) SHALL emit descriptive toasts.

#### Scenario: Lead status changed
- **WHEN** admin changes a lead status
- **THEN** toast reads "Lead status updated to [new status]"

#### Scenario: Featured status toggled
- **WHEN** admin toggles property featured status
- **THEN** toast reads "Featured enabled" or "Featured disabled"

### Requirement: No browser alerts or confirms
The admin panel SHALL NOT use `window.alert()`, `window.confirm()`, or `window.prompt()`. All confirmations SHALL use modal dialogs and all feedback SHALL use toast notifications.

#### Scenario: Admin deletes a record
- **WHEN** admin triggers a delete action
- **THEN** a modal dialog appears for confirmation; no browser `confirm()` is called
