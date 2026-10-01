// Fixed small set of cities used for the admin "featured" location modals
// and the homepage city filter during testing. Expand/replace with the
// full lib/cityState.js dataset once this goes live beyond testing.
export const TEST_CITIES = [
  { city: "Bangalore", state: "Karnataka" },
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Delhi", state: "Delhi" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Pune", state: "Maharashtra" },
];

export const TEST_STATES = Array.from(new Set(TEST_CITIES.map((c) => c.state)));

export function getTestCitiesForState(state) {
  return TEST_CITIES.filter((c) => c.state === state);
}
