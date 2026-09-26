"use client";

import { MdDirectionsWalk } from "react-icons/md";
import CPTypeWorkspace from "@/components/admin/freelancer-cp/CPTypeWorkspace";

export default function FieldCPPage() {
  return (
    <CPTypeWorkspace
      cpType="field"
      routingStage="field-cp"
      title="Field CP Management"
      description="Projects delegated by Company CP for site visits, and leads delegated by Company CP to convert on the ground."
      icon={MdDirectionsWalk}
      accentClasses="border-orange-200 bg-orange-50 text-orange-700"
      showCampaignVideos={false}
      showAssignedProjects
      assignmentLevel="company-to-field"
      showSiteVisits
      emptyMessage="No leads delegated by Company CP yet."
    />
  );
}
