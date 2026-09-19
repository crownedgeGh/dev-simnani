import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getPlanById } from "@/lib/plans";
import PortalHeader from "@/components/portal/PortalHeader";
import AccountProfile from "@/components/portal/AccountProfile";
import UpgradePlanBanner from "@/components/portal/UpgradePlanBanner";
import { DEMO_USER } from "@/lib/demoAccount";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Profile | Simnani Estate",
  description: "View and manage your personal details.",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const isBroker = user.accountType === "broker";
  const currentPlan = getPlanById(user.plan) || getPlanById("free");
  const isPremium = currentPlan.id === "premium" && (user.planStatus === "active" || user.planStatus === "pending");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PortalHeader title="My Profile" />
      {isBroker && <UpgradePlanBanner planName={currentPlan.name} isPremium={isPremium} />}
      <div className="mt-6">
        <AccountProfile user={DEMO_USER} />
      </div>
    </div>
  );
}
