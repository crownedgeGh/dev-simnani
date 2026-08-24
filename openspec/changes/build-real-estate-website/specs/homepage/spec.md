## ADDED Requirements

### Requirement: Full-Bleed Hero Section
The system SHALL render a full-bleed hero on the homepage with a background photograph, a headline ("Find a Place You'll Love to Call **Home**", with "Home" set in the gold accent color), a subtitle, and a primary "Explore Simnani Estate" call-to-action.

#### Scenario: Hero renders above the fold
- **WHEN** a user loads the homepage
- **THEN** the hero image, headline, subtitle, and call-to-action button are visible without scrolling on common desktop viewport heights

#### Scenario: Hero scales across breakpoints
- **WHEN** a user views the homepage on mobile, tablet, and desktop viewport widths
- **THEN** the hero headline and subtitle font sizes adapt so no text is clipped and the call-to-action remains tappable/clickable

### Requirement: Property Search Bar
The system SHALL render a search panel below the hero offering Buy / Sell / Rent mode tabs, a location text input, a property-type select, a budget select, and a search submit action.

#### Scenario: Switching search mode
- **WHEN** a user selects the "Rent" tab in the search bar
- **THEN** the search bar's active mode updates to Rent

#### Scenario: Submitting a search navigates to the matching listing page
- **WHEN** a user selects a mode (e.g. Buy), optionally fills location/property-type/budget, and submits the search bar
- **THEN** the system navigates to the corresponding listing page (`/buy`) carrying the entered filters as query parameters

#### Scenario: Search bar usable on mobile
- **WHEN** a user views the search bar at a mobile viewport width (<768px)
- **THEN** the mode tabs and input fields stack vertically so all controls remain visible and usable without horizontal scrolling

### Requirement: Explore Simnani Estate Section
The system SHALL render a homepage section with five service tiles — Buy Property, Sell Property, Rent Property, Invest in Real Estate, and Project Management — each with a title, short description, and a link/button to its corresponding page.

#### Scenario: Service tiles link to the correct page
- **WHEN** a user selects the "Explore Properties" action on the Buy Property tile
- **THEN** the system navigates to `/buy` (and analogously Sell → `/sell`, Rent → `/rent`, Invest → `/invest`)

#### Scenario: Service grid reflows responsively
- **WHEN** a user views the Explore Simnani Estate section across mobile, tablet, and desktop viewport widths
- **THEN** the tiles reflow from a single column on mobile to a multi-column grid on tablet/desktop without overlapping or clipped text

### Requirement: Featured Properties Section
The system SHALL render a homepage section showcasing a set of featured properties as cards (image, optional "Featured"/"New" badge, favorite/heart affordance, title, location, price, and key facts such as beds/baths/area), sourced from the shared mock property dataset, each with a "View Details" action.

#### Scenario: Featured properties display
- **WHEN** a user scrolls to the Featured Properties section on the homepage
- **THEN** a set of property cards is displayed, each showing an image, title, location, price, and key facts

#### Scenario: Featured grid reflows responsively
- **WHEN** a user views the Featured Properties section across mobile, tablet, and desktop viewport widths
- **THEN** the number of property cards per row adjusts (1 column on mobile, more columns on tablet/desktop) so cards remain legible and unclipped

### Requirement: New & Upcoming Projects Section
The system SHALL render a homepage section listing new/upcoming real-estate projects as cards (image, project name, location, starting price, developer name, status such as "Under Construction" or "Ready to Move"), each with a "View Project" action.

#### Scenario: Projects section displays project cards
- **WHEN** a user scrolls to the New & Upcoming Projects section
- **THEN** a set of project cards is displayed, each showing an image, project name, location, starting price, developer, and status

#### Scenario: Projects grid reflows responsively
- **WHEN** a user views the New & Upcoming Projects section across mobile, tablet, and desktop viewport widths
- **THEN** the number of project cards per row adjusts so cards remain legible and unclipped

### Requirement: Explore Popular Locations Section
The system SHALL render a homepage section showing a grid of popular city tiles (background image, city name, property count).

#### Scenario: Location tiles display
- **WHEN** a user scrolls to the Explore Popular Locations section
- **THEN** a grid of city tiles is displayed, each showing a background image, the city name, and its property count

#### Scenario: Location grid reflows responsively
- **WHEN** a user views the Explore Popular Locations section across mobile, tablet, and desktop viewport widths
- **THEN** the number of city tiles per row adjusts so tiles remain legible and unclipped

### Requirement: Why Choose Simnani Estate Section
The system SHALL render a homepage section presenting four value propositions (e.g. Verified Properties, Trusted Sellers, Smart Investment, End-to-End Support), each with an icon, a title, and a short description.

#### Scenario: Value propositions display
- **WHEN** a user scrolls to the Why Choose Simnani Estate section
- **THEN** four items are displayed, each with an icon, title, and short description

#### Scenario: Value propositions reflow responsively
- **WHEN** a user views the section across mobile, tablet, and desktop viewport widths
- **THEN** the items reflow from a single column on mobile to a multi-column row on tablet/desktop

### Requirement: Real Estate Insights Section
The system SHALL render a homepage section showcasing a set of article/insight cards (category label, title, short excerpt, "Read More" action).

#### Scenario: Insight cards display
- **WHEN** a user scrolls to the Real Estate Insights section
- **THEN** a set of article cards is displayed, each showing a category label, title, excerpt, and a "Read More" action

### Requirement: Closing Call-to-Action Banner
The system SHALL render a closing homepage section with a heading ("Ready to Find Your Next Property?"), supporting copy, and two actions ("Explore Properties" and "Post Your Property").

#### Scenario: CTA banner displays both actions
- **WHEN** a user scrolls to the bottom of the homepage, above the footer
- **THEN** the CTA banner is displayed with its heading, copy, and both "Explore Properties" and "Post Your Property" actions

#### Scenario: CTA banner stacks on mobile
- **WHEN** a user views the CTA banner at a mobile viewport width (<640px)
- **THEN** the two actions stack vertically and remain fully tappable without overlapping
