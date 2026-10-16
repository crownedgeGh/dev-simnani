export function formatMobile(value) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  return [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 10)]
    .filter(Boolean)
    .join(" ");
}

// ponytail: dev/testing mode — any 10-digit number is accepted, including
// ones starting with 0 or 1, so QA can use throwaway numbers. Restore the
// /^[6-9]\d{9}$/ check before going to prod.
export function isMobileValid(value) {
  return /^\d{10}$/.test((value || "").replace(/\D/g, ""));
}

export function generateAccountId(prefix) {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `SG-${prefix}-${random}`;
}

export function isPasswordValid(value) {
  return typeof value === "string" && value.length >= 8;
}
