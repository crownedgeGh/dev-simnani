/**
 * searchLocation.js
 * -----------------
 * Recovers city/state from a GA4 search_term string (e.g. "4 BHK • House •
 * Sale • Raipur") by matching known Indian city names inside it. This lets
 * the analytics dashboard break top search queries down state-wise and
 * city-wise without needing a new GA4 custom dimension — every search_term
 * already ends with the free-text location the visitor typed or selected.
 */

import rawCities from "@/lib/data/indianCities.json";

const cityToState = new Map();
for (const { city, state } of rawCities) {
  const key = city.toLowerCase();
  if (!cityToState.has(key)) cityToState.set(key, state);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Longest city names first so "New Delhi" wins over "Delhi" when both match.
const sortedCityNames = [...cityToState.keys()].sort((a, b) => b.length - a.length);
const matchPattern = new RegExp(`\\b(${sortedCityNames.map(escapeRegExp).join("|")})\\b`, "i");

/** Returns { city, state } for the first known Indian city found in the
 * given text, or null if none match. */
export function matchCityState(text) {
  if (!text) return null;
  const match = text.match(matchPattern);
  if (!match) return null;
  const key = match[1].toLowerCase();
  const state = cityToState.get(key);
  if (!state) return null;
  return { city: match[1], state };
}
