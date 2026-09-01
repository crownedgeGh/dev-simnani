"use client";

import { useSearchParams } from "next/navigation";
import PortalHeader from "@/components/portal/PortalHeader";
import CompanyCPDashboard from "@/components/portal/CompanyCPDashboard";
import DigitalCPDashboard from "@/components/portal/DigitalCPDashboard";
import FieldCPDashboard from "@/components/portal/FieldCPDashboard";
import { useAuth } from "@/context/AuthContext";

const DEMO_CP_NAMES = {
  digital: "Aarav Shah",
  field: "Rohan Mehta",
  company: "Simnani Partners Pvt. Ltd.",
};

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
  fieldActivity,
  digitalCampaigns,
  campaignVideos,
}) {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  // Test Mode support — reads ?cpType=field|digital|company so demo dashboards
  // can be opened directly from the signup / navbar shortcuts, no form needed.
  const requestedCpType = searchParams.get("cpType");
  const demoCpType = PORTAL_COPY[requestedCpType] ? requestedCpType : "digital";

  const isRealFreelancer = user?.accountType === "freelancer";
  const cpType = isRealFreelancer ? user.cpType || "digital" : demoCpType;
  const partner = isRealFreelancer ? user : { fullName: DEMO_CP_NAMES[cpType], cpType };
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
          <CompanyCPDashboard
            stats={companyStats}
            leads={leads}
            network={network}
            commissions={commissions}
            projects={projects}
            fieldActivity={fieldActivity}
            digitalCampaigns={digitalCampaigns}
            campaignVideos={campaignVideos}
          />
        )}
        {cpType === "digital" && (
          <DigitalCPDashboard stats={digitalStats} projects={projects} assets={promotionAssets} />
        )}
        {cpType === "field" && (
          <FieldCPDashboard stats={fieldStats} leads={leads} siteVisits={siteVisits} projects={projects} />
        )}
      </div>
    </div>
  );
}
