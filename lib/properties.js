import indianCities from "@/lib/data/indianCities.json";
import { PROJECTS } from "@/lib/projects";

export const PROPERTIES = [];


export const COMMERCIAL_CATEGORIES = [
  // Shop, Office and Warehouse used to be selectable "Property Type" options
  // under Residential — they now live here as Commercial categories instead.
  { key: "shop", label: "Shop", icon: "MdStorefront" },
  { key: "office", label: "Office", icon: "MdBusiness" },
  { key: "ready-to-move-offices", label: "Ready to Move Offices", icon: "MdApartment" },
  { key: "bare-shell-offices", label: "Bare Shell Offices", icon: "MdMeetingRoom" },
  { key: "shops-retail", label: "Shops & Retail", icon: "MdStorefront" },
  { key: "commercial-institutional-land", label: "Commercial/Inst. Land", icon: "MdLocationCity" },
  { key: "warehouse", label: "Warehouse", icon: "MdWarehouse" },
  { key: "cold-storage", label: "Cold Storage", icon: "MdAcUnit" },
  { key: "factory-manufacturing", label: "Factory & Manufacturing", icon: "MdFactory" },
  { key: "hotel-resorts", label: "Hotel/Resorts", icon: "MdHotel" },
  { key: "others", label: "Others", icon: "MdCategory" },
];

export const INVEST_CATEGORIES = [
  { key: "shops", label: "Shops", icon: "MdStorefront" },
  { key: "land", label: "Big Land", icon: "MdTerrain" },
  { key: "farmhouse", label: "Farmhouse", icon: "MdAgriculture" },
  { key: "offices", label: "Offices", icon: "MdApartment" },
  { key: "apartments", label: "Apartments", icon: "MdHome" },
  { key: "others", label: "Others", icon: "MdCategory" },
];

export const AGRICULTURE_CATEGORIES = [
  { key: "farm-house", label: "Farm House", icon: "MdAgriculture" },
  { key: "agricultural-land", label: "Agricultural Land", icon: "MdTerrain" },
  { key: "orchard-plantation", label: "Orchard & Plantation", icon: "MdPark" },
  { key: "farm-land-with-well", label: "Farm Land with Water Source", icon: "MdWaterDrop" },
  { key: "organic-farming", label: "Organic Farming", icon: "MdEco" },
  { key: "horticulture", label: "Horticulture", icon: "MdLocalFlorist" },
  { key: "plantation-farming", label: "Plantation Farming", icon: "MdForest" },
  { key: "dairy-farming", label: "Dairy Farming", icon: "MdPets" },
  { key: "fish-farming", label: "Fish Farming", icon: "MdWaves" },
  { key: "poultry-farming", label: "Poultry Farming", icon: "MdEgg" },
  { key: "greenhouse-polyhouse-farming", label: "Greenhouse / Polyhouse Farming", icon: "MdGrass" },
  { key: "others", label: "Others", icon: "MdCategory" },
];

export const BIG_LAND_CATEGORIES = [
  "agricultural-land",
  "organic-farming",
  "horticulture",
  "plantation-farming",
  "dairy-farming",
  "fish-farming",
  "poultry-farming",
  "greenhouse-polyhouse-farming",
].map((key) => AGRICULTURE_CATEGORIES.find((category) => category.key === key));

export const INDUSTRIAL_CATEGORIES = [
  { key: "warehouse", label: "Warehouse", icon: "MdWarehouse" },
  { key: "factory-manufacturing", label: "Factory & Manufacturing", icon: "MdFactory" },
  { key: "cold-storage", label: "Cold Storage", icon: "MdAcUnit" },
  { key: "industrial-land-plots", label: "Industrial Land/Plots", icon: "MdTerrain" },
  { key: "industrial-sheds", label: "Industrial Sheds", icon: "MdConstruction" },
  { key: "logistics-distribution", label: "Logistics & Distribution", icon: "MdLocalShipping" },
  { key: "others", label: "Others", icon: "MdCategory" },
];

export const SEIZED_PROPERTY_CATEGORIES = [
  { key: "residential-flats-apartments", label: "Flats & Apartments", icon: "MdApartment" },
  { key: "independent-houses-villas", label: "Independent Houses & Villas", icon: "MdHome" },
  { key: "plots-land", label: "Plots & Land", icon: "MdTerrain" },
  { key: "agricultural-land", label: "Agricultural Land", icon: "MdAgriculture" },
  { key: "commercial-shops-showrooms", label: "Shops & Showrooms", icon: "MdStorefront" },
  { key: "office-spaces", label: "Office Spaces", icon: "MdMeetingRoom" },
  { key: "industrial-warehouses", label: "Industrial & Warehouses", icon: "MdWarehouse" },
  { key: "others", label: "Others", icon: "MdCategory" },
];

