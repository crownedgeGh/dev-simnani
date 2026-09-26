"use client";

import { MdBusiness } from "react-icons/md";
import CPTypeWorkspace from "@/components/admin/freelancer-cp/CPTypeWorkspace";

export default function CompanyCPPage() {
  return (
    <CPTypeWorkspace
      cpType="company"
      routingStage="company-cp"
      title="Company CP Management"
      description="Receives properties assigned by Head CP and leads forwarded by Head CP. Decide whether each goes to a Field CP or a Digital CP."
      icon={MdBusiness}
      accentClasses="border-blue-200 bg-blue-50 text-blue-700"
      showCampaignVideos
      showAssignedProjects
      assignmentLevel="head-to-company"
      delegateToTypes={["field", "digital"]}
      emptyMessage="No leads forwarded by Head CP yet."
    />
  );
}
