import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getOwnerPortalData } from "@/lib/ownerPortalData";
import PortalHeader from "@/components/portal/PortalHeader";
import OwnerDashboard from "@/components/portal/OwnerDashboard";
import ForceBackRedirect from "@/components/layout/ForceBackRedirect";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Portal | Simnani Estate",
  description: "Manage your listings, leads and client relationships.",
};

export default async function CommonPersonPortalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const { listings, leads, clients, stats } = await getOwnerPortalData(user.accountId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <ForceBackRedirect href="/" />
      <PortalHeader
        eyebrow="My Portal"
        title={`Welcome, ${user.fullName || "there"}`}
        subtitle="Manage your listings, leads and client relationships."
        backHref="/"
      />
      <div className="mt-8">
        <OwnerDashboard
          stats={stats}
          listings={listings}
          leads={leads}
          clients={clients}
          addPropertyHref="/post-property"
          showCommissions={false}
        />
      </div>
    </div>
  );
}