// Single source of truth mapping each platform type to its browsable
// sub-categories. Used by PostPropertyForm and the admin add/edit forms so
// the "Category" dropdown always matches what /commercial, /farming,
// /industrial, /invest and /seized-property actually render.
export const CATEGORIES_BY_TYPE = {
  commercial: COMMERCIAL_CATEGORIES,
  farming: AGRICULTURE_CATEGORIES,
  industrial: INDUSTRIAL_CATEGORIES,
  invest: INVEST_CATEGORIES,
  "seized-property": SEIZED_PROPERTY_CATEGORIES,
};

// Land-only categories under Commercial / Farming / Industrial / Invest —
// bare land or plots with no built structure, so bedrooms, bathrooms,
// halls, floors, furnishing and parking questions don't apply to them.
export const LAND_CATEGORY_KEYS = new Set([
  "commercial-institutional-land", // commercial
  "land", // invest
  "industrial-land-plots", // industrial
  "agricultural-land",
  "orchard-plantation",
  "farm-land-with-well",
  "organic-farming",
  "horticulture",
  "plantation-farming",
  "dairy-farming",
  "fish-farming",
  "poultry-farming",
  "greenhouse-polyhouse-farming",
  "plots-land", // seized-property
]);

// Non-residential categories that still have a residential-style structure
// (so Bedrooms/Halls fields are relevant) even though listed outside the
// Residential section.
export const CATEGORIES_WITH_BEDROOMS = new Set([
  "farm-house",
  "farmhouse",
  "apartments",
  "residential-flats-apartments",
  "independent-houses-villas",
]);

// True when a listing represents a built structure rather than bare land —
// decides whether to show bedrooms/bathrooms/halls/floors/furnishing/parking
// fields in PostPropertyForm and the admin add/edit forms. Residential
// types (buy/sell/rent/lease) are never in CATEGORIES_BY_TYPE and always
// represent a structure.
export function isStructureCategory(type, category) {
  if (!CATEGORIES_BY_TYPE[type]) return true;
  if (!category) return false;
  return !LAND_CATEGORY_KEYS.has(category);
}

// True for the Residential listing "type" values (buy/sell/rent/lease) —
// every other type (commercial/farming/industrial/invest/seized-property)
// has its own entry in CATEGORIES_BY_TYPE.
export function isResidentialSection(type) {
  return !CATEGORIES_BY_TYPE[type];
}

// PG and Hostel are residential "Property Type" sub-categories that have no
// BHK concept — occupants share rooms, so bedrooms/halls/BHK questions don't
// apply to them (they use Gender Preference instead, see below).
const PG_HOSTEL_PROPERTY_TYPES = new Set(["PG", "Hostel"]);

export function isPgOrHostel(propertyType) {
  return PG_HOSTEL_PROPERTY_TYPES.has(propertyType);
}

// Gender preference options shown only when propertyType is PG or Hostel —
// replaces the BHK/bedrooms questions for these listings.
export const GENDER_PREFERENCE_OPTIONS = [
  { value: "boys", label: "For Boys Only" },
  { value: "girls", label: "For Girls Only" },
  { value: "anyone", label: "Anyone" },
];

export function getGenderPreferenceLabel(value) {
  return GENDER_PREFERENCE_OPTIONS.find((opt) => opt.value === value)?.label || "";
}

// Bathroom options shown only when propertyType is PG or Hostel
export const PG_HOSTEL_BATHROOM_OPTIONS = [
  { value: "Common / General Bathroom", label: "Common / General Bathroom" },
  { value: "Attach in Room", label: "Attach in Room" },
];

export function getBathroomTypeLabel(value) {
  if (!value) return "";
  const found = PG_HOSTEL_BATHROOM_OPTIONS.find((opt) => opt.value === value);
  if (found) return found.label;
  if (typeof value === "string") {
    if (value.toLowerCase().includes("common") || value.toLowerCase().includes("general")) {
      return "Common / General Bathroom";
    }
    if (value.toLowerCase().includes("attach")) {
      return "Attach in Room";
    }
  }
  return value;
}

// True when bedrooms/halls fields are relevant for this type + category.
// propertyType is only meaningful for residential listings (Flat, House, PG,
// Hostel, …) — PG/Hostel never ask for bedrooms/BHK.
export function categoryHasBedrooms(type, category, propertyType) {
  if (isPgOrHostel(propertyType)) return false;
  if (!CATEGORIES_BY_TYPE[type]) return true;
  return CATEGORIES_WITH_BEDROOMS.has(category);
}

