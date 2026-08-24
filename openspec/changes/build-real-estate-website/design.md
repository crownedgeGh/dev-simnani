## Context

Simnani Estate is a greenfield project: no existing app, no backend, no data source. The only inputs are (1) a functional reference — MagicBricks-style Buy/Sell/Rent/Invest browsing — and (2) visual references: an initial Pencil/Claude design (`Simnani Estate.dc.html`) establishing the dark-navy + gold "architectural precision" aesthetic (full-bleed photography, uppercase tracked wordmark/nav), and a follow-up "Responsive design scope discussion" mockup that is the authoritative reference for the homepage's full section layout — hero, mega search bar, service tiles, featured properties, new & upcoming projects, popular locations, why-choose-us, insights, closing CTA, and an expanded 4-column footer.

This change delivers the front-end shell and primary pages only. There is no CMS, database, auth provider, or payments in scope — those are explicitly deferred.

## Goals / Non-Goals

**Goals:**
- Ship a Next.js (JavaScript, App Router) + Tailwind CSS site that visually matches the Simnani Estate reference design.
- Homepage with hero, mega search bar (Buy/Sell/Rent tabs + location/type/budget), service tiles, featured properties, projects, popular locations, why-choose-us, insights, and closing CTA sections.
- Four listing pages (`/buy`, `/sell`, `/rent`, `/invest`) rendering property cards from mock data, responsive at mobile/tablet/desktop.
- A reusable theme (Tailwind tokens) and component set (Navbar, Footer, PropertyCard, SearchBar, etc.) that later changes can extend.

**Non-Goals:**
- No backend/API, database, or real property data — mock/static data only.
- No authentication — LOGIN is a visible UI affordance/link only (can route to a stub page), not a working auth flow.
- No property detail page, booking/lead-capture forms, or payment flow — deferred to a future change.
- No CMS-driven content management — copy and images are hardcoded/static for this change.

## Decisions

**Framework: Next.js App Router, JavaScript (not TypeScript).**
Matches the user's explicit tech stack request. App Router gives file-based routing for `/buy`, `/sell`, `/rent`, `/invest` with shared layout (`app/layout.js`) for the navbar/footer without duplication.

**Styling: Tailwind CSS with an extended theme, no component library.**
The reference design is bespoke (specific navy/gold palette, tracked uppercase type, thin-bordered outline buttons) — a generic UI kit (MUI, Chakra) would fight the aesthetic more than it helps. Tailwind's `theme.extend` encodes the design as tokens:
- `colors.navy` (background scale, e.g. `950`/`900`/`800` for base/section/card surfaces)
- `colors.gold` (accent scale for CTAs, active states, links)
- `fontFamily.display` (serif/slab display font for wordmark & headlines, via `next/font`) and `fontFamily.sans` (body)
- Shared `tracking-widest uppercase text-sm` utility pattern for nav/labels, applied via a small set of reusable class strings rather than a new CSS abstraction layer.

**Component architecture:**
- `components/layout/Navbar.jsx`, `Footer.jsx` — shared shell, rendered from `app/layout.js`. Footer has four link columns (Company, Properties, Resources, Support) plus social icon links, per the reference design.
- `components/home/Hero.jsx` — full-bleed hero, headline with accent-colored word, subtitle, single primary CTA.
- `components/home/SearchBar.jsx` — Buy/Sell/Rent mode tabs + location input + property-type select + budget select + submit; submits to the matching listing route.
- `components/home/ExploreServices.jsx` — 5-tile grid (Buy/Sell/Rent/Invest/Project Management), each linking to its page.
- `components/home/FeaturedProperties.jsx` — featured property cards (badge, favorite icon, View Details) via `PropertyGrid`/`PropertyCard`.
- `components/home/ProjectsSection.jsx` — "New & Upcoming Projects" cards (own lightweight data shape, not `PropertyCard` — projects have developer/status/starting-price fields rather than beds/baths).
- `components/home/PopularLocations.jsx` — city tile grid (image, name, property count).
- `components/home/WhyChooseUs.jsx` — 4-item icon/value-prop row.
- `components/home/InsightsSection.jsx` — article/blog card row (category, title, excerpt, Read More).
- `components/home/CtaBanner.jsx` — closing CTA with two actions.
- `components/property/PropertyCard.jsx`, `PropertyGrid.jsx` — shared between homepage "featured" rail and the four listing pages.
- `lib/properties.js` — mock property dataset (array of objects: id, title, type [buy/sell/rent/invest], price, location, beds/baths/area, image, badge) plus simple filter/sort helpers. Colocated as a JS module (not JSON+fetch) since there's no backend yet — keeps it trivially swappable for a real API later (single import boundary).
- `lib/projects.js` — mock projects dataset (id, name, location, startingPrice, developer, status, image) for the Projects section, kept separate from `lib/properties.js` since the shape differs.
- `lib/locations.js` — mock popular-locations dataset (city, propertyCount, image).

