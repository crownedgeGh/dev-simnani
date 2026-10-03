## ADDED Requirements

### Requirement: Curated locality content data shape
The system SHALL store curated locality copy in `lib/data/localityContent/<city-slug>.json`, one file per city, each entry keyed by locality slug with shape `{ overview, connectivity, socialInfra, priceTrend, rentalYield, faq }`, following the same flat-data-file convention as `lib/locations.js` and `lib/projects.js` (no CMS, no generation pipeline).

#### Scenario: Loading curated content for a locality
- **WHEN** `getLocalityPageData` looks up curated content for `city: "Bangalore"`, `locality: "Whitefield"`
- **THEN** it reads `lib/data/localityContent/bangalore.json` and returns the `whitefield` entry if present, or `null` if absent

### Requirement: Meta title and description length constraints
Every locality page and property detail page SHALL generate a `<title>` under 60 characters and a meta description under 155 characters, targeting transactional intent (e.g. "Flats for Sale in Whitefield, Bangalore | Simnani Estate").

#### Scenario: Locality page metadata length
- **WHEN** `generateMetadata` runs for a locality page
- **THEN** the resulting `title` string is at most 60 characters and `description` is at most 155 characters

### Requirement: Locality overview content sections
When a locality page has curated `LocalityContent`, it SHALL render, at minimum: a locality overview, connectivity info (metro/highway access), social infrastructure (schools/hospitals/malls), and a price-trend/ROI section (average price per sq. ft., rental yield where available).

#### Scenario: Curated content renders all required sections
- **WHEN** a locality page has a complete `LocalityContent` entry
- **THEN** the rendered page includes the overview, connectivity, social infrastructure, and price-trend sections in that content

### Requirement: FAQ section with schema-ready Q&A
When `LocalityContent.faq` is present, the page SHALL render a visible FAQ section (minimum 3 entries) addressing legal checks, RERA compliance, or lifestyle factors, matching the `FAQPage` JSON-LD emitted per `seo-structured-data`.

#### Scenario: FAQ visible content matches structured data
- **WHEN** a locality page renders its FAQ section
- **THEN** each visible question/answer pair corresponds exactly to an entry in the `FAQPage` JSON-LD block

### Requirement: Standalone long-form guide page template
The system SHALL support standalone long-form content pages (e.g. a RERA buyer's checklist) under a dedicated route (e.g. `app/guides/[slug]/page.js`), using the same metadata-length and FAQ-schema conventions as locality pages.

#### Scenario: Guide page follows the same SEO conventions
- **WHEN** `app/guides/rera-buyer-checklist/page.js` renders
- **THEN** its `generateMetadata` output respects the same title/description length constraints and, if it has FAQ content, emits matching `FAQPage` JSON-LD
