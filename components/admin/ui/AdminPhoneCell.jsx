"use client";

import AdminCopyCell from "@/components/admin/ui/AdminCopyCell";

// Shared "phone number + copy icon" renderer — used everywhere a mobile
// number is displayed across the admin panel (tables, detail dialogs, cards).
export default function AdminPhoneCell({ value, className = "" }) {
  if (!value) return <span className="text-sm text-[#9ca3af]">—</span>;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} onClick={(e) => e.stopPropagation()}>
      <span className="text-sm text-[#374151]">{value}</span>
      <AdminCopyCell value={value} label="Phone number" />
    </span>
  );
}
