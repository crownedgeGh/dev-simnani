"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MdReportProblem,
  MdEdit,
  MdHourglassTop,
  MdErrorOutline,
  MdOutlineChatBubble,
  MdCheckCircle,
  MdClose,
} from "react-icons/md";

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";
}

function CloseButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-navy-950/40 hover:text-cream"
    >
      <MdClose className="h-4 w-4" />
    </button>
  );
}

function dismissKeyFor(propertyId, variant, timestamp) {
  return `se_banner_dismissed_${propertyId}_${variant}_${timestamp || ""}`;
}

function useDismiss(dismissKey) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(dismissKey) === "1");
  }, [dismissKey]);

  function dismiss() {
    localStorage.setItem(dismissKey, "1");
    setDismissed(true);
  }

  return [dismissed, dismiss];
}

export default function CorrectionHoldBanner({ correctionRequest, propertyId, status }) {
  const variant = correctionRequest?.active
    ? "hold"
    : correctionRequest?.underReview
      ? "under-review"
      : status === "Pending Review"
        ? "pending-review"
        : status === "Active"
          ? "active"
          : "none";
  const timestamp =
    correctionRequest?.requestedAt || correctionRequest?.submittedAt || "";
  const [dismissed, dismiss] = useDismiss(dismissKeyFor(propertyId, variant, timestamp));

  if (dismissed) return null;

  if (!correctionRequest?.active && !correctionRequest?.underReview) {
    if (status === "Pending Review") {
      return (
        <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl border border-gold-500/60 bg-gold-400/10 p-5 pr-12 shadow-lg shadow-gold-400/5">
            <CloseButton onClick={dismiss} />
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-gold-400">
                <MdHourglassTop className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="tracked-label text-xs text-gold-400">Under Review</p>
                <p className="mt-1 text-sm text-cream">
                  This listing is awaiting admin approval and isn&apos;t visible on the public portal yet.
                  We&apos;ll notify you once it goes live.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (status === "Active") {
      return (
        <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl border border-gold-500/60 bg-gold-400/10 p-5 pr-12 shadow-lg shadow-gold-400/5">
            <CloseButton onClick={dismiss} />
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-gold-400">
                <MdCheckCircle className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="tracked-label text-xs text-gold-400">Approved</p>
                <p className="mt-1 text-sm text-cream">
                  This listing has been approved by our team and is now live on the public portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  if (correctionRequest.underReview) {
    return (
      <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl border border-gold-500/60 bg-gold-400/10 p-5 pr-12 shadow-lg shadow-gold-400/5">
          <CloseButton onClick={dismiss} />
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-gold-400">
              <MdHourglassTop className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="tracked-label text-xs text-gold-400">Your Changes Are Under Review</p>
              <p className="mt-1 text-sm text-cream">
                Thanks for updating your listing. Our team will re-check it shortly and let you know once
                it&apos;s live again.
              </p>
              {formatDate(correctionRequest.submittedAt) && (
                <p className="mt-3 text-xs text-muted">
                  Resubmitted on {formatDate(correctionRequest.submittedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { reasons, message, requestedAt } = correctionRequest;
  const dateLabel = formatDate(requestedAt);

  return (
    <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-2xl border border-gold-500/60 bg-gold-400/10 p-5 pr-12 shadow-lg shadow-gold-400/5">
        <CloseButton onClick={dismiss} />
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-gold-400">
            <MdReportProblem className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="tracked-label text-xs text-gold-400">Your Listing Is On Hold</p>
            <p className="mt-1 text-sm text-cream">
              Our team reviewed this listing and needs a few corrections before it can go live. Apply
              corrections on your listing by clicking on this button.
            </p>

            {reasons?.length > 0 && (
              <div className="mt-4">
                <p className="tracked-label text-[10px] text-gold-400">What needs fixing</p>
                <ul className="mt-2 flex flex-col gap-2">
                  {reasons.map((reason) => (
                    <li
                      key={reason}
                      className="flex items-start gap-2.5 rounded-xl border-l-2 border-gold-400 bg-navy-950/60 px-3 py-2.5 text-sm font-medium text-cream"
                    >
                      <MdErrorOutline className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {message && (
              <div className="mt-4 rounded-xl border-l-2 border-gold-400 bg-navy-950/60 p-3.5">
                <p className="tracked-label flex items-center gap-1.5 text-[10px] text-gold-400">
                  <MdOutlineChatBubble className="h-3.5 w-3.5" />
                  Message from our team
                </p>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-cream">{message}</p>
              </div>
            )}

            {dateLabel && <p className="mt-3 text-xs text-muted">Flagged on {dateLabel}</p>}

            {propertyId && (
              <Link
                href={`/post-property/edit/${propertyId}`}
                className="tracked-label mt-4 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-gold-400 px-4 py-2.5 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98]"
              >
                <MdEdit className="h-4 w-4" />
                Edit Listing
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
