import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getOwnerPortalData } from "@/lib/ownerPortalData";
import { getServiceTypeLabel } from "@/lib/serviceProviders";
import PortalHeader from "@/components/portal/PortalHeader";
import OwnerDashboard from "@/components/portal/OwnerDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Service Provider Portal | Simnani Estate",
  description: "Track your leads and manage client relationships.",
};

export default async function ServiceProviderPortalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const { leads, clients, stats } = await getOwnerPortalData(user.accountId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PortalHeader
        eyebrow={getServiceTypeLabel(user.serviceType) || "Service Provider"}
        title={`Welcome, ${user.fullName || "there"}`}
        subtitle="Track your leads and manage client relationships."
        backHref="/"
      />
      <div className="mt-8">
        <OwnerDashboard
          stats={stats}
          listings={[]}
          leads={leads}
          clients={clients}
          showListings={false}
          showAddProperty={false}
          showCommissions={false}
        />
      </div>
    </div>
  );
}
