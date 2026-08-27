// Per-account-type portal sidebar config — shared by each /portal/[role] page
// (via PortalShell) and the mobile navbar drawer's "My Account" quick nav.
export const PORTAL_NAV_CONFIG = {
  buyer: {
    roleLabel: "Buyer Portal",
    tier: "Premium Tier",
    navItems: [
      { label: "Dashboard", href: "/portal/buyer" },
      { label: "Saved Properties", href: "/account/saved-properties" },
      { label: "Site Visits", href: "/account/site-visits" },
      { label: "Support", href: "/account/support" },
      { label: "Profile", href: "/account" },
    ],
  },
  investor: {
    roleLabel: "Investor Portal",
    tier: "Premium Tier",
    navItems: [
      { label: "Dashboard", href: "/portal/investor" },
      { label: "My Portfolio", href: "/account/saved-properties" },
      { label: "Marketplace", href: "/invest" },
      { label: "Messages", href: "/account/support" },
      { label: "Profile", href: "/account" },
    ],
  },
  "common-person": {
    roleLabel: "My Listings",
    tier: "Individual Seller",
    navItems: [
      { label: "Dashboard", href: "/portal/common-person" },
      { label: "Post a Property", href: "/post-property" },
      { label: "Saved Properties", href: "/account/saved-properties" },
      { label: "Support", href: "/account/support" },
      { label: "Profile", href: "/account" },
    ],
  },
};

export function getPortalNavConfig(accountType) {
  return PORTAL_NAV_CONFIG[accountType] ?? null;
}
