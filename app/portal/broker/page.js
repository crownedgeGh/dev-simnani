import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Lead from "@/models/Lead";
import Client from "@/models/Client";
import { getCurrentUser } from "@/lib/session";
import PortalHeader from "@/components/portal/PortalHeader";
import BrokerDashboard from "@/components/portal/BrokerDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Broker Dashboard | Simnani Estate",
  description: "Manage your listings, leads, clients and commissions.",
};

export default async function BrokerPortalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  await dbConnect();
  const docs = await Property.find({ ownerId: user.accountId }).sort({ createdAt: -1 }).lean();
  const listings = docs.map((doc) => ({ ...doc, _id: doc._id.toString() }));

  const leadDocs = await Lead.find({ ownerId: user.accountId }).sort({ createdAt: -1 }).lean();
  const leads = leadDocs.map((doc) => ({ ...doc, _id: doc._id.toString() }));

  const clientDocs = await Client.find({ ownerId: user.accountId }).sort({ createdAt: -1 }).lean();
  const titleToPropertyId = new Map(listings.map((p) => [p.title, p.id]));
  const clients = clientDocs.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
    propertyId: doc.propertyId || titleToPropertyId.get(doc.property) || "",
  }));

  const stats = {
    activeListings: listings.filter((p) => p.status === "Active").length,
    totalLeads: leads.length,
    siteVisits: leads.filter((l) => l.status === "Site Visit").length,
    closedDeals: 0,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PortalHeader
        eyebrow="Broker Portal"
        title={`Welcome, ${user.fullName || "Broker"}`}
        subtitle="Manage your listings, leads and client relationships."
      />
      <div className="mt-8">
        <BrokerDashboard stats={stats} listings={listings} leads={leads} clients={clients} commissions={[]} />
      </div>
    </div>
  );
}
