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
// header, saved profile) against RTO_STATES so the result always lines up
// with the SearchableSelect options instead of showing an unmatched name.
export function normalizeCityState(city, state) {
  const trimmedCity = (city || "").trim().toLowerCase();
  if (!trimmedCity) return null;

  const matchedState = RTO_STATES.find(
    (s) => s.toLowerCase() === (state || "").trim().toLowerCase(),
  );
  if (matchedState) {
    const inState = getCitiesForState(matchedState).find(
      (c) => c.city.toLowerCase() === trimmedCity,
    );
    if (inState) return { city: inState.city, state: matchedState };
  }

  // State missing/wrong (e.g. an incomplete saved profile) or the city isn't
  // listed under it — fall back to matching the city alone across every
  // state, rather than silently guessing a city via a mismatched state.
  const byCity = CITY_RTO.find((c) => c.city.toLowerCase() === trimmedCity);
  return byCity ? { city: byCity.city, state: byCity.state } : null;
}
