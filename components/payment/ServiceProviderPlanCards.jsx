"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdCheckCircle, MdStar } from "react-icons/md";
import PayButton from "@/components/payment/PayButton";
import { SERVICE_PROVIDER_PLANS } from "@/lib/servicePlans";

// Shown instantly once a Service Provider finishes signup, and reused as
// the portal gate (app/portal/service-provider/page.js) until a plan is
// paid for — no skip, payment is mandatory before portal access.
export default function ServiceProviderPlanCards({ fullName, onDone }) {
  const router = useRouter();
  const [activatingId, setActivatingId] = useState(null);

  async function handlePaid(plan, response) {
    setActivatingId(plan.id);
    try {
      const res = await fetch("/api/service-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, ...response }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to activate plan");

      toast.success(`${plan.name} activated!`, {
        description:
          plan.id === "leads-799"
            ? "You're all set for maximum leads — we'll get you featured."
            : "You're all set for maximum leads.",
      });
      if (onDone) onDone(data.data);
      else router.refresh();
    } catch (err) {
      toast.error(err.message || "Payment succeeded but activation failed — contact support.");
    } finally {
      setActivatingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl text-center">
        <span className="tracked-label text-xs text-gold-400">Account Created</span>
        <h1 className="mt-3 font-display text-2xl text-cream sm:text-3xl">
          Get Maximum Leads
        </h1>
        <p className="mt-3 text-sm text-muted">
          Activate a lead plan now to start receiving maximum leads right away.
        </p>
      </div>

      <div className="mx-auto mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {SERVICE_PROVIDER_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border bg-navy-900 p-6 sm:p-7 transition ${
              plan.featured
                ? "border-gold-400/60 shadow-[0_0_0_1px_rgba(255,198,51,0.15)]"
                : "border-navy-700/60 hover:border-navy-600"
            }`}
          >
            {plan.featured && (
              <span className="tracked-label absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-400 px-3 py-1 text-[10px] text-navy-950 shadow-lg shadow-gold-400/20">
                Best Value
              </span>
            )}

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-400/20 bg-gold-400/10 text-gold-400">
                <MdStar className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl text-cream">{plan.name}</h2>
                <p className="text-xs text-muted">{plan.tagline}</p>
              </div>
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-display text-4xl text-gold-400">{plan.priceLabel}</span>
            </div>
            <p className="mt-1 text-xs text-muted">{plan.validityLabel}</p>

            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <MdCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                  <span className="text-cream">{feature}</span>
                </li>
              ))}
            </ul>

            <PayButton
              amount={plan.price}
              label={activatingId === plan.id ? "Activating…" : `Activate for ${plan.priceLabel}`}
              name={fullName}
              notes={{ type: "service-plan", planId: plan.id }}
              onSuccess={(response) => handlePaid(plan, response)}
              className={`tracked-label mt-8 flex min-h-[44px] w-full items-center justify-center rounded-full px-4 py-3 text-xs transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                plan.featured
                  ? "bg-gold-400 text-navy-950 shadow-lg shadow-gold-400/10 hover:bg-gold-300 hover:shadow-gold-400/20"
                  : "border border-gold-500/70 text-gold-400 hover:bg-gold-500/10"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
