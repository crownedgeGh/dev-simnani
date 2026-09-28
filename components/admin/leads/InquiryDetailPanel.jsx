"use client";

import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";

export default function InquiryDetailPanel({ isOpen, onClose, lead }) {
  if (!lead) return null;

  const fields = [
    ["Inquiry ID", lead.id],
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email || "—"],
    ["User Type", lead.userType ? lead.userType.charAt(0).toUpperCase() + lead.userType.slice(1) : "—"],
    ["Source", lead.source || "—"],
    ["Property / Interest", lead.propertyTitle || "—"],
    ["Date", lead.date],
  ];

  return (
    <AdminDialog isOpen={isOpen} onClose={onClose} title="Inquiry Details" size="md">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3 rounded-xl bg-[#faf8f5] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff8e1] text-lg font-bold text-[#d97706]">
            {(lead.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1a1a2e]">{lead.name}</p>
            <p className="text-sm text-[#9ca3af]">{lead.phone}</p>
          </div>
          <div className="ml-auto shrink-0">
            <AdminStatusBadge status={lead.status} />
          </div>
        </div>

        {/* Fields */}
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[#f0ebe3]">
            {fields.map(([k, v]) => (
              <tr key={k}>
                <td className="py-2 text-[#9ca3af] w-40 pr-4 align-top">{k}</td>
                <td className="py-2 text-[#374151] font-medium">{v || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Message */}
        {lead.message && (
          <div className="rounded-xl border border-[#e8e0d5] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] mb-1.5">
              Message
            </p>
            <p className="text-sm text-[#374151] whitespace-pre-line">{lead.message}</p>
          </div>
        )}
      </div>
    </AdminDialog>
  );
}
