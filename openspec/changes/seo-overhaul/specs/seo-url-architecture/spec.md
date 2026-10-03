## ADDED Requirements

### Requirement: Combined type-city slug parsing
The system SHALL expose a route at `app/[typeCity]/[locality]/page.js` where `typeCity` is a single hyphenated slug of the form `<property-type-phrase>-in-<city-slug>` (e.g. `flats-for-sale-in-bangalore`), and SHALL parse it server-side into `{ propertyType, purpose, city }` using a lookup table in `lib/seoSlug.js` rather than relying on Next.js to split it into multiple dynamic segments.

#### Scenario: Valid combined slug resolves to a known type and city
- **WHEN** a request hits `/flats-for-sale-in-bangalore/whitefield`
- **THEN** `lib/seoSlug.js` parses `typeCity` into `{ propertyType: "Flat", purpose: "sale", city: "Bangalore" }` and `locality` into `"Whitefield"`

#### Scenario: Unrecognized type-city phrase returns 404
- **WHEN** a request hits `/garbage-slug-xyz/whitefield`
- **THEN** the parser fails to match a known `<type>-<purpose>-in-<city>` pattern and the route calls `notFound()`

### Requirement: City and locality slug normalization
The system SHALL normalize city and locality name variants (casing, known aliases such as "Bangalore"/"Bengaluru") to one canonical slug before querying `Property` data, so listings stored under different spellings of the same place still resolve to a single page.

#### Scenario: Alias city name normalizes to canonical slug
- **WHEN** `lib/seoSlug.js` receives city input `"Bengaluru"` or `"bangalore"`
- **THEN** both normalize to the same canonical city slug used in `getLocalityPageData` queries

### Requirement: Existing browse routes remain unchanged
The system SHALL leave `/buy`, `/rent`, `/sell`, `/invest` functioning exactly as today (city-agnostic listing browse pages) and SHALL NOT redirect or rewrite them to the new `[typeCity]/[locality]` route.

#### Scenario: Legacy browse route still serves all properties of a type
- **WHEN** a user visits `/buy`
- **THEN** the page renders via the existing `getPropertiesByType("buy")` path, unaffected by the new route's existence
