"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MdCheckCircle,
  MdStar,
  MdWorkspacePremium,
  MdHourglassEmpty,
  MdPauseCircle,
  MdCancel,
  MdVerified,
  MdLock,
} from "react-icons/md";
import { FiZap } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import AuthGateModal from "@/components/auth/AuthGateModal";
import { PLANS } from "@/lib/plans";

const PLAN_ICONS = {
  free: FiZap,
  standard: MdStar,
  premium: MdWorkspacePremium,
};

const STATUS_META = {
  active: { label: "Active", icon: MdVerified, className: "border-gold-500/40 bg-gold-500/10 text-gold-400" },
  pending: {
    label: "Pending Approval",
    icon: MdHourglassEmpty,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  hold: { label: "On Hold", icon: MdPauseCircle, className: "border-muted/30 bg-navy-800 text-muted" },
  rejected: { label: "Rejected", icon: MdCancel, className: "border-red-500/30 bg-red-500/10 text-red-400" },
};

// Membership plans are a Broker-only feature — brokers are the account
// type that lists properties at volume and needs a posting-limit upgrade.
function BrokerOnlyNotice({ isAuthenticated }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-gold-400/20 bg-gold-400/10 text-gold-400">
        <MdLock className="h-6 w-6" />
      </div>
      <span className="tracked-label text-xs text-gold-400">Broker Accounts Only</span>
      <h1 className="font-display text-2xl text-cream sm:text-3xl">Pricing isn&apos;t available for your account</h1>
      <p className="text-sm leading-relaxed text-muted">
        Membership plans are exclusively for Broker accounts. Sign in with a Broker account — or register
        as one — to view plans and start posting properties at scale.
      </p>
      <a
        href={isAuthenticated ? "/" : "/auth/register"}
        className="tracked-label mt-2 flex min-h-[44px] items-center justify-center rounded-sm bg-gold-400 px-6 py-3 text-xs text-navy-950 transition hover:bg-gold-300"
      >
        {isAuthenticated ? "Back to Home" : "Register as a Broker"}
      </a>
    </div>
  );
}

export default function PricingPlans() {
  const { isAuthenticated, isLoading, user, refreshUser } = useAuth();
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState(null);

  // Re-sync membership status if it changed server-side (e.g. admin
  // approved/held/rejected the request while this tab was open).
  useEffect(() => {
    if (isAuthenticated) refreshUser();
  }, [isAuthenticated, refreshUser]);

  const handlePurchase = useCallback(
    async (plan) => {
      if (!isAuthenticated) {
        setShowAuthGate(true);
        return;
      }

      setPurchasingPlan(plan.id);
      try {
        const res = await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: plan.id }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to purchase plan");

        await refreshUser();

        if (plan.id === "free") {
          toast.success(`You are now a ${plan.name} Member!`, {
            description: "Start posting properties right away — up to 10 listings, no expiry.",
          });
        } else {
          toast.success(`You are now a ${plan.name} Member!`, {
            description: "Your purchase request is pending admin approval. We'll activate your plan shortly.",
          });
        }
      } catch (err) {
        toast.error(err.message || "Something went wrong. Please try again.");
      } finally {
        setPurchasingPlan(null);
      }
    },
    [isAuthenticated, refreshUser]
  );

  const currentPlan = isAuthenticated && user?.plan ? PLANS.find((p) => p.id === user.plan) : null;
  const currentStatus = isAuthenticated ? STATUS_META[user?.planStatus] || STATUS_META.active : null;

  // Once a plan is active (or awaiting approval), lower-tier plans are
  // locked — e.g. a Premium member can't "downgrade" to Free/Standard,
  // and a Standard member can't drop back to Free.
  const currentRank =
    isAuthenticated && (user?.planStatus === "active" || user?.planStatus === "pending")
      ? PLANS.findIndex((p) => p.id === user?.plan)
      : -1;

  if (isLoading) return null;

  if (!isAuthenticated || user?.accountType !== "broker") {
    return <BrokerOnlyNotice isAuthenticated={isAuthenticated} />;
  }

  return (
    <>
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        title="Sign In to Purchase a Plan"
        subtitle="Create a free account or sign in to choose a membership plan and start posting properties."
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="tracked-label font-display text-2xl text-gold-400 sm:text-3xl">Membership Plans</span>
        </div>

        {/* Current membership status */}
        {currentPlan && currentStatus && (
          <div className="mx-auto mt-6 flex max-w-xl flex-col items-center gap-2 rounded-sm border border-navy-700/60 bg-navy-900 px-5 py-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="tracked-label text-[11px] text-muted">Your Current Plan</p>
              <p className="font-display text-lg text-cream">{currentPlan.name} Member</p>
            </div>
            <span
              className={`tracked-label inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-[11px] ${currentStatus.className}`}
            >
              <currentStatus.icon className="h-3.5 w-3.5" />
              {currentStatus.label}
            </span>
          </div>
        )}

        {/* Plans grid */}
        <div className="mx-auto mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan, planRank) => {
            const Icon = PLAN_ICONS[plan.id] || FiZap;
            const isCurrent = isAuthenticated && user?.plan === plan.id;
            const isPurchasing = purchasingPlan === plan.id;
            const isDowngrade = currentRank > -1 && planRank < currentRank;
            const isDisabled = isPurchasing || isCurrent || isDowngrade;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-sm border bg-navy-900 p-6 sm:p-7 transition ${
                  plan.highlight
                    ? "border-gold-400/60 shadow-[0_0_0_1px_rgba(255,198,51,0.15)]"
                    : "border-navy-700/60 hover:border-navy-600"
                }`}
              >
                {plan.highlight && (
                  <span className="tracked-label absolute -top-3 left-1/2 -translate-x-1/2 rounded-sm bg-gold-400 px-3 py-1 text-[10px] text-navy-950">
                    Most Popular
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-gold-400/20 bg-gold-400/10 text-gold-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-cream">{plan.name}</h2>
                    <p className="text-xs text-muted">{plan.tagline}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl text-gold-400">{plan.priceLabel}</span>
                  {plan.price > 0 && <span className="text-sm text-muted">one-time</span>}
                </div>
                <p className="mt-1 text-xs text-muted">{plan.validityLabel}</p>

                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2.5 text-sm">
                      {feature.included ? (
                        <MdCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                      ) : (
                        <MdCancel className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      )}
                      <span className={feature.included ? "text-cream" : "text-muted"}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handlePurchase(plan)}
                  disabled={isDisabled}
                  className={`tracked-label mt-8 flex min-h-[44px] w-full items-center justify-center rounded-sm px-4 py-3 text-xs transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    plan.highlight
                      ? "bg-gold-400 text-navy-950 hover:bg-gold-300"
                      : "border border-gold-500/70 text-gold-400 hover:bg-gold-500/10"
                  }`}
                >
                  {isCurrent
                    ? "Your Current Plan"
                    : isDowngrade
                    ? "Not Available"
                    : isPurchasing
                    ? "Processing…"
                    : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Testing-period note */}
        <div className="mx-auto mt-14 max-w-3xl rounded-sm border border-navy-700/60 bg-navy-900 px-5 py-5 text-center sm:px-8">
          <p className="tracked-label text-[11px] text-gold-400">Please Note</p>
          
        </div>
      </div>
    </>
  );
}
