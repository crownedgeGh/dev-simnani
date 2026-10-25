"use client";

import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import { getServiceTypeLabel } from "@/lib/serviceProviders";

const TIME_LABELS = {
  morning: "Morning (9AM - 12PM)",
  afternoon: "Afternoon (12PM - 5PM)",
  evening: "Evening (5PM - 8PM)",
};

export default function ContractorLeadDetailPanel({ isOpen, onClose, lead }) {
  if (!lead) return null;

  const fields = [
    ["Request ID", lead.id],
    ["Name", lead.name],
    ["Phone", lead.phone, "phone"],
    ["Requested Role", getServiceTypeLabel(lead.serviceType)],
    ["Requested From", lead.sourcePath || "—"],
    ["Location", [lead.city, lead.state].filter(Boolean).join(", ") || "—"],
    ["Best Time", TIME_LABELS[lead.bestTime] || "—"],
    ["Date", lead.date],
  ];

  return (
    <AdminDialog isOpen={isOpen} onClose={onClose} title="Callback Request Details" size="md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-xl bg-[#faf8f5] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff8e1] text-lg font-bold text-[#d97706]">
            {(lead.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1a1a2e]">{lead.name}</p>
            <AdminPhoneCell value={lead.phone} className="text-[#9ca3af]" />
          </div>
          <div className="ml-auto shrink-0">
            <AdminStatusBadge status={lead.status} />
          </div>
        </div>

        <table className="w-full text-sm">
          <tbody className="divide-y divide-[#f0ebe3]">
            {fields.map(([k, v, type]) => (
              <tr key={k}>
                <td className="py-2 text-[#9ca3af] w-40 pr-4 align-top">{k}</td>
                <td className="py-2 text-[#374151] font-medium">
                  {type === "phone" ? <AdminPhoneCell value={v} /> : v || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="rounded-xl border border-[#e8e0d5] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] mb-1.5">
            Requirement
          </p>
          <p className="text-sm text-[#374151] whitespace-pre-line">
            {lead.requirement || "NA"}
          </p>
        </div>

        {lead.adminNotes && (
          <div className="rounded-xl border border-[#e8e0d5] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] mb-1.5">
              Admin Notes
            </p>
            <p className="text-sm text-[#374151] whitespace-pre-line">{lead.adminNotes}</p>
          </div>
        )}
      </div>
    </AdminDialog>
  );
}
