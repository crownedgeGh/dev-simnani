"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdHourglassTop, MdRefresh } from "react-icons/md";

// Shown instead of a CP's dashboard while cpApprovalStatus === "hold" —
// cleared once Head CP approves the registration (see PendingCpApprovals).
export default function CPUnderReviewModal() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-navy-700/60 bg-navy-900 p-8 text-center shadow-2xl sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/10 text-gold-400">
          <MdHourglassTop className="h-8 w-8" />
        </span>
        <h2 className="mt-6 font-display text-2xl text-cream">Your Account is Under Review</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Your Channel Partner profile is currently under review by our team.
          Please check back soon, or contact support for more information.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="tracked-label inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-navy-700/60 px-6 text-xs text-cream transition hover:border-gold-400 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
          >
            <MdRefresh className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Checking..." : "Check Status"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="tracked-label inline-flex h-12 w-full items-center justify-center rounded-full bg-gold-400 px-6 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 sm:w-auto sm:px-8"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
