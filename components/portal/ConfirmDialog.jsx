"use client";

import { useEffect, useRef } from "react";
import { MdWarningAmber } from "react-icons/md";

export default function ConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  isLoading = false,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onCancel();
      }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(5,7,12,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div className="w-full max-w-sm border border-navy-700/60 bg-navy-900 shadow-2xl">
        <div
          className="h-0.5"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, var(--color-gold-400) 45%, var(--color-gold-300) 55%, transparent 95%)",
          }}
        />
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-gold-400/20 bg-gold-400/10 text-gold-400">
              <MdWarningAmber className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="confirm-dialog-title" className="font-display text-base text-cream">
                {title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{message}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="tracked-label min-h-[40px] border border-navy-700/60 px-4 text-[11px] text-muted transition hover:border-navy-600 hover:text-cream disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="tracked-label min-h-[40px] border border-gold-500/70 bg-gold-400/10 px-4 text-[11px] text-gold-400 transition hover:bg-gold-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Please wait…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
