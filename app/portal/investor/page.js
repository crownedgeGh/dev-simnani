import { redirect } from "next/navigation";
import Link from "next/link";
import PortalShell from "@/components/portal/PortalShell";
import StatCard from "@/components/portal/StatCard";
import PropertyGrid from "@/components/property/PropertyGrid";
import { getCurrentUser } from "@/lib/session";
import { getPropertiesByType } from "@/lib/properties";
import { getPropertyById } from "@/lib/propertiesServer";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Investor Dashboard | Simnani Estate",
  description: "An overview of your premium investment portfolio.",
};

export default async function InvestorPortalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  await dbConnect();
  const opportunities = getPropertiesByType("invest");

  const savedIds = Array.isArray(user.savedProperties) ? user.savedProperties : [];
  const saved = (await Promise.all(savedIds.map((id) => getPropertyById(id)))).filter(Boolean);

  const enquiriesCount = await Lead.countDocuments({ buyerId: user.accountId });

  return (
    <PortalShell>
      <div>
        <p className="tracked-label text-xs text-gold-400">Welcome</p>
        <h1 className="mt-2 font-display text-3xl text-cream">{user.fullName}</h1>
        <p className="mt-2 text-sm text-muted">
          Here is an overview of your premium investment portfolio and current opportunities.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Investment Opportunities" value={opportunities.length} />
        <StatCard label="Saved Opportunities" value={saved.length} />
        <StatCard label="My Enquiries" value={enquiriesCount} />
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
