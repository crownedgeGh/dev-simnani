## ADDED Requirements

### Requirement: Admin login with hardcoded credentials
The system SHALL provide a dedicated admin login page at `/admin/login` that authenticates using a hardcoded demo credential (`admin@simnani.com` / `admin123`). On success, it SHALL store a token in localStorage under `se_admin_token` and redirect to `/admin`.

#### Scenario: Successful admin login
- **WHEN** admin enters correct email `admin@simnani.com` and password `admin123` and submits
- **THEN** system stores `se_admin_token` in localStorage and redirects to `/admin/dashboard`

#### Scenario: Failed login with wrong credentials
- **WHEN** admin enters incorrect email or password
- **THEN** system displays an error toast "Invalid credentials" and does NOT store a token

### Requirement: Admin route guard
The system SHALL protect all routes under `/admin/*` (except `/admin/login`). If `se_admin_token` is absent from localStorage, the user SHALL be redirected to `/admin/login`.

#### Scenario: Unauthenticated access to admin page
- **WHEN** a user navigates to any `/admin/*` page without a valid token
- **THEN** system redirects them to `/admin/login`

#### Scenario: Authenticated admin access
- **WHEN** `se_admin_token` exists in localStorage
- **THEN** admin can access all `/admin/*` pages without redirect

### Requirement: Admin logout
The system SHALL provide a logout action in the admin topbar. On logout, `se_admin_token` SHALL be removed from localStorage and the user SHALL be redirected to `/admin/login`.

#### Scenario: Admin clicks logout
- **WHEN** admin clicks the logout button in the topbar
- **THEN** `se_admin_token` is removed and user is redirected to `/admin/login`

### Requirement: Isolated admin auth context
The admin auth system SHALL use a separate `AdminAuthContext` and NOT interfere with the public portal's `AuthContext` or `se_auth_token` key.

#### Scenario: Admin logs in while a public user is also logged in
- **WHEN** both `se_auth_token` and `se_admin_token` exist in localStorage
- **THEN** both auth systems function independently without conflict
