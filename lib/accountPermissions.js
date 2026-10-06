// Per-account-type permissions — controls which listing-related UI
// (Post a Property, My Listings) is shown once a user has signed up.
export const ACCOUNT_PERMISSIONS = {
  // Buyers browse and purchase — they don't list or manage properties.
  buyer: {
    canPostProperty: false,
    canManageListings: false,
    // Buyers have no portal page — always land on the home page.
    portalHref: "/",
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
  // There is no generic freelancer portal route — every freelancer has a
  // cpType, so callers must pass it to getAccountPermissions() to resolve
  // their specific, protected CP dashboard URL (see getAccountPermissions
  // below). portalHref here is only a defensive fallback for a user record
  // missing cpType.
  freelancer: {
    canPostProperty: false,
    canManageListings: true,
    portalHref: "/account",
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
  // Builder — a developer listing/selling their own projects directly.
  // Shares the same registration fields and portal as Common Person.
  builder: {
    canPostProperty: true,
    canManageListings: true,
    portalHref: "/portal/common-person",
    portalLabel: "My Listings",
    portalDesc: "View & manage your properties",
  },
};

// Freelancer accounts are split into three CP dashboards, each with its own
// protected route — a freelancer must land on their own cpType's URL, never
// the generic one, so the link itself makes clear which CP it belongs to.
const CP_PORTAL_LABEL = {
  digital: "Digital CP Portal",
  field: "Field CP Portal",
  company: "Company CP Portal",
};

export function getAccountPermissions(accountType, cpType) {
  const perms = ACCOUNT_PERMISSIONS[accountType] ?? ACCOUNT_PERMISSIONS.buyer;
  if (accountType === "freelancer" && cpType && CP_PORTAL_LABEL[cpType]) {
    return { ...perms, portalHref: `/portal/${cpType}-cp`, portalLabel: CP_PORTAL_LABEL[cpType] };
  }
  return perms;
}
