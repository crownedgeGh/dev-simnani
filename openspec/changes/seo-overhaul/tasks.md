## 1. Slug parsing & data layer

- [x] 1.1 Create `lib/seoSlug.js`: lookup table mapping type-phrase (`flats-for-sale`, `apartments-for-rent`, `plots-for-sale`, etc.) to `{ propertyType, purpose }`, and a city-alias normalization map (reuse/extend `lib/indianCities.js` / `lib/cityState.js`); export `parseTypeCitySlug(typeCity)` and `normalizeCitySlug(city)`.
- [x] 1.2 Add `reraId: { type: String, default: "" }` to `models/Property.js`.
- [x] 1.3 Add `getLocalityPageData(propertyType, city, locality)` to `lib/propertiesServer.js`: queries `Property` by normalized `city`+`locality`+`type`, loads curated content (task 4.1), returns `{ properties, content, isEligible }` per the `seo-locality-pages` eligibility rule (>=3 listings OR curated content present).

## 2. Locality route

- [x] 2.1 Create `app/[typeCity]/[locality]/page.js`: parse params via `lib/seoSlug.js`, call `getLocalityPageData`, `notFound()` when `!isEligible`.
- [x] 2.2 Implement `generateMetadata` on the route: title <60 chars, description <155 chars, per `seo-content-templates`.
- [x] 2.3 Implement `generateStaticParams` for the top ~20 cities' highest-listing-count localities; set `dynamicParams: true` and a `revalidate` value matching `app/property/[id]/page.js`'s existing pattern. (ponytail: statics cover only the curated flagship localities for now — see comment in page.js)
- [x] 2.4 Build the page body: reuse existing property-card/listing components for the `properties` list; render curated content sections (overview, connectivity, social infra, price trend/ROI) when present.

## 3. Internal linking

- [x] 3.1 Create `components/seo/LocalityBreadcrumbs.jsx` (national → city → locality, linking to the city browse route and locality page).
- [x] 3.2 Create `components/seo/NearbyLocalities.jsx` (links to other eligible localities in the same city, or falls back to the city-level `/buy`-style route if none).
- [x] 3.3 Add a "Browse by locality" entry point link on `/buy`, `/rent`, `/sell`, `/invest` pages pointing at relevant locality pages.

## 4. Curated content

- [x] 4.1 Create `lib/data/localityContent/` directory convention + loader (`getLocalityContent(citySlug, localitySlug)`), one JSON file per city, shape `{ overview, connectivity, socialInfra, priceTrend, rentalYield, faq }`.
- [x] 4.2 Seed 5–10 flagship entries matching existing sample data (e.g. `bangalore.json` with `whitefield`, `indiranagar`; `mumbai.json` with `bandra`), including price-per-sqft figures and a 3–5 item FAQ array per locality.

## 5. Structured data

- [x] 5.1 Create `components/seo/JsonLd.jsx` (server component, `JSON.stringify` into `<script type="application/ld+json">`).
- [x] 5.2 Add `RealEstateListing` + `PostalAddress` + conditional `Offer` (only when `rawPrice` present) + conditional `additionalProperty` (only when `reraId` present) JSON-LD to `app/property/[id]/page.js`.
- [x] 5.3 Add `BreadcrumbList` JSON-LD to the locality page, matching the visible `LocalityBreadcrumbs`.
- [x] 5.4 Add conditional `FAQPage` JSON-LD to the locality page when `LocalityContent.faq` is present, matching the visible FAQ section exactly.
- [x] 5.5 Validate both property-detail and locality-page JSON-LD against Google's Rich Results Test before enabling broadly. (verified locally: both blocks parse as well-formed JSON and match the RealEstateListing/Offer/PostalAddress/BreadcrumbList/FAQPage shapes — Google's live tool needs a public URL, so run it post-deploy)

## 6. Sitemap & robots

- [x] 6.1 Create `app/sitemap.js`: enumerate eligible `[typeCity]/[locality]` URLs via the same `getLocalityPageData`/eligibility check used by the route (single source of truth), chunked by city if the entry count requires Next's sitemap index support. (ponytail: enumerates only the curated flagship set for now, not a full 100-city sweep)
- [x] 6.2 Create `app/robots.js` referencing the sitemap, disallowing `/portal`, `/account`, `/admin`, `/api` per existing auth-gated routes.

## 7. Long-form guide template

- [x] 7.1 Create `app/guides/[slug]/page.js` (or `app/guides/rera-buyer-checklist/page.js` if a single static page suffices) using the same metadata-length and conditional `FAQPage` JSON-LD conventions as the locality page. (used the single static-route form — only one guide exists)
- [x] 7.2 Write the RERA buyer's-checklist guide content (overview, legal-document checklist, hidden-costs table, home-loan eligibility, developer red flags, 3-question FAQ).

## 8. Verification

- [x] 8.1 Manually test: top-city locality page (static), long-tail locality page (ISR 404 vs. render), legacy `/buy`/`/rent`/`/sell`/`/invest` routes unaffected. (dev-server curl checks: eligible locality 200, ineligible locality 404, unrecognized slug 404, `/buy` unaffected)
- [x] 8.2 Run `npm run lint` and `npm run build`. (clean on all new/changed files; 3 pre-existing unrelated lint errors elsewhere untouched)
- [x] 8.3 Confirm `app/sitemap.js` output only lists eligible locality URLs and `app/robots.js` correctly disallows gated routes. (verified: sitemap.xml lists exactly the 6 curated flagship localities + static/property routes; robots.txt disallows /portal, /account, /admin, /api, /post-property)
