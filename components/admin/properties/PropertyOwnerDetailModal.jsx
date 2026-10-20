"use client";

import { MdArrowForward } from "react-icons/md";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f0ebe3] py-2.5 last:border-0">
      <span className="tracked-label text-[10px] text-[#9ca3af]">{label}</span>
      <span className="text-right text-sm font-medium text-[#1a1a2e]">{value || "—"}</span>
    </div>
  );
}

function capitalize(value) {
  if (!value || typeof value !== "string") return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function PropertyOwnerDetailModal({ isOpen, onClose, user, loading, onViewFullDetails }) {
  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={user?.fullName || "User Details"}
      description={user?.accountId ? `Account ${user.accountId}` : undefined}
      size="md"
      footer={
        user && (
          <button
            type="button"
            onClick={onViewFullDetails}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-[#f0b429] px-4 text-sm font-semibold text-white transition hover:bg-[#d97706]"
          >
            View Full Details <MdArrowForward size={16} />
          </button>
        )
      }
    >
      {loading ? (
        <p className="py-6 text-center text-sm text-[#9ca3af]">Loading user details…</p>
      ) : !user ? (
        <p className="py-6 text-center text-sm text-[#9ca3af]">User details not found.</p>
      ) : (
        <div className="rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-4">
          <DetailRow label="Full Name" value={user.fullName} />
          <div className="flex items-start justify-between gap-4 border-b border-[#f0ebe3] py-2.5">
            <span className="tracked-label text-[10px] text-[#9ca3af]">Mobile</span>
            <AdminPhoneCell value={user.mobile} />
          </div>
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Account Type" value={capitalize(user.accountType)} />
          {user.cpType && <DetailRow label="CP Type" value={capitalize(user.cpType)} />}
          <DetailRow label="City" value={user.city} />
          <DetailRow label="State" value={user.state} />
          <DetailRow label="Account ID" value={user.accountId} />
        </div>
      )}
    </AdminDialog>
  );
}
