## Context

`models/Property.js` already has `type` (enum: buy/sell/rent/invest/commercial/farming/industrial/lease/seized-property), `city`, `locality`, `propertyType` (e.g. "Flat"), `rawPrice`, `areaSize`. There is no `reraId` or review/rating field. `lib/propertiesServer.js` exposes `getPropertiesByType(type)` and `getPropertyById(id)`, both merging live Mongo docs with the static `PROPERTIES` fallback array. There is currently no `app/sitemap.js`, no `app/robots.js`, and no JSON-LD anywhere in the repo. City/locality today is free-text per listing — not a controlled vocabulary — so a locality page's existence depends on whether any `Property` doc happens to carry that exact `city`/`locality` string.

## Goals / Non-Goals

**Goals:**
- Introduce `/[type-slug]-in-[city]/[locality]` as a real, crawlable Next.js route backed by live `Property` data.
- Make every indexed page pass a minimum-content bar (real listings and/or curated copy) so Google never sees a near-duplicate shell page.
- Add JSON-LD to property detail pages and locality pages using fields that already exist on `Property`, degrading gracefully (omit a schema property rather than emit a fake one) where a field is missing.
- Ship `sitemap.js`/`robots.js` using Next's native file-convention APIs — zero new dependencies.

**Non-Goals:**
- Auto-generating and publishing all 100 cities × 2,000+ localities on day one. That's the thin-content failure mode the proposal exists to avoid; pages earn their way into the sitemap.
- Building a CMS for locality copy. Curated content is plain data files, authored incrementally, same pattern as `lib/locations.js`.
- Changing `/buy`, `/rent`, `/sell`, `/invest` behavior — they stay as city-agnostic browse/fallback routes and gain only an internal link out to the matching locality page when one exists.
- Real RERA-ID verification or legal compliance tooling — `reraId` is a display field sourced from the poster/admin, not independently validated.

## Decisions

**1. URL shape: `app/[typeCity]/[locality]/page.js` with a single combined segment, parsed in code — not `app/[type]/[city]/[locality]`.**
`/flats-for-sale-in-bangalore/whitefield` is one SEO-mandated slug (`flats-for-sale-in-bangalore`), not two path segments. It's parsed into `{ propertyType: "flats", purpose: "sale", city: "bangalore" }` via a small regex/lookup table (`lib/seoSlug.js`), because the hyphenated compound ("for-sale-in-", "for-rent-in-") isn't a clean split Next's dynamic segments can do on their own.
*Alternative considered*: `app/[type]/[purpose]/[city]/[locality]` (clean nested segments) — rejected because it doesn't match the exact URL the proposal requires and loses the keyword-rich single-slug SEO benefit competitors (99acres, Magicbricks) rely on.

**2. Rendering strategy: `generateStaticParams` for top ~20 cities × their top localities (by listing count) at build time; everything else is `dynamicParams: true` + `revalidate` (ISR), same pattern already used by `/property/[id]` (`export const revalidate = 60`).**
*Alternative considered*: fully static generation for all 2,000+ localities — rejected, build-time cost and the thin-content problem (most would have 0 listings at build time). Fully dynamic (no static params) — rejected for the top cities, where pre-rendering measurably helps TTFB/SEO crawl budget.

**3. Content-sufficiency gate lives in the data-fetch helper, not the route.**
`getLocalityPageData(type, city, locality)` (new, in `lib/propertiesServer.js`) returns `{ properties, content, isEligible }`. `isEligible` is true only if `properties.length >= 3` OR a curated `LocalityContent` entry exists for that `city+locality`. The page calls `notFound()` when `!isEligible`, and `app/sitemap.js` only lists URLs where the same helper reports eligible — one source of truth for "does this page deserve to be indexed," not duplicated logic between the route and the sitemap.

**4. Curated locality content as flat data, not auto-generated prose.**
`lib/data/localityContent/<city-slug>.json` (lazy-loaded per city, not one giant file) holds `{ locality, overview, connectivity, socialInfra, priceTrend, rentalYield, faq }` keyed objects, authored by the growth/content team one city at a time — same shape and workflow as the existing `lib/locations.js` / `lib/projects.js` static data. No generation pipeline; this is explicitly out of scope (Non-Goals).

