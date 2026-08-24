## Why

Simnani Estate needs a public-facing real estate marketplace website — in the spirit of MagicBricks — where visitors can browse, search, and filter properties across four transaction types (Buy, Sell, Rent, Invest). No product currently exists; this is the initial build. The visual identity is already defined by a reference design (dark navy + gold "architectural precision" theme, uppercase tracked wordmark, full-bleed hero photography) and must be carried consistently across every page and breakpoint.

## What Changes

- Scaffold a new Next.js (JavaScript, App Router) project styled with Tailwind CSS, configured with the Simnani Estate theme (dark navy background, gold/mustard accent, serif-adjacent display headings, uppercase tracked labels).
- Build a shared site shell: top navigation (wordmark, PROPERTIES / INVEST / SERVICES / CONCIERGE links, LOGIN action) and dark footer (wordmark, policy links, copyright), both responsive down to mobile.
- Build the homepage: full-bleed hero, a mega search bar (Buy/Sell/Rent tabs + location/property-type/budget), an "Explore Simnani Estate" service-tile grid (Buy/Sell/Rent/Invest/Project Management), a featured-properties showcase, a "New & Upcoming Projects" section, an "Explore Popular Locations" city grid, a "Why Choose Simnani Estate" value-prop row, a "Real Estate Insights" article section, and a closing call-to-action banner.
- Build four listing pages — `/buy`, `/sell`, `/rent`, `/invest` — each rendering a filterable/sortable grid or list of property cards (image, price, location, key facts) using shared mock property data.
- Build a shared PropertyCard component and mock property dataset used across homepage "featured" section and the four listing pages.
- Ensure full responsiveness (mobile, tablet, desktop) for every page and component built in this change.

## Capabilities

### New Capabilities
- `site-shell`: Global layout — responsive navigation header and footer, theme tokens (colors, typography) shared across all pages.
- `homepage`: Landing page — hero with search bar (Buy/Sell/Rent/Invest tabs), curated portfolio section, featured properties, supporting homepage sections.
- `property-listings`: The four transaction-type listing pages (Buy/Sell/Rent/Invest), each showing a grid/list of property cards backed by mock data.

### Modified Capabilities
(none — greenfield project)

## Impact

- New Next.js app (JavaScript, App Router, Tailwind CSS) created from scratch in this repository.
- New dependencies: `next`, `react`, `react-dom`, `tailwindcss` (+ standard PostCSS/autoprefixer tooling).
- No backend/API or persistence in this change — property data is static/mock, seeded for UI development; a future change can wire up a real data source.
- No existing code affected (first build-out).
