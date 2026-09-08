"use client";

import { MdClose } from "react-icons/md";
import { useEffect } from "react";

export default function AdminDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto rounded-2xl border border-[#e8e0d5] bg-white shadow-xl`}
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#e8e0d5] px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-[#1a1a2e]">{title}</h3>
            {description && (
              <p className="mt-0.5 text-sm text-[#9ca3af]">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9ca3af] transition hover:bg-[#faf8f5] hover:text-[#6b7280]"
            aria-label="Close dialog"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[#e8e0d5] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
