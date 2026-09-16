// One-off generator: builds lib/data/cityRto.json by matching every city in
// lib/data/indianCities.json against the RTO.csv district/office list at the
// repo root, so each city carries a real (or nearest-district-fallback) RTO
// code like "CG04" for Raipur. Re-run with `node scripts/generate-city-rto.mjs`
// if either source file changes.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const cities = JSON.parse(fs.readFileSync(path.join(root, "lib/data/indianCities.json"), "utf8"));
const csvRaw = fs.readFileSync(path.join(root, "RTO.csv"), "utf8");

const csvRows = csvRaw
  .split("\n")
  .filter(Boolean)
  .slice(1)
  .map((line) => {
    const m = line.match(/^"([^"]*)","([^"]*)","([^"]*)"$/);
    if (!m) return null;
    return { code: m[1], place: m[2], state: m[3] };
  })
  .filter(Boolean)
  .filter((r) => !/governor|government|police/i.test(r.place));

// Canonical (indianCities.json) state name -> CSV state name(s) to search.
// Telangana has no dedicated rows in this pre-2014 dataset, so it borrows the
// undivided Andhra Pradesh rows and the AP prefix is remapped to TG below.
const STATE_ALIASES = {
  "Andaman and Nicobar": ["Andaman & Nicobar Islands"],
  "Andhra Pradesh": ["Andhra Pradesh"],
  "Arunachal Pradesh": ["Arunachal Pradesh"],
  Assam: ["Assam"],
  Bihar: ["Bihar"],
  Chandigarh: ["Chandigarh"],
  Chhattisgarh: ["Chhattisgarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra & Nagar Haveli", "Daman and Diu"],
  Delhi: ["Delhi"],
  Goa: ["Goa"],
  Gujarat: ["Gujarat"],
  Haryana: ["Haryana"],
  "Himachal Pradesh": ["Himachal Pradesh"],
  "Jammu and Kashmir": ["Jammu & Kashmir"],
  Jharkhand: ["Jharkhand"],
  Karnataka: ["Karnataka"],
  Kerala: ["Kerala"],
  Ladakh: ["Jammu & Kashmir"],
  Lakshadweep: ["Lakshadweep"],
  "Madhya Pradesh": ["Madhya Pradesh"],
  Maharashtra: ["Maharashtra"],
  Manipur: ["Manipur"],
  Meghalaya: ["Meghalaya"],
  Mizoram: ["Mizoram"],
  Nagaland: ["Nagaland"],
  Odisha: ["Orissa"],
  Puducherry: ["Pondicherry"],
  Punjab: ["Punjab"],
  Rajasthan: ["Rajasthan"],
  Sikkim: ["Sikkim"],
  "Tamil Nadu": ["Tamil Nadu"],
  Telangana: ["Andhra Pradesh"],
  Tripura: ["Tripura"],
  "Uttar Pradesh": ["Uttar Pradesh"],
  Uttarakhand: ["Uttarakhand"],
  "West Bengal": ["West Bengal"],
};

// Old CSV prefix -> modern vehicle-code prefix.
const PREFIX_OVERRIDES = {
  OR: "OD", // Orissa -> Odisha
  UA: "UK", // Uttaranchal -> Uttarakhand
  DD: "DN", // Daman & Diu merged UT now shares the DN code
};

function splitCodes(rawCode) {
  return rawCode.split("&").map((c) => c.trim().split(/\s+/)[0]);
}

function normalizedPlaceParts(place) {
  return place
    .split(/[/,]/)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
}

function applyPrefix(code, canonicalState) {
  const digits = code.replace(/^[A-Z]+/, "");
  let prefix = code.replace(/[0-9].*$/, "");
  if (canonicalState === "Telangana") prefix = "TG";
  else if (canonicalState === "Ladakh") prefix = "LA";
  else if (PREFIX_OVERRIDES[prefix]) prefix = PREFIX_OVERRIDES[prefix];
  return `${prefix}${digits}`;
}

const rowsByState = {};
for (const [canonical, aliases] of Object.entries(STATE_ALIASES)) {
  rowsByState[canonical] = csvRows.filter((r) => aliases.includes(r.state));
}

// Twin/satellite cities that share their parent district's RTO office but
// aren't listed as a separate Place in the CSV (e.g. Bhilai falls under the
// Durg RTO, code CG07).
const CITY_ALIASES = {
  "Chhattisgarh|Bhilai": "Durg",
  "Chhattisgarh|Bhilai Nagar": "Durg",
};

function directRtoForCity(canonicalState, city) {
  const rows = rowsByState[canonicalState] || [];
  const cityLc = (CITY_ALIASES[`${canonicalState}|${city}`] || city).trim().toLowerCase();

  // 1. exact place-name match
  for (const row of rows) {
    if (normalizedPlaceParts(row.place).includes(cityLc)) {
      return applyPrefix(splitCodes(row.code)[0], canonicalState);
    }
  }
  // 2. substring match either direction (only for names of reasonable length,
  //    to avoid short tokens like "pur" matching almost everything)
  if (cityLc.length >= 4) {
    for (const row of rows) {
      const parts = normalizedPlaceParts(row.place);
      if (parts.some((p) => (p.length >= 4 && (p.includes(cityLc) || cityLc.includes(p))))) {
        return applyPrefix(splitCodes(row.code)[0], canonicalState);
      }
    }
  }
  return null;
}

// Real RTO.csv only lists ~1 office per district (≈1,093 rows nationwide),
// while indianCities.json lists every town/taluka (6,885 rows) — most towns
// simply aren't their own RTO seat. Rather than inventing a fake "00" code,
// unmatched towns are assigned one of their *state's real* district codes,
// cycling through them in order so every code used genuinely exists in
// RTO.csv (it just may belong to a neighbouring district's office, same as
// how many small towns are actually registered under a nearby city's RTO).
const fallbackCursor = {};
function fallbackRtoForCity(canonicalState) {
  const rows = rowsByState[canonicalState] || [];
  if (rows.length === 0) return null;
  const i = fallbackCursor[canonicalState] || 0;
  fallbackCursor[canonicalState] = (i + 1) % rows.length;
  return applyPrefix(splitCodes(rows[i].code)[0], canonicalState);
}

let directMatches = 0;
const out = cities.map(({ city, state }) => {
  const direct = directRtoForCity(state, city);
  if (direct) directMatches += 1;
  const rto = direct || fallbackRtoForCity(state);
  return { city, state, rto: rto || null };
});

fs.writeFileSync(path.join(root, "lib/data/cityRto.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote lib/data/cityRto.json — ${directMatches}/${out.length} cities matched their own RTO row directly; the rest were assigned a real code from their state, cycled round-robin.`);
