"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/**
 * AuthGateModal — shown when an unauthenticated user attempts a
 * protected action (e.g. "Post Property").
 *
 * Props:
 *   isOpen    {boolean}  — whether the modal is visible
 *   onClose   {function} — called when user dismisses the modal
 */
export default function AuthGateModal({ isOpen, onClose }) {
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
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
        .ag-close:hover { background: rgba(255,255,255,0.1) !important; color: #f5f1e8 !important; }
        .ag-btn-primary:hover { background: #ffde85 !important; box-shadow: 0 6px 24px rgba(255,198,51,0.35) !important; }
        .ag-btn-secondary:hover { background: rgba(255,198,51,0.1) !important; border-color: rgba(255,198,51,0.4) !important; color: #ffc633 !important; }
      `}</style>

      {/* Card */}
      <div
        className="ag-card"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          background: "linear-gradient(160deg, #0d1220 0%, #0a0e1a 50%, #060810 100%)",
          border: "1px solid rgba(255,198,51,0.2)",
          borderRadius: 22,
          boxShadow: "0 0 0 1px rgba(255,198,51,0.05), 0 40px 100px rgba(0,0,0,0.75), 0 0 80px rgba(255,198,51,0.04) inset",
          overflow: "hidden",
        }}
      >
        {/* Gold accent bar */}
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent 5%, #ffc633 45%, #ffde85 55%, transparent 95%)" }} />

        {/* Ambient glow */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 220, height: 220, background: "rgba(255,198,51,0.05)", borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="ag-close"
          style={{
            position: "absolute", top: 14, right: 14,
            width: 30, height: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 8,
            color: "#9aa3b8",
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
            zIndex: 10,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 13, height: 13 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Body */}
        <div style={{ padding: "28px 24px 24px" }}>

          {/* Icon + Heading row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{
              flexShrink: 0,
              width: 48, height: 48, borderRadius: 13,
              background: "linear-gradient(135deg, rgba(255,198,51,0.2), rgba(255,198,51,0.06))",
              border: "1px solid rgba(255,198,51,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#ffc633",
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 22, height: 22 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>

            <div>
              <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffc633", marginBottom: 3, fontWeight: 600 }}>
                Members Only
              </p>
              <h2
                id="auth-gate-title"
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontSize: "clamp(1.15rem, 5vw, 1.45rem)",
                  fontWeight: 600,
                  color: "#f5f1e8",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Post Your Property
              </h2>
            </div>
          </div>

          {/* Subtitle */}
          <p style={{ fontSize: 13.5, color: "#8a93a8", lineHeight: 1.55, marginBottom: 18 }}>
            Join thousands of sellers connecting with verified buyers &amp; investors on Simnani Estate.
          </p>

          {/* Feature pills — single horizontal row */}
          

          {/* Divider */}
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,198,51,0.15) 50%, transparent)", marginBottom: 18 }} />

          {/* CTA Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Primary — Sign Up */}
            <Link
              href="/auth/register"
              onClick={onClose}
              id="auth-gate-signup-btn"
              className="ag-btn-primary"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", padding: "13px 20px",
                background: "#ffc633",
                color: "#05070c",
                borderRadius: 11,
                fontSize: 12.5, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                textDecoration: "none",
                boxShadow: "0 4px 18px rgba(255,198,51,0.28)",
                transition: "background 0.18s, box-shadow 0.18s",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              Create Free Account
            </Link>

            {/* Secondary — Log In */}
            <Link
              href="/auth"
              onClick={onClose}
              id="auth-gate-login-btn"
              className="ag-btn-secondary"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", padding: "12px 20px",
                background: "transparent",
                color: "#c2bdb4",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 11,
                fontSize: 12.5, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase",
                textDecoration: "none",
                transition: "background 0.18s, border-color 0.18s, color 0.18s",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              Sign In
            </Link>
          </div>

          {/* Terms */}
          <p style={{ marginTop: 16, textAlign: "center", fontSize: 11.5, color: "#6b7280", lineHeight: 1.5 }}>
            By continuing, you agree to our{" "}
            <Link href="/legal" onClick={onClose} style={{ color: "#ffc633", textDecoration: "none" }}>
              Terms &amp; Privacy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
