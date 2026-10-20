"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MdCheckCircle, MdBolt } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import AuthGateModal from "@/components/auth/AuthGateModal";
import PayButton from "@/components/payment/PayButton";
import { TOPUPS } from "@/lib/topups";

export default function TopupPlans() {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [creditingId, setCreditingId] = useState(null);

  if (isAuthenticated && user?.accountType !== "broker") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">Top Up Unavailable</h1>
        <p className="mt-3 text-sm text-muted">
          Listing top-ups are available to Broker accounts only.
        </p>
      </div>
    );
  }

  async function handlePaid(topup, response) {
    setCreditingId(topup.id);
    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topupId: topup.id, ...response }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to credit top-up");

      await refreshUser();
      toast.success(`${topup.listings} listings added!`, {
        description: "Your new listing credits are ready to use.",
      });
    } catch (err) {
      toast.error(err.message || "Payment succeeded but credit failed — contact support.");
    } finally {
      setCreditingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        title="Sign In to Top Up"
        subtitle="Create a free account or sign in to buy extra listing credits."
      />

      <div className="mx-auto max-w-2xl text-center">
        <span className="tracked-label text-xs text-gold-400">Listing Top Up</span>
        <h1 className="mt-3 font-display text-3xl text-cream sm:text-4xl lg:text-5xl">
          Top Up Your Listing Credits
        </h1>
        <p className="mt-3 text-sm text-muted">
          Running low on listings? Add more in seconds — credits stay valid for 6 months.
        </p>
      </div>

      <div className="mx-auto mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:max-w-2xl">
        {TOPUPS.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border bg-navy-900 p-6 sm:p-7 transition ${
              plan.id === "topup-799"
                ? "border-gold-400/60 shadow-[0_0_0_1px_rgba(255,198,51,0.15)]"
                : "border-navy-700/60 hover:border-navy-600"
            }`}
          >
            {plan.id === "topup-799" && (
              <span className="tracked-label absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-400 px-3 py-1 text-[10px] text-navy-950 shadow-lg shadow-gold-400/20">
                Best Value
              </span>
            )}

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold-400/20 bg-gold-400/10 text-gold-400">
                <MdBolt className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl text-cream">Top Up {plan.listings}</h2>
                <p className="text-xs text-muted">{plan.listings} extra listings</p>
              </div>
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-display text-4xl text-gold-400">{plan.priceLabel}</span>
            </div>
            <p className="mt-1 text-xs text-muted">{plan.validityLabel}</p>

            <ul className="mt-6 flex flex-1 flex-col gap-3">
              <li className="flex items-start gap-2.5 text-sm">
                <MdCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span className="text-cream">{plan.listings} additional property listings</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <MdCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span className="text-cream">6 month validity</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <MdCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span className="text-cream">Stacks on top of your current plan</span>
              </li>
            </ul>

            {isAuthenticated ? (
              <PayButton
                amount={plan.price}
                label={creditingId === plan.id ? "Crediting…" : `Top Up for ${plan.priceLabel}`}
                name={user?.fullName}
                notes={{ type: "topup", topupId: plan.id, listings: plan.listings }}
                onSuccess={(response) => handlePaid(plan, response)}
                className={`tracked-label mt-8 flex min-h-[44px] w-full items-center justify-center rounded-full px-4 py-3 text-xs transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                  plan.id === "topup-799"
                    ? "bg-gold-400 text-navy-950 shadow-lg shadow-gold-400/10 hover:bg-gold-300 hover:shadow-gold-400/20"
                    : "border border-gold-500/70 text-gold-400 hover:bg-gold-500/10"
                }`}
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthGate(true)}
                className={`tracked-label mt-8 flex min-h-[44px] w-full items-center justify-center rounded-full px-4 py-3 text-xs transition active:scale-[0.98] ${
                  plan.id === "topup-799"
                    ? "bg-gold-400 text-navy-950 shadow-lg shadow-gold-400/10 hover:bg-gold-300 hover:shadow-gold-400/20"
                    : "border border-gold-500/70 text-gold-400 hover:bg-gold-500/10"
                }`}
              >
                Top Up for {plan.priceLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
