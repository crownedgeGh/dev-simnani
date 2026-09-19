"use client";

import { MdSupervisorAccount } from "react-icons/md";
import CPTypeWorkspace from "@/components/admin/freelancer-cp/CPTypeWorkspace";

const HEAD_CP_LEAD_TYPES = ["digital", "field"];

export default function HeadCPPage() {
  return (
    <CPTypeWorkspace
      leadCpTypes={HEAD_CP_LEAD_TYPES}
      title="Head CP Management"
      description="Every lead forwarded by a Digital CP or Field CP lands here directly — verify and assign it without routing through Company CP."
      icon={MdSupervisorAccount}
      accentClasses="border-amber-200 bg-amber-50 text-amber-700"
      showNetworkTab={false}
      showAddPartner={false}
      showInvitationCodes={false}
      showCampaignVideos={false}
      showCommissions={false}
      emptyMessage="No leads forwarded yet — leads sent from Digital CP or Field CP via 'Forward to Head CP' will show up here."
    />
  );
}
