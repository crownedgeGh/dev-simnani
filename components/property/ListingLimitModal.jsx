"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MdHourglassBottom, MdClose, MdBolt } from "react-icons/md";

/**
 * ListingLimitModal — shown instead of the Post Property form when the
 * logged-in owner/broker has used up their free listing quota.
 *
 * Props:
 *   isOpen     {boolean}
 *   onClose    {function}
 *   waitUntil  {string|null} ISO date — when the free slot reopens
 *   isBroker   {boolean}     — brokers get a Top Up CTA, owners don't
 */
export default function ListingLimitModal({ isOpen, onClose, waitUntil, isBroker }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  const waitDateLabel = waitUntil
    ? new Date(waitUntil).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-limit-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: "rgba(5,7,12,0.82)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        animation: "agFadeIn 0.2s ease",
      }}
    >
      <style>{`
        @keyframes agFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes agSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ag-card { animation: agSlideUp 0.26s cubic-bezier(0.34,1.5,0.64,1); }
      `}</style>

      <div className="ag-card relative w-full max-w-[440px] overflow-hidden rounded-3xl border border-gold-400/20 bg-navy-900 shadow-2xl">
        <div
          className="h-0.5"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, var(--color-gold-400) 45%, var(--color-gold-300) 55%, transparent 95%)",
          }}
        />
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold-400/5 blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-navy-700/60 bg-navy-950/60 text-muted transition hover:border-navy-600 hover:bg-navy-800 hover:text-cream"
        >
          <MdClose className="h-4 w-4" />
        </button>

        <div className="px-6 pb-6 pt-7">
          <div className="mb-3 flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold-400/20 bg-gold-400/10 text-gold-400">
              <MdHourglassBottom className="h-6 w-6" />
            </div>
            <div>
              <p className="tracked-label mb-0.5 text-[11px] text-gold-400">Free Limit Reached</p>
              <h2 id="listing-limit-title" className="font-display text-xl text-cream sm:text-2xl">
                Your Listing Limit Is Reached
              </h2>
            </div>
          </div>

          <p className="mb-5 text-[13.5px] leading-relaxed text-muted">
            You&apos;ve used up all your free listings.{" "}
            {waitDateLabel ? (
              <>
                You can post a new free listing again from <span className="text-cream">{waitDateLabel}</span>{" "}
                onwards.
              </>
            ) : (
              "Please wait for your free listing window to renew."
            )}{" "}
            {isBroker && "Need to post sooner? Top up extra listing credits below."}
          </p>

          <div className="mb-5 h-px bg-navy-700/60" />

          <div className="flex flex-col gap-2.5">
            {isBroker && (
              <Link
                href="/topup"
                onClick={onClose}
                id="listing-limit-topup-btn"
                className="tracked-label flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-5 py-3.5 text-center text-xs font-bold text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 hover:shadow-gold-400/20 active:scale-[0.98]"
              >
                <MdBolt className="h-[17px] w-[17px]" />
                Top Up Listings
              </Link>
            )}

            <button
              type="button"
              onClick={onClose}
              className="tracked-label flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-navy-700/60 px-5 py-3 text-center text-xs font-semibold text-cream transition hover:border-gold-500/40 hover:bg-gold-500/10 hover:text-gold-400 active:scale-[0.98]"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
