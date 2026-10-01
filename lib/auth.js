export function formatMobile(value) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  return [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 10)]
    .filter(Boolean)
    .join(" ");
}

// Indian mobile numbers are exactly 10 digits and start with 6, 7, 8, or 9 —
// reject anything shorter/longer or starting with 0-5 (landlines, typos,
// placeholder digits like 0000000000) instead of only checking length.
export function isMobileValid(value) {
  return /^[6-9]\d{9}$/.test((value || "").replace(/\D/g, ""));
}

export function generateAccountId(prefix) {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `SG-${prefix}-${random}`;
}

export function isPasswordValid(value) {
  return typeof value === "string" && value.length >= 8;
}