**Routing & shared listing UI:**
One `PropertyGrid` component is reused across `/buy`, `/sell`, `/rent`, `/invest`, each page passing its `type` to filter the mock dataset. This avoids four near-duplicate page implementations while still giving each route its own URL, metadata, and (optionally) type-specific hero copy.

**Search bar behavior:**
The homepage search bar's Buy/Sell/Rent tabs switch active mode client-side (local state) and, on submit, navigate to the corresponding listing route (e.g. `/rent?location=...&type=...&budget=...`) using `useRouter`. Invest is reached via the Explore Simnani Estate tile/nav link rather than a search-bar tab, matching the reference design. No live search/autocomplete or backend query in this change — it's a navigation affordance, consistent with the mock-data-only scope.

**Images:** `next/image` with a curated set of license-safe architectural/interior photos (matching the moody, minimal style in the reference) referenced by URL (e.g. Unsplash source images) or placed under `public/images/` if downloaded. Exact sourcing decided during implementation; must visually match the reference's tone (dusk exterior hero, concrete/glass interiors).

**Responsiveness:** Mobile-first Tailwind breakpoints (`sm`/`md`/`lg`/`xl`). Nav collapses to a hamburger/drawer below `md`; hero type scales down (`text-4xl` → `text-7xl` across breakpoints); the search bar stacks its tabs/fields vertically below `md`; all homepage card grids (services, featured properties, projects, popular locations, insights) go 1 → 2 → 3(+) columns across `sm`/`md`/`lg`; the closing CTA banner's two actions stack below `sm`; footer's four link columns stack below `md`. Verified manually per page at mobile/tablet/desktop widths as part of implementation.

## Risks / Trade-offs

- **[Risk]** No backend means listing data, search, and login are non-functional beyond navigation/filtering over static data → **Mitigation**: scope is explicit in proposal/design as UI-only; `lib/properties.js` is structured so a future change can swap it for a real fetch with minimal component changes.
- **[Risk]** Image sourcing for a moody dark-navy/gold aesthetic could drift from the reference if placeholder stock photography doesn't match → **Mitigation**: pick a small, consistent image set (same photographer/tone family) and reuse across hero/featured/listing cards rather than random per-card images.
- **[Risk]** Reusing one `PropertyGrid`/`PropertyCard` across four transaction types could blur meaningful differences (e.g. Invest properties may want yield/ROI stats instead of beds/baths) → **Mitigation**: `PropertyCard` accepts a `type` prop and conditionally renders type-appropriate stat fields; base layout stays shared.
- **[Trade-off]** Client-side tab state + query-param navigation for the search bar is simple but not a real search backend — acceptable for this change's UI-only scope, flagged as an Open Question below for follow-up.

## Open Questions

- Should `/invest` show different card metrics (e.g. rental yield, ROI) than `/buy`/`/sell`/`/rent`? (Assumed yes at a basic level per Risk above; exact fields TBD during implementation.)
- Is a property detail page (`/property/[id]`) needed in this change, or strictly out of scope? (Currently Non-Goal — cards can be non-clickable or link to a placeholder.)
- What is the real image source/licensing for production (vs. placeholder stock used to prototype)?
- Will LOGIN eventually need real auth (NextAuth, custom), and should the stub page be built now or left as a dead link?
