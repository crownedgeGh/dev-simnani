## ADDED Requirements

### Requirement: Themed Design Tokens
The system SHALL define a shared Tailwind theme (dark navy background scale, gold/mustard accent scale, uppercase-tracked label styling, and a display font for headings distinct from body text) that every page in the site consumes, matching the Simnani Estate reference design.

#### Scenario: Consistent theme across pages
- **WHEN** a user navigates between the homepage and any of the Buy, Sell, Rent, or Invest pages
- **THEN** the background colors, accent (gold) color, and typography styles remain visually consistent across all pages

### Requirement: Responsive Navigation Header
The system SHALL render a persistent site header showing the "SIMNANI ESTATE" wordmark, primary navigation links (Properties, Invest, Services, Concierge), and a Login action, on every page.

#### Scenario: Desktop navigation
- **WHEN** a user views the site at a desktop viewport width (≥1024px)
- **THEN** the header displays the wordmark on the left, all navigation links inline, and the Login action on the right, without wrapping

#### Scenario: Mobile navigation collapses
- **WHEN** a user views the site at a mobile viewport width (<768px)
- **THEN** the header displays the wordmark and a menu control, and the primary navigation links are accessible via a collapsible drawer/menu rather than shown inline

#### Scenario: Navigation link routes to correct page
- **WHEN** a user selects a primary navigation link (e.g. Properties or Invest)
- **THEN** the system navigates to the corresponding page (e.g. a properties/listing page or `/invest`)

### Requirement: Responsive Footer
The system SHALL render a persistent dark footer on every page containing the site wordmark, four link columns — Company (About Us, Contact Us, Careers, Partner With Us), Properties (Buy, Rent, Sell, Invest, Project Management), Resources (Property Guides, Market Trends, Real Estate News, Investment Insights), and Support (Help Center, Privacy Policy, Terms & Conditions, Contact Support) — social media icon links, and a copyright line.

#### Scenario: Footer present on all pages
- **WHEN** a user scrolls to the bottom of the homepage or any listing page
- **THEN** the footer is displayed with the wordmark, all four link columns, social icon links, and current copyright text

#### Scenario: Footer link routes to correct page
- **WHEN** a user selects a Properties-column link (e.g. Buy)
- **THEN** the system navigates to the corresponding page (e.g. `/buy`)

#### Scenario: Footer stacks on small screens
- **WHEN** a user views the footer at a mobile viewport width (<640px)
- **THEN** the footer's wordmark, link columns, social icons, and copyright stack vertically and remain fully readable without horizontal overflow
