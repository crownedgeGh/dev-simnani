"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import CallbackForm from "./CallbackForm";
import { getServiceTypeLabel } from "@/lib/serviceProviders";

// Callback request shown in place (no page navigation) from a service
// provider section — the serviceType it carries is what admin sees as the
// requested role on /admin/contractor-leads.
export default function CallbackRequestModal({ isOpen, onClose, serviceType, onSubmitted }) {
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

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Request a callback from a ${getServiceTypeLabel(serviceType)}`}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4"
      style={{
        background: "rgba(5,7,12,0.82)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        animation: "cbFadeIn 0.2s ease",
      }}
    >
      <style>{`
        @keyframes cbFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cbSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cb-card { animation: cbSlideUp 0.26s cubic-bezier(0.34,1.5,0.64,1); }
      `}</style>

      <div className="cb-card relative my-auto w-full max-w-md rounded-3xl border border-gold-400/20 bg-navy-900 p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-navy-700/60 text-muted transition hover:border-gold-500/70 hover:text-gold-400"
        >
          <MdClose className="h-5 w-5" />
        </button>

        <p className="tracked-label text-xs text-gold-400">
          {getServiceTypeLabel(serviceType)}
        </p>
        <CallbackForm serviceType={serviceType} onClose={onClose} onSubmitted={onSubmitted} />
      </div>
    </div>,
    document.body,
  );
}
