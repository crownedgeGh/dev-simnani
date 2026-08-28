// Per-account-type permissions — controls which listing-related UI
// (Post a Property, My Listings) is shown once a user has signed up.
export const ACCOUNT_PERMISSIONS = {
  // Buyers browse and purchase — they don't list or manage properties.
  buyer: {
    canPostProperty: false,
    canManageListings: false,
    portalHref: "/portal/buyer",
  },
  // Investors browse investment opportunities — no listings of their own.
  investor: {
    canPostProperty: false,
    canManageListings: false,
    portalHref: "/portal/investor",
  },
  // Brokers sell properties and manage clients — the only role that lists.
  broker: {
    canPostProperty: true,
    canManageListings: true,
    portalHref: "/portal/broker",
    portalLabel: "My Listings",
    portalDesc: "View & manage your properties",
  },
  // Freelancers promote projects, generate leads and refer properties for commission.
  freelancer: {
    canPostProperty: false,
    canManageListings: true,
    portalHref: "/portal/freelancer",
    portalLabel: "Freelancer Portal",
    portalDesc: "Leads, properties & commissions",
  },
  // Common Person — an individual owner listing/selling their own property directly.
  "common-person": {
    canPostProperty: true,
    canManageListings: true,
    portalHref: "/portal/common-person",
    portalLabel: "My Listings",
    portalDesc: "View & manage your properties",
  },
  // Employee / District Executive — manages assigned leads, not listings.
  employee: {
    canPostProperty: false,
    canManageListings: true,
    portalHref: "/portal/employee",
    portalLabel: "My Dashboard",
    portalDesc: "View leads, site visits & performance",
  },
};

export function getAccountPermissions(accountType) {
  return ACCOUNT_PERMISSIONS[accountType] ?? ACCOUNT_PERMISSIONS.buyer;
}
