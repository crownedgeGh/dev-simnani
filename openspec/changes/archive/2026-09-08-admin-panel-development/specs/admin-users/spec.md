## ADDED Requirements

### Requirement: Users listing
The system SHALL display all registered users from `se_admin_users` localStorage key (seeded with demo account data) in the AdminTable at `/admin/users`. Columns: Full Name, Mobile, Email, Account Type (badge), Account ID, Registered Date, Status, Actions.

#### Scenario: Admin opens users page
- **WHEN** admin navigates to `/admin/users`
- **THEN** all registered users appear in the table

### Requirement: Filter users by account type
Admin SHALL filter users by accountType: buyer, broker, investor, freelancer, common-person, employee.

#### Scenario: Admin filters by "broker"
- **WHEN** admin selects "broker" from the Account Type filter
- **THEN** only broker accounts are shown

### Requirement: View user profile
Clicking a user row SHALL navigate to `/admin/users/[accountId]` showing the full user profile.

#### Scenario: Admin clicks a user row
- **WHEN** admin clicks on any user row
- **THEN** navigation goes to `/admin/users/[accountId]` with the user's full profile

### Requirement: Edit user account type and status
Admin SHALL be able to edit a user's `accountType` and `status` (Active/Suspended) via an edit dialog.

#### Scenario: Admin suspends a user
- **WHEN** admin opens edit dialog and sets status to "Suspended"
- **THEN** the user's status badge shows "Suspended" immediately and a toast fires

### Requirement: Soft-delete user
Admin SHALL be able to soft-delete (mark as Deleted) a user after confirming a dialog. The row SHALL remain visible with a "Deleted" status badge.

#### Scenario: Admin soft-deletes a user
- **WHEN** admin clicks Delete and confirms
- **THEN** the user's status becomes "Deleted" and a warning toast fires

### Requirement: Search users
Admin SHALL search users by name, mobile, or email.

#### Scenario: Admin searches by mobile number
- **WHEN** admin types a phone number in the search box
- **THEN** only users matching that phone are shown
