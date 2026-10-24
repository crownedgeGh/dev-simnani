// Service Provider lead plans — shown instantly after signup completes
// (ServiceProviderRegistrationWizard) and on /service-provider/plans.
// Single source of truth for pricing + validity, used to validate
// purchases server-side in /api/service-plans.
export const SERVICE_PROVIDER_PLANS = [
  {
    id: "leads-499",
    name: "6 Month Plan",
    price: 499,
    priceLabel: "₹499",
    validityMonths: 6,
    validityLabel: "Valid for 6 months",
    tagline: "Get maximum leads for your business.",
    features: ["Maximum leads", "Valid for 6 months"],
    cta: "Choose ₹499 Plan",
    featured: false,
  },
  {
    id: "leads-799",
    name: "1 Year Plan",
    price: 799,
    priceLabel: "₹799",
    validityMonths: 12,
    validityLabel: "Valid for 1 year",
    tagline: "Maximum leads plus featured visibility.",
    features: ["Maximum leads", "Featured — we'll get you noticed", "Valid for 1 year"],
    cta: "Choose ₹799 Plan",
    featured: true,
  },
];

export function getServicePlanById(id) {
  return SERVICE_PROVIDER_PLANS.find((p) => p.id === id) || null;
}
