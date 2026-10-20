// Static listing top-up packages — single source of truth for /topup
// pricing and for validating purchases server-side in /api/topup.
export const TOPUPS = [
  { id: "topup-499", price: 499, priceLabel: "₹499", listings: 20, validityLabel: "Valid for 6 months" },
  { id: "topup-799", price: 799, priceLabel: "₹799", listings: 40, validityLabel: "Valid for 6 months" },
];

export function getTopupById(id) {
  return TOPUPS.find((t) => t.id === id) || null;
}
