import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getOwnerPortalData } from "@/lib/ownerPortalData";
import PortalHeader from "@/components/portal/PortalHeader";
import OwnerDashboard from "@/components/portal/OwnerDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Broker Dashboard | Simnani Estate",
  description: "Manage your listings, leads, clients and commissions.",
};

export default async function BrokerPortalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const { listings, leads, clients, stats } = await getOwnerPortalData(user.accountId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PortalHeader
        eyebrow="Broker Portal"
        title={`Welcome, ${user.fullName || "Broker"}`}
        subtitle="Manage your listings, leads and client relationships."
      />
      <div className="mt-8">
        <OwnerDashboard
          stats={stats}
          listings={listings}
          leads={leads}
          clients={clients}
          commissions={[]}
          addPropertyHref="/portal/broker/add-property"
          showCommissions
        />
      </div>
    </div>
  );
}
