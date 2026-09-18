// Static membership plan definitions — the single source of truth for
// pricing, limits and validity shown on /pricing and used to validate
// purchase requests in the subscriptions API.
export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "₹0",
    tagline: "Get started and list your first properties at no cost.",
    propertyLimit: 10,
    validityMonths: null,
    validityLabel: "No expiry",
    features: [
      { text: "Post up to 10 properties", included: true },
      { text: "No validity limit", included: true },
      { text: "No priority listing", included: false },
      { text: "Low priority in customer care support", included: false },
      { text: "No featured in home page", included: false },
      { text: "Broker profile shown on home page", included: false },
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    id: "standard",
    name: "Standard",
    price: 499,
    priceLabel: "₹499",
    tagline: "For sellers and brokers who list regularly.",
    propertyLimit: 500,
    validityMonths: 6,
    validityLabel: "Valid for 6 months",
    features: [
      { text: "Post up to 500 properties", included: true },
      { text: "Valid for 6 months", included: true },
      { text: "Priority listing visibility", included: true },
      { text: "Priority in customer care support", included: true },
      { text: "Get featured. Get noticed. Get more leads.", included: true },
      { text: "Broker profile shown on home page", included: false },
    ],
    cta: "Choose Standard",
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 999,
    priceLabel: "₹999",
    tagline: "For power sellers, brokers & agencies at scale.",
    propertyLimit: null,
    validityMonths: 12,
    validityLabel: "Valid for 1 year",
    features: [
      { text: "Unlimited property posting", included: true },
      { text: "Valid for 1 year", included: true },
      { text: "Top listing visibility", included: true },
      { text: "High priority in customer care support", included: true },
      { text: "Get featured. Get noticed. Get more leads.", included: true },
      { text: "Broker profile shown on home page", included: true },
    ],
    cta: "Choose Premium",
    highlight: false,
  },
];

export function getPlanById(id) {
  return PLANS.find((p) => p.id === id) || null;
}
