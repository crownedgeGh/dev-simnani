"use client";

import { MdCampaign } from "react-icons/md";
import CPTypeWorkspace from "@/components/admin/freelancer-cp/CPTypeWorkspace";

export default function DigitalCPPage() {
  return (
    <CPTypeWorkspace
      cpType="digital"
      routingStage="digital-cp"
      title="Digital CP Management"
      description="Projects delegated by Company CP for promotion, and leads delegated by Company CP to convert online."
      icon={MdCampaign}
      accentClasses="border-purple-200 bg-purple-50 text-purple-700"
      showCampaignVideos
      showAssignedProjects
      assignmentLevel="company-to-digital"
      emptyMessage="No leads delegated by Company CP yet."
    />
  );
}
