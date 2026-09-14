import rawCities from "@/lib/data/indianCities.json";

export const INDIAN_CITIES = rawCities.map(({ city, state }) => ({
  city,
  state,
  label: `${city}, ${state}`,
}));

export function searchIndianCities(query, limit = 8) {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  return INDIAN_CITIES.filter(
    (entry) =>
      entry.city.toLowerCase().startsWith(term) ||
      entry.label.toLowerCase().includes(term)
  ).slice(0, limit);
}