// ---------------------------------------------------------------------------
// Field profiles — real-world spec sheets differ a lot by property kind. A
// warehouse has no bedrooms/bathrooms/furnishing; a bare plot has none of
// bedrooms/bathrooms/floors/furnishing/parking either; a PG has no BHK/baths
// but does have furnishing (rooms are usually furnished). This maps every
// section/category/propertyType combination in the app to a named profile so
// PostPropertyForm (and any other form) can show only the fields that make
// sense for what the user actually selected, instead of one fixed field set.
// ---------------------------------------------------------------------------
export const FIELD_PROFILES = {
  // Flats, houses, farmhouses, apartments, villas — the full residential set.
  residential: {
    bhk: true,
    beds: true,
    halls: true,
    baths: true,
    floors: true,
    furnishing: true,
    parking: true,
    facing: true,
    preferredFor: true,
  },
  // Shops, showrooms, offices — no bedrooms/halls, but washrooms, furnishing
  // (bare-shell vs fitted-out), floor and parking all matter.
  "office-retail": {
    bhk: false,
    beds: false,
    halls: false,
    baths: true,
    floors: true,
    furnishing: true,
    parking: true,
    facing: true,
    preferredFor: false,
  },
  // Hotels/resorts — same practical spec sheet as office-retail in this app's
  // field set (rooms/baths, furnishing, floors, parking, facing all apply).
  hospitality: {
    bhk: false,
    beds: false,
    halls: false,
    baths: true,
    floors: true,
    furnishing: true,
    parking: true,
    facing: true,
    preferredFor: false,
  },
  // Warehouses, factories, cold storage, industrial sheds/logistics — no
  // bedrooms/bathrooms/furnishing concept; only floor, parking (loading/
  // vehicle access) and facing are relevant.
  industrial: {
    bhk: false,
    beds: false,
    halls: false,
    baths: false,
    floors: true,
    furnishing: false,
    parking: true,
    facing: true,
    preferredFor: false,
  },
  // Bare land/plots — no built structure at all, so nothing but facing
  // (plot orientation) applies.
  land: {
    bhk: false,
    beds: false,
    halls: false,
    baths: false,
    floors: false,
    furnishing: false,
    parking: false,
    facing: true,
    preferredFor: false,
  },
  // PG/Hostel — shared rooms, so no BHK/bedrooms/baths/facing/preferred-for;
  // floor, furnishing (rooms are usually furnished) and parking still apply.
  // Gender Preference is asked separately in place of BHK.
  "pg-hostel": {
    bhk: false,
    beds: false,
    halls: false,
    baths: false,
    bathroomType: true,
    floors: true,
    furnishing: true,
    parking: true,
    facing: false,
    preferredFor: false,
  },
};

// Residential "Property Type" dropdown options. Residential only ever covers
// House, Flat, PG, Hostel and Plot — every other property kind (Shop,
// Office, Warehouse, etc.) is listed under the Commercial section's Category
// dropdown instead (see COMMERCIAL_CATEGORIES above). This is the single
// source of truth consumed by PostPropertyForm and the admin add/edit forms.
export const RESIDENTIAL_PROPERTY_TYPES = ["Flat", "House", "Plot", "PG", "Hostel"];

// Residential "Property Type" (Flat/House/Plot/PG/Hostel) -> field profile.
// This is the dropdown shown for the Residential listing section.
export const RESIDENTIAL_PROPERTY_TYPE_PROFILE = {
  Flat: "residential",
  House: "residential",
  Plot: "land",
  PG: "pg-hostel",
  Hostel: "pg-hostel",
};

