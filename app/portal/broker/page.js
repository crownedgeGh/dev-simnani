import PortalHeader from "@/components/portal/PortalHeader";
import BrokerDashboard from "@/components/portal/BrokerDashboard";
import { PROPERTIES } from "@/lib/properties";
import { DEMO_USER } from "@/lib/demoAccount";
import { BROKER_STATS, BROKER_LEADS, BROKER_CLIENTS, BROKER_COMMISSIONS } from "@/lib/demoPortal";

export const metadata = {
  title: "Broker Dashboard | Simnani Estate",
  description: "Manage your listings, leads, clients and commissions.",
};

export default function BrokerPortalPage() {
  const listings = PROPERTIES.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PortalHeader
        eyebrow="Broker Portal"
        title={`Welcome, ${DEMO_USER.name}`}
        subtitle="Manage your listings, leads and client relationships."
      />
      <div className="mt-8">
        <BrokerDashboard
          stats={BROKER_STATS}
          listings={listings}
          leads={BROKER_LEADS}
          clients={BROKER_CLIENTS}
          commissions={BROKER_COMMISSIONS}
        />
      </div>
    </div>
  );
}
