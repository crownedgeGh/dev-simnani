"use client";

import { MdCampaign } from "react-icons/md";
import CPTypeWorkspace from "@/components/admin/freelancer-cp/CPTypeWorkspace";

export default function DigitalCPPage() {
  return (
    <CPTypeWorkspace
      cpType="digital"
      title="Digital CP Management"
      description="Manage digital channel partners promoting projects and generating leads online."
      icon={MdCampaign}
      accentClasses="border-purple-200 bg-purple-50 text-purple-700"
      showCampaignVideos
    />
  );
}