// Category -> field profile, per non-residential section. Mirrors the real
// category lists in CATEGORIES_BY_TYPE above.
export const CATEGORY_FIELD_PROFILE = {
  commercial: {
    shop: "office-retail",
    office: "office-retail",
    "ready-to-move-offices": "office-retail",
    "bare-shell-offices": "office-retail",
    "shops-retail": "office-retail",
    "commercial-institutional-land": "land",
    warehouse: "industrial",
    "cold-storage": "industrial",
    "factory-manufacturing": "industrial",
    "hotel-resorts": "hospitality",
    others: "office-retail",
  },
  farming: {
    "farm-house": "residential",
    "agricultural-land": "land",
    "orchard-plantation": "land",
    "farm-land-with-well": "land",
    "organic-farming": "land",
    horticulture: "land",
    "plantation-farming": "land",
    "dairy-farming": "land",
    "fish-farming": "land",
    "poultry-farming": "land",
    "greenhouse-polyhouse-farming": "land",
    others: "office-retail",
  },
  industrial: {
    warehouse: "industrial",
    "factory-manufacturing": "industrial",
    "cold-storage": "industrial",
    "industrial-land-plots": "land",
    "industrial-sheds": "industrial",
    "logistics-distribution": "industrial",
    others: "office-retail",
  },
  invest: {
    shops: "office-retail",
    land: "land",
    farmhouse: "residential",
    offices: "office-retail",
    apartments: "residential",
    others: "office-retail",
  },
  "seized-property": {
    "residential-flats-apartments": "residential",
    "independent-houses-villas": "residential",
    "plots-land": "land",
    "agricultural-land": "land",
    "commercial-shops-showrooms": "office-retail",
    "office-spaces": "office-retail",
    "industrial-warehouses": "industrial",
    others: "office-retail",
  },
};

// Resolves the field profile (which spec fields to show) for any section +
// category + propertyType combination used across the app's listing forms.
// - Residential section (buy/sell/rent/lease): keyed by propertyType.
// - Every other section: keyed by category.
// Falls back to the full "residential" profile so an unmapped/empty
// selection never silently hides required fields.
export function getFieldProfile(section, category, propertyType) {
  const isResidentialSection = !CATEGORIES_BY_TYPE[section];
  const profileKey = isResidentialSection
    ? RESIDENTIAL_PROPERTY_TYPE_PROFILE[propertyType]
    : CATEGORY_FIELD_PROFILE[section]?.[category];
  return FIELD_PROFILES[profileKey] || FIELD_PROFILES.residential;
}

export const TYPE_LABELS = {
  buy: "Buy",
  sell: "Sell",
  rent: "Rent",
  lease: "Lease",
  invest: "Invest",
  commercial: "Commercial",
  industrial: "Industrial",
  farming: "Farming",
  "seized-property": "Seized Property",
};

// Keyword -> label lookup used to infer a residential listing's property
// type from its title when no explicit propertyType/category is stored
// (covers the static demo PROPERTIES, which predate the propertyType field).
// Ordered most-specific first so "Farmhouse" wins over a generic "House" match.
const RESIDENTIAL_TITLE_KEYWORDS = [
  ["penthouse", "Penthouse"],
  ["duplex", "Duplex"],
  ["studio", "Studio"],
  ["farmhouse", "Farmhouse"],
  ["villa", "Villa"],
  ["apartment", "Apartment"],
  ["flat", "Flat"],
  ["house", "House"],
  ["plot", "Plot"],
];

function deriveResidentialCategory(property) {
  if (property?.propertyType) return property.propertyType;

  const title = (property?.title || "").toLowerCase();
  const found = RESIDENTIAL_TITLE_KEYWORDS.find(([keyword]) => title.includes(keyword));
  return found?.[1] || "";
}

// Resolves a property's type + category into readable labels, e.g.
// { typeLabel: "Commercial", categoryLabel: "Shops & Retail" } for
// { type: "commercial", category: "shops-retail" }, or
// { typeLabel: "Buy", categoryLabel: "Villa" } for a residential listing
// titled "Independent Duplex Villa".
export function getPropertyCategoryLabels(property) {
  const typeLabel = TYPE_LABELS[property?.type] || capitalize(property?.type);

  if (property?.category) {
    const categories = CATEGORIES_BY_TYPE[property.type];
    const match = categories?.find((c) => c.key === property.category);
    const categoryLabel = match?.label || capitalize(property.category.replace(/-/g, " "));
    return { typeLabel, categoryLabel };
  }

  if (["buy", "sell", "rent", "lease"].includes(property?.type)) {
    return { typeLabel, categoryLabel: deriveResidentialCategory(property) };
  }

  return { typeLabel, categoryLabel: "" };
}

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getCommercialProperties() {
  return PROPERTIES.filter((property) => property.type === "commercial");
}

export function getPropertiesByType(type) {
  return PROPERTIES.filter((property) => property.type === type);
}

export function getFeaturedProperties() {
  return PROPERTIES.filter((property) => property.featured);
}