**5. JSON-LD via one shared `<JsonLd data={...} />` component (`components/seo/JsonLd.jsx`), not a schema library.**
It's a server component that renders `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}>` — `JSON.stringify` on a plain object already escapes it safely for this context; no new dependency (e.g. `schema-dts`) justified for emitting a handful of known shapes.
Field mapping (`RealEstateListing`/`Offer`):
- `price`→`offers.price` (strip currency formatting, require `rawPrice` or parse `price`), `priceCurrency: "INR"`.
- `city`/`locality`/`address`→`address` (`PostalAddress`).
- `reraId` (new optional field, see Decision 6)→custom `additionalProperty` entry — schema.org has no first-class RERA property; omit the whole `additionalProperty` block when absent, never emit a placeholder.
- No `AggregateRating` is emitted until there's a real `rating`/`reviewCount` field with real data — emitting a fabricated rating is a Google spam-policy violation (reviews must reflect genuine user-submitted ratings), not just a design preference.

**6. `models/Property.js` schema change: add `reraId: { type: String, default: "" }` only.**
Additive, optional, `strict: false` already on the schema so this is non-breaking for existing docs. No `rating`/`reviewCount` field added now, per Decision 5 — add it later only alongside a real review-collection feature.

**7. Internal linking: a `LocalityBreadcrumbs` + `NearbyLocalities` component on the new pages, and a single "Browse by locality" link added to `/buy`, `/rent`, `/sell`, `/invest`.**
Prevents the classic programmatic-SEO orphan-page problem (pages with no inbound internal links rank poorly regardless of content quality).

## Risks / Trade-offs

- **[Risk] Free-text `city`/`locality` on `Property` means inconsistent casing/spelling ("Bangalore" vs "Bengaluru") could split listings across two different "pages" for what should be one locality.** → Mitigation: slug normalization table (`lib/seoSlug.js`) maps known aliases to one canonical city/locality slug before querying; this is the same normalization already implicitly needed for the URL slug itself.
- **[Risk] Thin-content gate (3+ listings) means most of the 2,000+ localities simply won't have a page for a long time.** → Mitigation: that's intentional (Non-Goals) — curated `LocalityContent` entries let the growth team unlock high-value localities ahead of organic listing volume, without waiting on inventory.
- **[Risk] ISR long-tail pages (`dynamicParams: true`) mean a crawler's first hit to a brand-new locality is an uncached render.** → Mitigation: same trade-off already accepted on `/property/[id]` today; acceptable given `getLocalityPageData` is a single indexed Mongo query.
- **[Risk] JSON-LD field mapping from free-text `price` (e.g. `"₹1.25 Cr"`) to a numeric `Offer.price` is lossy/fragile.** → Mitigation: prefer `rawPrice` (already a `Number` field on new listings) and skip the `Offer` block entirely for older docs that only have the formatted string and no `rawPrice` — never regex-guess a number out of display text.

## Migration Plan

1. Additive Mongo schema field (`reraId`) — no backfill needed, defaults to `""`, existing docs unaffected.
2. Ship `lib/seoSlug.js`, `getLocalityPageData`, the new route, `JsonLd` component, `sitemap.js`/`robots.js` behind normal deploy (no feature flag needed — a 404 for ineligible localities is the correct behavior, not a bug to hide).
3. Add JSON-LD to `/property/[id]` first (lowest risk, highest existing traffic) and validate with Google's Rich Results Test before enabling it on the new locality pages.
4. Seed `LocalityContent` for a small number (5–10) of flagship city/locality combos at launch (e.g. Bangalore/Whitefield, Bangalore/Indiranagar — matching existing `PROPERTIES` sample data) to prove the template before the content team scales authoring.
5. Rollback: the new route, sitemap, and JSON-LD are all additive/new files — revert is a plain file revert, no data migration to undo.

## Open Questions

- Which canonical city-name list governs slugs — extend `lib/indianCities.js`/`lib/cityState.js` (already in the repo) or introduce a new one? (Leaning: extend existing, confirm during `tasks`.)
- Who owns authoring `LocalityContent` going forward (content/growth team vs. engineering seeding placeholder copy)? Out of engineering's control — flagged for the proposal owner, not blocking implementation of the mechanism.
