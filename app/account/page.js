import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import { getListingLimit } from "@/lib/properties";
import { getPlanById } from "@/lib/plans";
import { getServiceTypeLabel } from "@/lib/serviceProviders";
import { getServicePlanById } from "@/lib/servicePlans";
import PortalHeader from "@/components/portal/PortalHeader";
import AccountProfile from "@/components/portal/AccountProfile";
import PlanExpiryBanner from "@/components/portal/PlanExpiryBanner";
import UpgradePlanBanner from "@/components/portal/UpgradePlanBanner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Profile | Simnani Estate",
  description: "View and manage your personal details.",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  await dbConnect();
  const listingUsage = {
    used: await Property.countDocuments({ ownerId: user.accountId }),
    limit: getListingLimit(user.accountType, user.topupCredits),
  };

  const isBroker = user.accountType === "broker";
  const currentPlan = getPlanById(user.plan) || getPlanById("free");
  const isPremium = currentPlan.id === "premium" && (user.planStatus === "active" || user.planStatus === "pending");

  const daysLeft = user.servicePlanExpiresAt
    ? Math.ceil((new Date(user.servicePlanExpiresAt) - new Date()) / 86400000)
    : 0;
  const expiringSoon = daysLeft > 0 && daysLeft <= 7;
  const showExpiryBanner = user.accountType === "service-provider" && expiringSoon;

  // Purchase date isn't stored — derive it from expiry minus plan validity.
  const fmt = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
  const sp = getServicePlanById(user.servicePlan);
  let servicePlan = null;
  if (user.accountType === "service-provider" && sp && user.servicePlanExpiresAt) {
    const end = new Date(user.servicePlanExpiresAt);
    // servicePlanStartsAt is missing on plans bought before it existed.
    const start = user.servicePlanStartsAt ? new Date(user.servicePlanStartsAt) : new Date(end);
    if (!user.servicePlanStartsAt) start.setMonth(start.getMonth() - sp.validityMonths);
    servicePlan = {
      name: sp.name,
      priceLabel: sp.priceLabel,
      startsOn: fmt(start),
      endsOn: fmt(end),
      expired: end < new Date(),
      upcoming: start > new Date(),
    };
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <PortalHeader title="My Profile" />
      {/* UpgradePlanBanner temporarily disabled — pricing not in use yet */}
      {/* {isBroker && <UpgradePlanBanner planName={currentPlan.name} isPremium={isPremium} />} */}
      {showExpiryBanner && <PlanExpiryBanner daysLeft={daysLeft} fullName={user.fullName} />}
      <div className="mt-6">
        <AccountProfile
          listingUsage={listingUsage}
          servicePlan={servicePlan}
          user={{
            name: user.fullName,
            email: user.email,
            city: user.city,
            state: user.state,
            mobile: user.mobile,
            role:
              user.accountType === "owner"
                ? "Owner"
                : user.accountType === "builder"
                ? "Builder"
                : user.accountType === "service-provider"
                ? getServiceTypeLabel(user.serviceType) || "Service Provider"
                : user.accountType,
            memberSince: user.registeredDate || "Recently",
          }}
        />
      </div>
    </div>
  );
}