export function getPropertyById(id) {
  const prop = PROPERTIES.find((property) => property.id === id);
  if (prop) return prop;

  const project = PROJECTS.find((p) => p.id === id);
  if (project) {
    return {
      id: project.id,
      title: project.name,
      price: project.startingPrice,
      location: project.location,
      developer: project.developer,
      status: project.status,
      image: project.image,
      galleryImages: [project.image],
      purpose: "Sale",
      propertyType: "Premium Project",
      category: "commercial",
      type: "buy",
      city: project.location?.split(",")?.[1]?.trim() || project.location,
      locality: project.location?.split(",")?.[0]?.trim() || project.location,
      landmark: project.location,
      address: `${project.name}, ${project.location}`,
      description: `${project.name} by ${project.developer} is a landmark development in ${project.location}, currently ${project.status.toLowerCase()}. Designed for modern commercial and residential excellence, offering world-class infrastructure and prime connectivity. Units starting at ${project.startingPrice}.`,
      badge: project.status,
      contact: {
        fullName: "Simnani CP Partner Desk",
        mobile: "+91 98765 43210",
      },
    };
  }

  return null;
}

// Turns a property's createdAt/addedDate into "Posted today" / "N days ago"
// for the first 3 days, then falls back to a plain "4 Sep 2026" style date.
export function formatPostedDate(property) {
  const raw = property?.createdAt || property?.addedDate;
  if (!raw) return "";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);

  if (diffDays <= 0) return "Posted today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays === 2) return "2 days ago";
  if (diffDays === 3) return "3 days ago";

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Converts a display price like "₹1.25 Cr", "₹85 Lakh" or "₹45,000 / month"
// into a plain rupee number so it can be compared against budget filters.
export function parsePriceToNumber(priceStr) {
  if (!priceStr) return null;
  const cleaned = priceStr.replace(/₹/g, "").replace(/,/g, "").trim();
  const match = cleaned.match(/[\d.]+/);
  if (!match) return null;

  let value = parseFloat(match[0]);
  if (/cr/i.test(cleaned)) value *= 1e7;
  else if (/lakh|lac/i.test(cleaned)) value *= 1e5;

  return value;
}

const INDIAN_STATES = new Set([
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
]);

// Returns the city/area token to filter and display by — the last
// comma-separated segment of a "Area, City" style location string.
export function getLocationCity(location) {
  if (!location) return "";
  const parts = location.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length >= 2 && INDIAN_STATES.has(parts[parts.length - 1])) {
    return parts[parts.length - 2];
  }
  return parts[parts.length - 1];
}

const cityToState = new Map();
for (const { city, state } of indianCities) {
  const key = city.toLowerCase();
  if (!cityToState.has(key)) cityToState.set(key, state);
}

// Returns "City, State" for a bare city name (e.g. "Raipur" -> "Raipur,
// Chhattisgarh") by looking the city up in the Indian cities dataset. Falls
// back to the bare city name when the city isn't found in the dataset.
export function getCityStateLabel(city) {
  if (!city) return "";
  const state = cityToState.get(city.toLowerCase());
  return state ? `${city}, ${state}` : city;
}

// Returns "City, State" for a location's city (e.g. "Raipur" -> "Raipur,
// Chhattisgarh") by looking the city up in the Indian cities dataset. Falls
// back to the bare city name when the city isn't found in the dataset.
export function getLocationCityState(location) {
  return getCityStateLabel(getLocationCity(location));
}

export const SALE_BUDGET_RANGES = [
  { label: "Under ₹50 Lac", max: 5000000 },
  { label: "₹50 Lac - ₹1 Cr", min: 5000000, max: 10000000 },
  { label: "₹1 Cr - ₹2 Cr", min: 10000000, max: 20000000 },
  { label: "₹2 Cr - ₹5 Cr", min: 20000000, max: 50000000 },
  { label: "Above ₹5 Cr", min: 50000000 },
];

export const RENT_BUDGET_RANGES = [
  { label: "Under ₹3,000", max: 3000 },
  { label: "₹3,000 - ₹6,000", min: 3000, max: 6000 },
  { label: "₹6,000 - ₹10,000", min: 6000, max: 10000 },
  { label: "₹10,000 - ₹15,000", min: 10000, max: 15000 },
  { label: "Above ₹15,000", min: 15000 },
];

// Canonical residential property types, shared by the homepage search bar
// and the /buy and /rent filter dropdowns so both always list the exact
// same options, regardless of which types have live listings right now.
export const RESIDENTIAL_TYPE_OPTIONS = [
  "Flat",
  "House",
  "Shop",
  "Plot",
  "Office",
  "Warehouse",
  "Apartment",
  "PG",
  "Villa",
];

export const BHK_OPTIONS = [1, 2, 3, 4, 5];

export function formatBhkLabel(beds, bedsPlus) {
  if (!beds) return "";
  return bedsPlus ? `${beds} BHK+` : `${beds} BHK`;
}
