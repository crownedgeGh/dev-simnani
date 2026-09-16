"use client";

import { MdBusiness } from "react-icons/md";
import CPTypeWorkspace from "@/components/admin/freelancer-cp/CPTypeWorkspace";

export default function CompanyCPPage() {
  return (
    <CPTypeWorkspace
      cpType="company"
      title="Company CP Management"
      description="Verify leads, assign Field CPs and manage the entire channel partner network."
      icon={MdBusiness}
      accentClasses="border-blue-200 bg-blue-50 text-blue-700"
      showCampaignVideos
    />
  );
}
