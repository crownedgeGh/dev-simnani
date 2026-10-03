// Parses the combined "<type-phrase>-in-<city>" URL segment used by SEO
// locality landing pages (e.g. "flats-for-sale-in-bangalore") and normalizes
// city name variants (Bangalore/Bengaluru, Gurgaon/Gurugram, ...) to one
// canonical slug so listings stored under either spelling still match.

// Ordered by phrase length (longest first) so e.g. "apartments-for-sale"
// isn't shadowed by a shorter prefix match.
const TYPE_PHRASES = [
  { slug: "apartments-for-sale", type: "buy", propertyType: "Flat", label: "Apartments for Sale" },
  { slug: "apartments-for-rent", type: "rent", propertyType: "Flat", label: "Apartments for Rent" },
  { slug: "flats-for-sale", type: "buy", propertyType: "Flat", label: "Flats for Sale" },
  { slug: "flats-for-rent", type: "rent", propertyType: "Flat", label: "Flats for Rent" },
  { slug: "villas-for-sale", type: "buy", propertyType: "Villa", label: "Villas for Sale" },
  { slug: "villas-for-rent", type: "rent", propertyType: "Villa", label: "Villas for Rent" },
  { slug: "plots-for-sale", type: "buy", propertyType: "Plot", label: "Plots for Sale" },
  { slug: "houses-for-rent", type: "rent", propertyType: "", label: "Houses for Rent" },
  { slug: "properties-for-lease", type: "lease", propertyType: "", label: "Properties for Lease" },
  { slug: "commercial-properties-for-sale", type: "commercial", propertyType: "", label: "Commercial Properties for Sale" },
  { slug: "investment-properties", type: "invest", propertyType: "", label: "Investment Properties" },
].sort((a, b) => b.slug.length - a.slug.length);

// City names that resolve to more than one spelling in real-world listing
// data. Keyed by canonical slug; first alias is the display name.
const CITY_ALIASES = {
  bangalore: ["Bangalore", "Bengaluru"],
  mumbai: ["Mumbai", "Bombay"],
  gurgaon: ["Gurgaon", "Gurugram"],
  kolkata: ["Kolkata", "Calcutta"],
  kochi: ["Kochi", "Cochin"],
  delhi: ["Delhi", "New Delhi"],
};

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleCase(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function normalizeCitySlug(cityOrSlug) {
  const slug = slugify(cityOrSlug);
  for (const [canonical, aliases] of Object.entries(CITY_ALIASES)) {
    if (slug === canonical || aliases.some((a) => slugify(a) === slug)) return canonical;
  }
  return slug;
}

export function getCityDisplayName(citySlug) {
  return CITY_ALIASES[citySlug]?.[0] || titleCase(citySlug);
}

export function getCityAliases(citySlug) {
  return CITY_ALIASES[citySlug] || [titleCase(citySlug)];
}

export function localitySlugToDisplayName(localitySlug) {
  return titleCase(localitySlug);
}

/** Parses "flats-for-sale-in-bangalore" into { ...phrase, citySlug: "bangalore" }, or null if unrecognized. */
export function parseTypeCitySlug(typeCity) {
  const slug = String(typeCity).toLowerCase();
  for (const phrase of TYPE_PHRASES) {
    const prefix = `${phrase.slug}-in-`;
    if (slug.startsWith(prefix) && slug.length > prefix.length) {
      const citySlug = normalizeCitySlug(slug.slice(prefix.length));
      return { ...phrase, citySlug };
    }
  }
  return null;
}

export function buildTypeCitySlug(phraseSlug, citySlug) {
  return `${phraseSlug}-in-${citySlug}`;
}

// Cities with curated LocalityContent seeded so far — the only ones
// statically generated at build time (see app/[typeCity]/[locality]/page.js).
export const FLAGSHIP_CITIES = [
  "bangalore",
  "mumbai",
  "hyderabad",
  "pune",
  "raipur",
  "bilaspur",
  "bhilai",
  "durg",
];

export { TYPE_PHRASES };
