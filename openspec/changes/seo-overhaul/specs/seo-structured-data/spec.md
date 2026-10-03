## ADDED Requirements

### Requirement: Shared JSON-LD rendering component
The system SHALL provide `components/seo/JsonLd.jsx`, a server component that accepts a plain object and renders it as `<script type="application/ld+json">` via `JSON.stringify`, with no third-party schema library dependency.

#### Scenario: Rendering a schema object
- **WHEN** `<JsonLd data={{ "@context": "https://schema.org", "@type": "RealEstateListing", ... }} />` is rendered
- **THEN** the output HTML contains a `<script type="application/ld+json">` tag whose contents are the JSON-serialized input object

### Requirement: RealEstateListing and Offer schema on property detail pages
`app/property/[id]/page.js` SHALL render a `RealEstateListing` JSON-LD block including `PostalAddress` (from `city`/`locality`/`address`) and an `Offer` block with `priceCurrency: "INR"`, using `rawPrice` when present.

#### Scenario: Property with rawPrice emits a numeric Offer
- **WHEN** a property has `rawPrice: 12500000`
- **THEN** the JSON-LD `Offer.price` is `12500000` and `Offer.priceCurrency` is `"INR"`

#### Scenario: Property without rawPrice omits the Offer block
- **WHEN** a property has no `rawPrice` field and only a formatted `price` string (e.g. `"₹1.25 Cr"`)
- **THEN** the JSON-LD omits the `Offer` block rather than guessing a numeric price from the formatted string

### Requirement: Optional RERA identifier surfaced in structured data
`models/Property.js` SHALL have an optional `reraId` field (default `""`). When `reraId` is non-empty, the property detail page's JSON-LD SHALL include it as an `additionalProperty` entry; when empty, the `additionalProperty` block SHALL be omitted entirely.

#### Scenario: Property with a RERA ID
- **WHEN** a property has `reraId: "PRM/KA/RERA/1251/446/PR/..."`
- **THEN** the JSON-LD includes an `additionalProperty` entry naming the RERA ID

#### Scenario: Property without a RERA ID
- **WHEN** a property has `reraId: ""`
- **THEN** the JSON-LD contains no `additionalProperty` block for RERA

### Requirement: No fabricated review data
The system SHALL NOT emit an `AggregateRating` JSON-LD block unless real `rating`/`reviewCount` data exists on the entity. No placeholder or estimated rating SHALL ever be emitted.

#### Scenario: No rating data available
- **WHEN** a property or locality page has no real rating/review data
- **THEN** its JSON-LD contains no `AggregateRating` block

### Requirement: BreadcrumbList and FAQPage schema on locality pages
Eligible locality pages SHALL render `BreadcrumbList` JSON-LD matching their visible breadcrumb trail, and SHALL render `FAQPage` JSON-LD when the page's curated `LocalityContent` includes an FAQ array.

#### Scenario: Locality page with curated FAQ content
- **WHEN** a locality page's `LocalityContent.faq` array is non-empty
- **THEN** the page renders a `FAQPage` JSON-LD block with one `Question`/`acceptedAnswer` pair per FAQ entry
