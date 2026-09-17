import indianCities from "@/lib/data/indianCities.json";

export const STATES = [...new Set(indianCities.map((c) => c.state))].sort();

const CITIES_BY_STATE = indianCities.reduce((acc, { state, city }) => {
  if (!acc[state]) acc[state] = new Set();
  acc[state].add(city);
  return acc;
}, {});

export function getCitiesForState(state) {
  if (!state || !CITIES_BY_STATE[state]) return [];
  return [...CITIES_BY_STATE[state]].sort();
}
