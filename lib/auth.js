export function formatMobile(value) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  return [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 10)]
    .filter(Boolean)
    .join(" ");
}

export function isMobileValid(value) {
  return value.replace(/\D/g, "").length === 10;
}

export function generateAccountId(prefix) {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `SG-${prefix}-${random}`;
}
