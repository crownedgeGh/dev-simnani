import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "lib", "data", "localityContent");

/**
 * Curated locality copy (overview, connectivity, price trend, FAQ, ...), one
 * JSON file per city keyed by locality slug. Server-only — reads straight off
 * disk, same lazy-load-per-city pattern as the rest of lib/data.
 */
export function getLocalityContent(citySlug, localitySlug) {
  try {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, `${citySlug}.json`), "utf-8");
    const city = JSON.parse(raw);
    return city[localitySlug] || null;
  } catch {
    return null;
  }
}

export function getCityLocalitySlugs(citySlug) {
  try {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, `${citySlug}.json`), "utf-8");
    return Object.keys(JSON.parse(raw));
  } catch {
    return [];
  }
}
