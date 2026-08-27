import Link from "next/link";
import PortalShell from "@/components/portal/PortalShell";
import StatCard from "@/components/portal/StatCard";
import PropertyGrid from "@/components/property/PropertyGrid";
import { getPropertiesByType } from "@/lib/properties";
import { DEMO_USER, SAVED_PROPERTY_IDS, SUPPORT_TICKETS } from "@/lib/demoAccount";
import { PORTAL_NAV_CONFIG } from "@/lib/portalNavItems";

const { roleLabel, tier, navItems: NAV_ITEMS } = PORTAL_NAV_CONFIG["common-person"];

export const metadata = {
  title: "My Listings | Simnani Estate",
  description: "Manage the properties you've listed for sale or rent.",
};

export default function CommonPersonPortalPage() {
  const myListings = getPropertiesByType("sell");

  return (
    <PortalShell
      roleLabel={roleLabel}
      tier={tier}
      navItems={NAV_ITEMS}
    >
      <div>
        <p className="tracked-label text-xs text-gold-400">Welcome</p>
        <h1 className="mt-2 font-display text-3xl text-cream">{DEMO_USER.name}</h1>
        <p className="mt-2 text-sm text-muted">
          Manage the properties you&apos;ve listed and track enquiries from buyers.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="My Listings" value={myListings.length} />
        <StatCard label="Saved Properties" value={SAVED_PROPERTY_IDS.length} />
        <StatCard label="Enquiries" value={SUPPORT_TICKETS.length} />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">My Listings</h2>
          <Link href="/post-property" className="tracked-label text-xs text-gold-400 hover:text-gold-300">
            Post New Property
          </Link>
        </div>
        <div className="mt-4">
          <PropertyGrid
            properties={myListings}
            emptyMessage="You haven't listed any properties yet. Post your first property to get started."
          />
        </div>
      </div>
    </PortalShell>
  );
}
