import { Suspense } from "react";
import FreelancerPortalClient from "@/components/portal/freelancer/FreelancerPortalClient";
import { PROJECTS } from "@/lib/projects";
import {
  CP_STATS,
  CP_LEADS,
  CP_NETWORK,
  CP_COMMISSIONS,
  CP_SITE_VISITS,
  CP_PROMOTION_ASSETS,
  CP_FIELD_ACTIVITY_TODAY,
  CP_DIGITAL_CAMPAIGN_JOINS,
  CP_CAMPAIGN_VIDEOS,
} from "@/lib/demoPortal";

export const metadata = {
  title: "Channel Partner Dashboard | Simnani Estate",
  description: "Manage leads, site visits, assignments and commission as a Simnani Channel Partner.",
};

export default function FreelancerPortalPage() {
  return (
    <Suspense fallback={null}>
      <FreelancerPortalClient
        companyStats={CP_STATS.company}
        digitalStats={CP_STATS.digital}
        fieldStats={CP_STATS.field}
        leads={CP_LEADS}
        network={CP_NETWORK}
        commissions={CP_COMMISSIONS}
        siteVisits={CP_SITE_VISITS}
        projects={PROJECTS}
        promotionAssets={CP_PROMOTION_ASSETS}
        fieldActivity={CP_FIELD_ACTIVITY_TODAY}
        digitalCampaigns={CP_DIGITAL_CAMPAIGN_JOINS}
        campaignVideos={CP_CAMPAIGN_VIDEOS}
      />
    </Suspense>
  );
}
