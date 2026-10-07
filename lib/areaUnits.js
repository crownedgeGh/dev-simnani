export const AREA_UNITS = ["sq ft", "acres", "gaj"];

const ACRE_IN_UNIT = { "sq ft": 43560, gaj: 4840 };

// Once the entered sq ft/gaj value reaches 1 acre's worth, auto-convert and
// display the area in acres (e.g. 50000 sq ft -> 1.15 acres).
export function normalizeAreaToAcre(areaSize, areaUnit) {
  const unitPerAcre = ACRE_IN_UNIT[areaUnit];
  const num = Number(areaSize);
  if (unitPerAcre && num >= unitPerAcre) {
    const acres = num / unitPerAcre;
    return { areaSize: String(Math.round(acres * 100) / 100), areaUnit: "acres" };
  }
  return { areaSize, areaUnit };
}
