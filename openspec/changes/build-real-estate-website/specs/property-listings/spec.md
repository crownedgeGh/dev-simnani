## ADDED Requirements

### Requirement: Buy, Sell, Rent, and Invest Listing Pages
The system SHALL provide four distinct routes — `/buy`, `/sell`, `/rent`, `/invest` — each rendering a list/grid of properties filtered to that transaction type from the shared mock property dataset.

#### Scenario: Listing page shows only matching properties
- **WHEN** a user navigates to `/rent`
- **THEN** the page displays only properties whose type is "rent", and does not display properties of other types

#### Scenario: Each listing page is independently reachable
- **WHEN** a user navigates directly to `/buy`, `/sell`, `/rent`, or `/invest` via URL
- **THEN** the corresponding page loads and renders its filtered property list without requiring navigation through the homepage

#### Scenario: Empty state
- **WHEN** a listing page's filtered property set is empty
- **THEN** the page displays a clear empty-state message instead of an empty grid

### Requirement: Property Card Display
The system SHALL render each property as a card showing, at minimum, an image, price, location, and a short set of key facts appropriate to its transaction type (e.g. beds/baths/area for Buy/Sell/Rent; a yield or return metric for Invest).

#### Scenario: Standard property card fields
- **WHEN** a property card is rendered on a Buy, Sell, or Rent listing page
- **THEN** the card displays an image, price, location, and bed/bath/area facts

#### Scenario: Invest property card fields
- **WHEN** a property card is rendered on the Invest listing page
- **THEN** the card displays an image, price, location, and an investment-relevant metric (e.g. rental yield or projected return) in addition to or in place of bed/bath facts

### Requirement: Responsive Property Grid
The system SHALL lay out property cards in a responsive grid that adapts column count to viewport width across mobile, tablet, and desktop.

#### Scenario: Single column on mobile
- **WHEN** a user views a listing page at a mobile viewport width (<640px)
- **THEN** property cards are displayed in a single column, each card fully visible without horizontal scrolling

#### Scenario: Multi-column on tablet and desktop
- **WHEN** a user views a listing page at tablet (≥768px) or desktop (≥1024px) viewport widths
- **THEN** property cards are displayed in a multi-column grid (e.g. 2 columns on tablet, 3+ columns on desktop) with consistent spacing
