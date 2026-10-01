import { Suspense } from "react";
import FreelancerPortalClient from "@/components/portal/freelancer/FreelancerPortalClient";
import { PROJECTS } from "@/lib/projects";
import { requireCpUser } from "@/lib/freelancerPortalGuard";
import { getOwnerPortalData } from "@/lib/ownerPortalData";
import { getCpNetwork } from "@/lib/cpAssignments";
import {
  CP_STATS,
  CP_LEADS,
  CP_COMMISSIONS,
  CP_SITE_VISITS,
  CP_PROMOTION_ASSETS,
  CP_CAMPAIGN_VIDEOS,
} from "@/lib/demoPortal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Company CP Dashboard | Simnani Estate",
  description: "Verify leads, assign Field Channel Partners and manage the network as a Company Channel Partner.",
};

export default async function CompanyCPPortalPage() {
  const user = await requireCpUser("company");
  const { listings: myListings } = await getOwnerPortalData(user.accountId);
  const network = await getCpNetwork();

  return (
    <Suspense fallback={null}>
      <FreelancerPortalClient
        companyStats={CP_STATS.company}
        digitalStats={CP_STATS.digital}
        fieldStats={CP_STATS.field}
        leads={CP_LEADS}
        network={network}
        commissions={CP_COMMISSIONS}
        siteVisits={CP_SITE_VISITS}
        projects={PROJECTS}
        promotionAssets={CP_PROMOTION_ASSETS}
        campaignVideos={CP_CAMPAIGN_VIDEOS}
        myListings={myListings}
        forcedCpType="company"
      />
    </Suspense>
  );
}
