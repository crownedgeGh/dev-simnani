## 1. Project Setup

- [x] 1.1 Scaffold Next.js (JavaScript, App Router) app with Tailwind CSS at the repo root (`create-next-app` with JS + Tailwind flags, no TypeScript)
- [x] 1.2 Configure theme tokens: navy background scale, gold/mustard accent scale, display font family, tracked-uppercase utility patterns (via Tailwind v4 `@theme` in `app/globals.css` — this scaffold uses Tailwind v4's CSS-first config, no `tailwind.config.js`)
- [x] 1.3 Set up `next/font` for a display heading font and a body/sans font matching the reference design (Playfair Display + Inter)
- [x] 1.4 Set up base `app/layout.js` (global styles, fonts, `<html>`/`<body>` theme background) and `app/globals.css`

## 2. Site Shell (Navbar & Footer)

- [x] 2.1 Build `components/layout/Navbar.jsx`: wordmark, Properties/Invest/Services/Concierge links, Login action, responsive desktop layout
- [x] 2.2 Add mobile drawer/menu behavior to Navbar for <768px viewports
- [x] 2.3 Build `components/layout/Footer.jsx`: wordmark, four link columns (Company, Properties, Resources, Support), social icon links, copyright, responsive stacking on mobile
- [x] 2.4 Wire Navbar and Footer into `app/layout.js` so they render on every route
- [x] 2.5 Verify site-shell spec scenarios manually at mobile/tablet/desktop widths

## 3. Shared Data & Property Components

- [x] 3.1 Create `lib/properties.js` mock dataset covering buy/sell/rent/invest types with fields: id, title, type, price, location, beds, baths, area, image, badge, and (for invest) a yield/ROI metric
- [x] 3.2 Add filter/sort helper functions in `lib/properties.js` (e.g. `getPropertiesByType(type)`)
- [x] 3.3 Create `lib/projects.js` mock dataset for New & Upcoming Projects (id, name, location, startingPrice, developer, status, image)
- [x] 3.4 Create `lib/locations.js` mock dataset for Explore Popular Locations (city, propertyCount, image)
- [x] 3.5 Build `components/property/PropertyCard.jsx` with type-aware fields (bed/bath/area for buy/sell/rent, yield/ROI for invest), badge, and favorite/heart affordance
- [x] 3.6 Build `components/property/PropertyGrid.jsx` with responsive column layout (1 col mobile, 2 col tablet, 3+ col desktop) and an empty-state message

## 4. Homepage Sections

- [x] 4.1 Build `components/home/Hero.jsx`: full-bleed background image, headline with accent-colored word, subtitle, single primary CTA; responsive type scaling
- [x] 4.2 Build `components/home/SearchBar.jsx`: Buy/Sell/Rent tabs, location input, property-type select, budget select, submit navigates to matching listing route with query params via `useRouter`; stacks on mobile
- [x] 4.3 Build `components/home/ExploreServices.jsx`: 5-tile grid (Buy/Sell/Rent/Invest/Project Management), each linking to its page; responsive reflow
- [x] 4.4 Build `components/home/FeaturedProperties.jsx`: renders featured mock properties via `PropertyGrid`/`PropertyCard` with "View Details" action
- [x] 4.5 Build `components/home/ProjectsSection.jsx`: New & Upcoming Projects cards from `lib/projects.js` with "View Project" action; responsive reflow
- [x] 4.6 Build `components/home/PopularLocations.jsx`: city tile grid from `lib/locations.js`; responsive reflow
- [x] 4.7 Build `components/home/WhyChooseUs.jsx`: 4-item icon/value-prop row; responsive reflow
- [x] 4.8 Build `components/home/InsightsSection.jsx`: article/blog cards (category, title, excerpt, Read More)
- [x] 4.9 Build `components/home/CtaBanner.jsx`: closing heading, copy, and two actions ("Explore Properties", "Post Your Property"); stacks on mobile
- [x] 4.10 Assemble `app/page.js` composing Hero, SearchBar, ExploreServices, FeaturedProperties, ProjectsSection, PopularLocations, WhyChooseUs, InsightsSection, CtaBanner in order
- [x] 4.11 Verify homepage spec scenarios manually at mobile/tablet/desktop widths

## 5. Listing Pages

- [x] 5.1 Build `app/buy/page.js` using `PropertyGrid` filtered to type "buy"
- [x] 5.2 Build `app/sell/page.js` using `PropertyGrid` filtered to type "sell"
- [x] 5.3 Build `app/rent/page.js` using `PropertyGrid` filtered to type "rent"
- [x] 5.4 Build `app/invest/page.js` using `PropertyGrid` filtered to type "invest"
- [x] 5.5 Add page-level heading/intro content per listing page (type-specific copy)
- [x] 5.6 Verify property-listings spec scenarios manually at mobile/tablet/desktop widths, including empty-state rendering

## 6. Cross-Cutting Polish & Verification

- [x] 6.1 Confirm consistent theme (colors, typography, spacing) across homepage and all four listing pages
- [x] 6.2 Run the app locally and click through Navbar links, search bar submission (all modes), service tiles, footer links, and CTA banner actions end-to-end
- [x] 6.3 Test responsiveness at representative mobile (375px), tablet (768px), and desktop (1280px+) widths for every page built in this change
- [x] 6.4 Run lint/build (`next build`) and fix any errors or warnings introduced by this change
