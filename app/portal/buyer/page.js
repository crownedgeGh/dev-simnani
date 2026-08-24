import Link from "next/link";
import PortalShell from "@/components/portal/PortalShell";
import StatCard from "@/components/portal/StatCard";
import PropertyGrid from "@/components/property/PropertyGrid";
import { getFeaturedProperties } from "@/lib/properties";
import { DEMO_USER, SAVED_PROPERTY_IDS, SITE_VISITS } from "@/lib/demoAccount";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/portal/buyer" },
  { label: "Saved Properties", href: "/account/saved-properties" },
  { label: "Site Visits", href: "/account/site-visits" },
  { label: "Support", href: "/account/support" },
  { label: "Profile", href: "/account" },
];

export const metadata = {
  title: "Buyer Dashboard | Simnani Estate",
  description: "Your exclusive property portfolio overview.",
};

export default function BuyerPortalPage() {
  const recommended = getFeaturedProperties();

  return (
    <PortalShell
      roleLabel="Buyer Portal"
      tier="Premium Tier"
      navItems={NAV_ITEMS}
      ctaLabel="Explore Properties"
      ctaHref="/buy"
    >
      <div>
        <p className="tracked-label text-xs text-gold-400">Welcome Back</p>
        <h1 className="mt-2 font-display text-3xl text-cream">{DEMO_USER.name}</h1>
        <p className="mt-2 text-sm text-muted">Welcome back to your exclusive portfolio.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Saved Properties" value={SAVED_PROPERTY_IDS.length} />
        <StatCard label="Site Visits" value={SITE_VISITS.length} />
        <StatCard label="Recently Viewed" value={12} />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">Recommended Properties</h2>
          <Link href="/buy" className="tracked-label text-xs text-gold-400 hover:text-gold-300">
            View All
          </Link>
        </div>
        <div className="mt-4">
          <PropertyGrid properties={recommended} />
        </div>
      </div>
    </PortalShell>
  );
}
