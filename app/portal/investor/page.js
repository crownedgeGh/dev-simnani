import Link from "next/link";
import PortalShell from "@/components/portal/PortalShell";
import StatCard from "@/components/portal/StatCard";
import PropertyGrid from "@/components/property/PropertyGrid";
import { getPropertiesByType } from "@/lib/properties";
import { DEMO_USER, SAVED_PROPERTY_IDS, SUPPORT_TICKETS } from "@/lib/demoAccount";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/portal/investor" },
  { label: "My Portfolio", href: "/account/saved-properties" },
  { label: "Marketplace", href: "/invest" },
  { label: "Messages", href: "/account/support" },
  { label: "Profile", href: "/account" },
];

export const metadata = {
  title: "Investor Dashboard | Simnani Estate",
  description: "An overview of your premium investment portfolio.",
};

export default function InvestorPortalPage() {
  const opportunities = getPropertiesByType("invest");

  return (
    <PortalShell
      roleLabel="Investor Portal"
      tier="Premium Tier"
      navItems={NAV_ITEMS}
      ctaLabel="Invest Now"
      ctaHref="/invest"
    >
      <div>
        <p className="tracked-label text-xs text-gold-400">Welcome</p>
        <h1 className="mt-2 font-display text-3xl text-cream">{DEMO_USER.name}</h1>
        <p className="mt-2 text-sm text-muted">
          Here is an overview of your premium investment portfolio and current opportunities.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Investment Opportunities" value={opportunities.length} />
        <StatCard label="Saved Opportunities" value={SAVED_PROPERTY_IDS.length} />
        <StatCard label="My Enquiries" value={SUPPORT_TICKETS.length} />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">Recommended Investments</h2>
          <Link href="/invest" className="tracked-label text-xs text-gold-400 hover:text-gold-300">
            View All
          </Link>
        </div>
        <div className="mt-4">
          <PropertyGrid properties={opportunities} />
        </div>
      </div>
    </PortalShell>
  );
}
