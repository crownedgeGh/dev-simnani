"use client";

import { useState } from "react";
import { FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import ServiceProviderPlanCards from "@/components/payment/ServiceProviderPlanCards";

// Shown in the last 7 days of a Service Provider lead plan. `daysLeft` is
// computed on the server (avoids hydration drift). Activating early stacks
// on top of the current expiry — see /api/service-plans.
export default function PlanExpiryBanner({ daysLeft, fullName }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gold-500/70 bg-gradient-to-r from-gold-500/15 via-gold-400/10 to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-gold-400">
            <FiAlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="tracked-label text-xs text-gold-400">Plan Expiring Soon</p>
            <p className="mt-1 font-display text-lg text-cream">
              Your plan expires in {daysLeft} {daysLeft === 1 ? "day" : "days"}
            </p>
            <p className="mt-1 text-sm text-muted">Renew now — the new plan starts after your current one ends.</p>
          </div>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="tracked-label flex min-h-[44px] items-center gap-2 self-start rounded-full bg-gold-400 px-4 py-3 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98] sm:self-auto"
          >
            Activate Plan
            <FiArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && (
        <ServiceProviderPlanCards
          fullName={fullName}
          showTopBar={false}
          eyebrow="Renew Your Plan"
          title="Choose Your Plan"
          subtitle="Your new plan begins right after your current plan expires — no days are lost."
        />
      )}
    </div>
  );
}
