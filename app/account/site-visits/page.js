import PortalHeader from "@/components/portal/PortalHeader";
import AccountNav from "@/components/portal/AccountNav";
import SiteVisitsList from "@/components/portal/SiteVisitsList";
import { getPropertyById } from "@/lib/properties";
import { SITE_VISITS } from "@/lib/demoAccount";

export const metadata = {
  title: "My Site Visits | Simnani Estate",
  description: "Manage your property viewings and concierge appointments.",
};

export default function SiteVisitsPage() {
  const visits = SITE_VISITS.map((visit) => ({
    ...visit,
    property: getPropertyById(visit.propertyId),
  })).filter((visit) => visit.property);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <PortalHeader
        eyebrow="Account"
        title="My Site Visits"
        subtitle="Manage your property viewings and concierge appointments."
      />
      <div className="mt-8">
        <AccountNav />
      </div>
      <div className="mt-8">
        <SiteVisitsList visits={visits} />
      </div>
    </div>
  );
}
