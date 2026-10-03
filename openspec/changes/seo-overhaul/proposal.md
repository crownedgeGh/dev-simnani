## Why

Every listing/city/locality page today (`/buy`, `/rent`, `/sell`, `/invest`, `/property/[id]`) is a single flat route with generic, hand-written `metadata`. There is no city- or locality-level URL (e.g. `/flats-for-sale-in-bangalore/whitefield`), no `sitemap.xml`/`robots.txt`, and no structured data (`JSON-LD`) anywhere in the codebase — confirmed by grep across `app/`, `components/`, `lib/`. `Property` documents in MongoDB (`models/Property.js`) already carry `city`, `locality`, `type`, and `price`, so the data needed to drive location-based SEO pages already exists; it's just never surfaced as crawlable, indexable routes. Competing portals (99acres, Magicbricks, Housing.com) rank primarily through city/locality landing pages and rich snippets — without this, Simnani Estate has no programmatic path into those search results.

## What Changes

- Add a new route segment `app/[propertyType]-in-[city]/[locality]/page.js` (e.g. `/flats-for-sale-in-bangalore/whitefield`) that server-renders a locality landing page from live `Property` data grouped by `city` + `locality` + `type`, with `generateMetadata` and `generateStaticParams`/ISR for the top cities and on-demand `dynamicParams` for the long tail.
- Add a thin-content guard: a locality page only renders (and is only added to the sitemap) once it has a minimum number of real listings or a hand-curated content block (locality overview, price trend, FAQ) — not for every city×locality combination.
- Add a reusable `LocalityContent` data shape (overview, connectivity, social infra, price-per-sqft trend, rental yield, FAQ) stored alongside existing `lib/` data files, keyed by `city + locality`, authored incrementally rather than auto-generated for all 2,000+ combinations at once.
- Add `JsonLd` rendering (`RealEstateListing`, `Offer`, `AggregateRating`, `PostalAddress`, `BreadcrumbList`, `FAQPage`) to `app/property/[id]/page.js` and the new locality pages, using existing `property.price`, `rera`/location fields on `models/Property.js` (extending the schema only where a field is missing, e.g. `reraId`).
- Add `app/sitemap.js` (dynamic, chunked by city) and `app/robots.js` — neither currently exists.
- Add an internal-linking component (breadcrumbs + "nearby localities" / "similar property types") so new locality pages aren't orphaned pages with no inbound links.
- Add a static buyer's-guide content page (`app/guides/rera-buyer-checklist/page.js` or similar under existing `app/legal`-style pattern) as one instance of a long-form SEO content template.
- **Not building**: an automated 100-city × 2,000-locality page generator that publishes all combinations on day one — that is the thin-content trap the proposal explicitly avoids. Pages are generated on-demand/ISR and only indexed once they clear the content-sufficiency bar above.

## Capabilities

### New Capabilities
- `seo-url-architecture`: canonical `/[type]-in-[city]/[locality]` route structure, param parsing/normalization, and its relationship to existing `/buy`, `/rent`, `/sell`, `/invest` routes (which remain as city-agnostic fallback listing pages).
- `seo-locality-pages`: how a locality landing page is rendered — data sourced from `Property` + curated `LocalityContent`, the thin-content eligibility rule, ISR/static-params strategy for top cities vs. on-demand for the long tail, and sitemap inclusion rule.
- `seo-structured-data`: JSON-LD schema components and where each is injected (property detail page, locality page), field mapping from `models/Property.js` to schema.org properties, and graceful omission when required fields (e.g. RERA ID) are missing.
- `seo-content-templates`: the authored-content contract for a locality page (overview, connectivity, price trend/ROI, FAQ) and for a long-form guide page, including meta title/description length constraints.

### Modified Capabilities
(none — no existing `openspec/specs/*` capability's requirements change; `/buy`, `/rent`, `/sell`, `/invest` keep their current behavior as fallback/browse routes)

## Impact

- **New routes**: `app/[type]-in-[city]/[locality]/page.js`, `app/sitemap.js`, `app/robots.js`, `app/guides/.../page.js`.
- **Data**: `models/Property.js` gains optional SEO-relevant fields (`reraId`, `rating`/`reviewCount` if not present) via additive schema change — no migration of existing docs required (fields are optional). New `lib/localityContent.js` (or `lib/data/locality/*.json`) for curated locality copy.
- **Server helpers**: extend `lib/propertiesServer.js` with a `getPropertiesByCityLocality(type, city, locality)` query (mirrors existing `getPropertiesByType`).
- **Components**: new `JsonLd` component (shared), new `LocalityLandingPage` content sections, new breadcrumb/internal-link component.
- **No new dependencies** — `JSON-LD` is plain `<script type="application/ld+json">`, sitemap/robots use Next's built-in `sitemap.js`/`robots.js` file conventions, already on Next 16.
- **Existing pages unaffected**: `/buy`, `/rent`, `/sell`, `/invest`, `/property/[id]` keep working; `/property/[id]` gains JSON-LD only (additive, non-breaking).
