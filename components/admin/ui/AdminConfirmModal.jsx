"use client";

import { MdWarning } from "react-icons/md";
import AdminDialog from "./AdminDialog";

export default function AdminConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  isLoading = false,
}) {
  const confirmColors = {
    danger: "bg-red-500 hover:bg-red-600 text-white",
    warning: "bg-[#f0b429] hover:bg-[#d97706] text-white",
    primary: "bg-[#f0b429] hover:bg-[#d97706] text-white",
  };

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-9 rounded-xl border border-[#e8e0d5] px-4 text-sm text-[#6b7280] transition hover:bg-[#faf8f5] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            id="admin-confirm-btn"
            onClick={() => { onConfirm(); }}
            disabled={isLoading}
            className={`h-9 rounded-xl px-4 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${confirmColors[confirmVariant]}`}
          >
            {isLoading ? "Processing…" : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          confirmVariant === "danger" ? "bg-red-50" : "bg-[#fff8e1]"
        }`}>
          <MdWarning
            size={20}
            className={confirmVariant === "danger" ? "text-red-500" : "text-[#d97706]"}
          />
        </div>
        <p className="text-sm text-[#374151] leading-relaxed pt-2">{message}</p>
      </div>
    </AdminDialog>
  );
}
