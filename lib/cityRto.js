import CITY_RTO from "./data/cityRto.json";

// Unique, alphabetically sorted list of Indian states/UTs present in the
// city → RTO dataset.
export const RTO_STATES = [...new Set(CITY_RTO.map((c) => c.state))].sort();

// state -> [{ city, rto }] sorted alphabetically by city.
const CITIES_BY_STATE = CITY_RTO.reduce((map, { state, city, rto }) => {
  if (!map[state]) map[state] = [];
  map[state].push({ city, rto });
  return map;
}, {});
Object.values(CITIES_BY_STATE).forEach((list) => list.sort((a, b) => a.city.localeCompare(b.city)));

export function getCitiesForState(state) {
  return CITIES_BY_STATE[state] || [];
}

export function getRtoCode(state, city) {
  const match = getCitiesForState(state).find((c) => c.city === city);
  return match?.rto || null;
}

// Matches a free-text city/state pair (IP lookup, GPS reverse-geocode, CDN
// header) against RTO_STATES so the result always lines up with the
// SearchableSelect options instead of showing an unmatched name.
export function normalizeCityState(city, state) {
  const matchedState = RTO_STATES.find(
    (s) => s.toLowerCase() === (state || "").trim().toLowerCase(),
  );
  if (!matchedState) return null;

  const cities = getCitiesForState(matchedState);
  const matchedCity =
    cities.find(
      (c) => c.city.toLowerCase() === (city || "").trim().toLowerCase(),
    )?.city || cities[0]?.city;

  return matchedCity ? { city: matchedCity, state: matchedState } : null;
}
