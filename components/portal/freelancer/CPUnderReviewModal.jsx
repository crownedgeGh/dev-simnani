"use client";

import { MdHourglassTop, MdBlock, MdRefresh } from "react-icons/md";

const COPY = {
  pending: {
    Icon: MdHourglassTop,
    title: "Your Account is Under Review",
    body: "Thanks for registering as a Channel Partner. Our team is verifying your details — you'll get full access to your portal as soon as your profile is approved.",
  },
  hold: {
    Icon: MdHourglassTop,
    title: "Your Account is On Hold",
    body: "Your Channel Partner profile is currently on hold while our team reviews a few details. Please check back soon, or contact support for more information.",
  },
  rejected: {
    Icon: MdBlock,
    title: "Registration Not Approved",
    body: "Unfortunately your Channel Partner registration wasn't approved. Please contact our support team if you'd like to know more.",
  },
};

export default function CPUnderReviewModal({
  status = "pending",
  onGoHome,
  actionLabel = "Back to Home",
  onRefresh,
  refreshing = false,
}) {
  const { Icon, title, body } = COPY[status] || COPY.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md border border-navy-700/60 bg-navy-900 p-8 text-center shadow-2xl sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/10 text-gold-400">
          <Icon className="h-8 w-8" />
        </span>
        <h2 className="mt-6 font-display text-2xl text-cream">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="tracked-label inline-flex h-12 w-full items-center justify-center gap-2 border border-navy-700/60 px-6 text-xs text-cream transition hover:border-gold-400 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
            >
              <MdRefresh className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Checking..." : "Check Status"}
            </button>
          )}
          <button
            type="button"
            onClick={onGoHome}
            className="tracked-label inline-flex h-12 w-full items-center justify-center bg-gold-400 px-6 text-xs text-navy-950 transition hover:bg-gold-300 sm:w-auto sm:px-8"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
