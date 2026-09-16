"use client";

import { MdDirectionsWalk } from "react-icons/md";
import CPTypeWorkspace from "@/components/admin/freelancer-cp/CPTypeWorkspace";

export default function FieldCPPage() {
  return (
    <CPTypeWorkspace
      cpType="field"
      title="Field CP Management"
      description="Manage field channel partners converting assigned leads through site visits."
      icon={MdDirectionsWalk}
      accentClasses="border-orange-200 bg-orange-50 text-orange-700"
      showCampaignVideos={false}
    />
  );
}
