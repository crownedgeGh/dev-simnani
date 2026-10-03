## ADDED Requirements

### Requirement: Content-sufficiency eligibility gate
The system SHALL expose `getLocalityPageData(propertyType, city, locality)` in `lib/propertiesServer.js` returning `{ properties, content, isEligible }`, where `isEligible` is `true` only if `properties.length >= 3` OR a curated `LocalityContent` entry exists for that `city` + `locality`. This helper SHALL be the single source of truth used by both the page route and the sitemap generator — no duplicate eligibility logic elsewhere.

#### Scenario: Locality with enough listings is eligible
- **WHEN** `getLocalityPageData("buy", "Bangalore", "Whitefield")` finds 5 matching `Property` docs and no curated content
- **THEN** it returns `isEligible: true`

#### Scenario: Locality with no listings and no curated content is ineligible
- **WHEN** `getLocalityPageData("buy", "Bangalore", "SomeObscurePlace")` finds 0 matching `Property` docs and no curated `LocalityContent` entry
- **THEN** it returns `isEligible: false`

#### Scenario: Locality with curated content but few listings is still eligible
- **WHEN** a city/locality has only 1 live listing but a `LocalityContent` entry exists
- **THEN** `getLocalityPageData` returns `isEligible: true`

### Requirement: Ineligible locality pages return 404
The system SHALL call `notFound()` in `app/[typeCity]/[locality]/page.js` whenever `getLocalityPageData(...).isEligible` is `false`, rather than rendering a near-empty page.

#### Scenario: Visiting an ineligible locality URL
- **WHEN** a user or crawler requests a locality page where `isEligible` is `false`
- **THEN** the route returns an HTTP 404 response

### Requirement: Rendering strategy for top cities vs. long tail
The system SHALL pre-render locality pages for the top ~20 cities' highest-listing-count localities via `generateStaticParams`, SHALL set `dynamicParams: true` for all other city/locality combinations, and SHALL set a `revalidate` interval consistent with the existing pattern on `app/property/[id]/page.js`.

#### Scenario: Top-city locality is statically generated at build time
- **WHEN** the build runs `generateStaticParams` for `app/[typeCity]/[locality]/page.js`
- **THEN** it includes entries for each of the top ~20 cities' highest-listing-count localities

#### Scenario: Long-tail locality renders on-demand
- **WHEN** a request hits a locality page not included in `generateStaticParams`
- **THEN** the page renders on-demand (ISR) rather than returning a build-time 404

### Requirement: Internal linking from locality pages
Every eligible locality page SHALL render breadcrumbs (national → city → locality) and a "nearby localities" / "similar property type" links block, so the page has inbound and outbound internal links rather than being orphaned.

#### Scenario: Locality page shows breadcrumbs and nearby links
- **WHEN** an eligible locality page renders
- **THEN** it includes a `LocalityBreadcrumbs` component and a `NearbyLocalities` component linking to at least one other eligible locality or the city-level fallback route
