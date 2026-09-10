// Single source of truth for property categories offered across the platform.
// Mirrors the site's browsable sections (navbar) plus the common property kinds.
// Used by every registration wizard and the admin panel so the options never drift.
export const PROPERTY_CATEGORIES = [
  { value: "flat", label: "Flat" },
  { value: "villa", label: "Villa" },
  { value: "plot", label: "Plot" },
  { value: "land", label: "Land" },
  { value: "farm-house", label: "Farm House" },
  { value: "commercial", label: "Commercial" },
  { value: "farming", label: "Farming Land" },
  { value: "industrial", label: "Industrial" },
  { value: "company-project", label: "Company Project" },
  { value: "invest", label: "Investment Property" },
  { value: "rent", label: "Rental" },
  { value: "lease", label: "Lease" },
  { value: "seized-property", label: "Seized Property" },
];
