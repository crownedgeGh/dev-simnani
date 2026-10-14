// Shared by the Plot model, /api/plots routes and the admin T&C RERA page —
// no imports so it stays safe on both server and client.

export const DEFAULT_PROJECT = "T&C RERA";

export const PLOT_STATUSES = ["available", "booked", "hold", "blocked"];

// Tile colours for the 3D plot grid: top/bottom of the gradient, the darker
// "side" that gives the raised-block look, and the label colour.
export const PLOT_STATUS_META = {
  available: { label: "Available", top: "#fde68a", bottom: "#eab308", side: "#a16207", text: "#3f2d00" },
  booked: { label: "Booked / Sold", top: "#22c55e", bottom: "#15803d", side: "#14532d", text: "#ffffff" },
  hold: { label: "On Hold / Token", top: "#fdba74", bottom: "#f97316", side: "#9a3412", text: "#ffffff" },
  blocked: { label: "Blocked / Mortgage", top: "#f87171", bottom: "#dc2626", side: "#7f1d1d", text: "#ffffff" },
};

export const FACINGS = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"];

// Pulls plot numbers out of anything pasted — a copied sheet row, a
// WhatsApp list, OCR'd text from a layout image. Accepts "F-32", "f - 32",
// "F32"; ignores "SOLD 155" style text (a space without a dash isn't a plot).
export function parsePlotNumbers(text) {
  const seen = new Set();
  const out = [];
  for (const m of String(text || "").matchAll(/\b([A-Za-z]{1,4})(?:\s*[-–]\s*)?(\d{1,5})\b/g)) {
    const num = `${m[1].toUpperCase()}-${Number(m[2])}`;
    if (!seen.has(num)) {
      seen.add(num);
      out.push(num);
    }
  }
  return out;
}

export function splitPlotNumber(plotNumber) {
  const m = String(plotNumber).match(/^([A-Za-z]+)-?(\d+)$/);
  return m ? { block: m[1].toUpperCase(), seq: Number(m[2]) } : { block: "", seq: 0 };
}

export function sequencePlotNumbers(prefix, start, end) {
  const p = String(prefix || "").trim().toUpperCase();
  const s = Number(start);
  const e = Number(end);
  if (!/^[A-Z]{1,4}$/.test(p) || !Number.isInteger(s) || !Number.isInteger(e) || s < 0 || e < s || e - s >= 1000) {
    return [];
  }
  return Array.from({ length: e - s + 1 }, (_, i) => `${p}-${s + i}`);
}

export const SQFT_PER_SQYD = 9;

// Marking a plot available again means the earlier deal fell through — drop
// the buyer details so they don't leak into exports / the next booking.
export const CLEARED_BUYER_FIELDS = {
  buyerName: "",
  buyerPhone: "",
  bookingDate: null,
  tokenAmount: 0,
};
