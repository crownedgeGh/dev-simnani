"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { MdLock, MdClose, MdPersonAdd, MdLogin } from "react-icons/md";

/**
 * AuthGateModal — shown when an unauthenticated user attempts a
 * protected action (e.g. "Post Property", "Contact Person").
 *
 * Props:
 *   isOpen    {boolean}  — whether the modal is visible
 *   onClose   {function} — called when user dismisses the modal
 *   title     {string}   — heading text (defaults to "Post Your Property")
 *   subtitle  {string}   — subtitle copy
 */
export default function AuthGateModal({
  isOpen,
  onClose,
  title = "Post Your Property",
  subtitle = "Join thousands of sellers connecting with verified buyers & investors on Simnani Estate.",
}) {
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

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
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

      {/* Card */}
      <div className="ag-card relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-gold-400/20 bg-navy-900 shadow-2xl">
        {/* Gold accent bar */}
        <div
          className="h-0.5"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, var(--color-gold-400) 45%, var(--color-gold-300) 55%, transparent 95%)",
          }}
        />

        {/* Ambient glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold-400/5 blur-3xl" />

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-navy-700/60 bg-navy-950/60 text-muted transition hover:border-navy-600 hover:bg-navy-800 hover:text-cream"
        >
          <MdClose className="h-4 w-4" />
        </button>

        {/* Body */}
        <div className="px-6 pb-6 pt-7">
          {/* Icon + Heading row */}
          <div className="mb-3 flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold-400/20 bg-gold-400/10 text-gold-400">
              <MdLock className="h-6 w-6" />
            </div>

            <div>
              <p className="tracked-label mb-0.5 text-[11px] text-gold-400">Members Only</p>
              <h2 id="auth-gate-title" className="font-display text-xl text-cream sm:text-2xl">
                {title}
              </h2>
            </div>
          </div>

          {/* Subtitle */}
          <p className="mb-5 text-[13.5px] leading-relaxed text-muted">{subtitle}</p>

          {/* Divider */}
          <div className="mb-5 h-px bg-navy-700/60" />

          {/* CTA Buttons */}
          <div className="flex flex-col gap-2.5">
            {/* Primary — Sign Up */}
            <Link
              href="/auth/register"
              onClick={onClose}
              id="auth-gate-signup-btn"
              className="tracked-label flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-gold-400 px-5 py-3.5 text-center text-xs font-bold text-navy-950 transition hover:bg-gold-300"
            >
              <MdPersonAdd className="h-[17px] w-[17px]" />
              Create Free Account
            </Link>

            {/* Secondary — Log In */}
            <Link
              href="/auth"
              onClick={onClose}
              id="auth-gate-login-btn"
              className="tracked-label flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-navy-700/60 px-5 py-3 text-center text-xs font-semibold text-cream transition hover:border-gold-500/40 hover:bg-gold-500/10 hover:text-gold-400"
            >
              <MdLogin className="h-[17px] w-[17px]" />
              Sign In
            </Link>
          </div>

          {/* Terms */}
          <p className="mt-4 text-center text-[11.5px] leading-relaxed text-muted/80">
            By continuing, you agree to our{" "}
            <Link href="/legal" onClick={onClose} className="text-gold-400 no-underline">
              Terms &amp; Privacy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
