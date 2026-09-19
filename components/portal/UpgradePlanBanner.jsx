"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiTrendingUp, FiX } from "react-icons/fi";

const DISMISS_KEY = "se_upgrade_banner_dismissed_at";
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export default function UpgradePlanBanner({ planName, isPremium = false }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY));
    if (dismissedAt && Date.now() - dismissedAt < SNOOZE_MS) {
      setDismissed(true);
    }
  }, []);

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  }

  if (dismissed || isPremium) return null;

  return (
    <div className="relative mt-6 flex flex-col gap-4 rounded-sm border border-gold-500/70 bg-gradient-to-r from-gold-500/15 via-gold-400/10 to-transparent px-5 py-4 pr-12 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center text-muted transition hover:text-cream"
      >
        <FiX className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-400/15 text-gold-400">
          <FiTrendingUp className="h-5 w-5" />
        </span>
        <div>
          <p className="tracked-label text-xs text-gold-400">Get More Leads</p>
          <p className="mt-1 font-display text-lg text-cream">Upgrade your plan for more attention on your listings</p>
          <p className="mt-1 text-sm text-muted">
            Current plan: <span className="text-cream">{planName}</span>
          </p>
        </div>
      </div>

      <Link
        href="/pricing"
        className="tracked-label flex items-center gap-2 self-start bg-gold-400 px-4 py-3 text-xs text-navy-950 transition hover:bg-gold-300 sm:self-auto"
      >
        Upgrade Plan
        <FiArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
