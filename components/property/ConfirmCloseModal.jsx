"use client";

import { useEffect, useRef } from "react";
import { MdWarningAmber } from "react-icons/md";

/**
 * ConfirmCloseModal — shown when the user tries to leave a partially
 * filled form (e.g. Post Property) so they don't lose progress by accident.
 */
export default function ConfirmCloseModal({ isOpen, onCancel, onConfirm }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-close-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: "rgba(5,7,12,0.82)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        animation: "ccFadeIn 0.2s ease",
      }}
    >
      <style>{`
        @keyframes ccFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ccSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cc-card { animation: ccSlideUp 0.26s cubic-bezier(0.34,1.5,0.64,1); }
      `}</style>

      <div className="cc-card relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-gold-400/20 bg-navy-900 shadow-2xl">
        <div
          className="h-0.5"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, var(--color-gold-400) 45%, var(--color-gold-300) 55%, transparent 95%)",
          }}
        />

        <div className="px-6 pb-6 pt-7">
          <div className="mb-3 flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold-400/20 bg-gold-400/10 text-gold-400">
              <MdWarningAmber className="h-6 w-6" />
            </div>
            <div>
              <p className="tracked-label mb-0.5 text-[11px] text-gold-400">Unsaved Changes</p>
              <h2 id="confirm-close-title" className="font-display text-xl text-cream sm:text-2xl">
                Close this form?
              </h2>
            </div>
          </div>

          <p className="mb-5 text-[13.5px] leading-relaxed text-muted">
            You&apos;ve started filling this out but haven&apos;t submitted it yet. If you leave now,
            everything you&apos;ve entered will be lost.
          </p>

          <div className="mb-5 h-px bg-navy-700/60" />

          <div className="flex flex-col gap-2.5 sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              className="tracked-label flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-red-500/40 px-5 py-3.5 text-center text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
            >
              Yes, Close Form
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="tracked-label flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-gold-400 px-5 py-3.5 text-center text-xs font-bold text-navy-950 transition hover:bg-gold-300"
            >
              Keep Editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
