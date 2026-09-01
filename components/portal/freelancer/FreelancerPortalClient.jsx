"use client";

import PortalHeader from "@/components/portal/PortalHeader";
import CompanyCPDashboard from "@/components/portal/CompanyCPDashboard";
import DigitalCPDashboard from "@/components/portal/DigitalCPDashboard";
import FieldCPDashboard from "@/components/portal/FieldCPDashboard";
import { useAuth } from "@/context/AuthContext";

const DEMO_CP = { fullName: "Aarav Shah", cpType: "digital" };

const PORTAL_COPY = {
  company: {
    eyebrow: "Company Channel Partner Portal",
    subtitle: "Verify leads, assign Field Channel Partners and manage the network.",
  },
  digital: {
    eyebrow: "Digital Channel Partner Portal",
    subtitle: "Promote approved projects, generate leads and earn commission.",
  },
  field: {
    eyebrow: "Field Channel Partner Portal",
    subtitle: "Convert assigned leads through site visits and earn commission.",
  },
};

export default function FreelancerPortalClient({
  companyStats,
  digitalStats,
  fieldStats,
  leads,
  network,
  commissions,
  siteVisits,
  projects,
  promotionAssets,
}) {
  const { user } = useAuth();
  const partner = user?.accountType === "freelancer" ? user : DEMO_CP;
  const cpType = partner.cpType || "digital";
  const copy = PORTAL_COPY[cpType];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PortalHeader
        eyebrow={copy.eyebrow}
        title={`Welcome, ${partner.fullName}`}
        subtitle={copy.subtitle}
      />
      <div className="mt-8">
        {cpType === "company" && (
          <CompanyCPDashboard stats={companyStats} leads={leads} network={network} commissions={commissions} />
        )}
        {cpType === "digital" && (
          <DigitalCPDashboard stats={digitalStats} projects={projects} assets={promotionAssets} leads={leads} />
        )}
        {cpType === "field" && (
          <FieldCPDashboard stats={fieldStats} leads={leads} siteVisits={siteVisits} projects={projects} />
        )}
      </div>
    </div>
  );
}
