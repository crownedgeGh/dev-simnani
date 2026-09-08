"use client";

import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import { MdPerson, MdPhone, MdBusiness, MdCalendarToday, MdSource } from "react-icons/md";

export default function LeadDetailPanel({ isOpen, onClose, lead }) {
  if (!lead) return null;

  const fields = [
    ["Lead ID", lead.id],
    ["Customer", lead.customer || lead.name],
    ["Phone", lead.phone],
    ["Project / Property", lead.project || lead.property],
    ["Source", lead.source],
    ["Portal Source", lead.portalSource],
    ["Submitted By", lead.submittedBy],
    ["Date", lead.date],
    ["Assigned To", lead.assignedTo || "—"],
    ["Commission", lead.commission || "—"],
  ];

  return (
    <AdminDialog isOpen={isOpen} onClose={onClose} title="Lead Details" size="md">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center gap-3 rounded-xl bg-[#faf8f5] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff8e1] text-lg font-bold text-[#d97706]">
            {(lead.customer || lead.name || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-[#1a1a2e]">{lead.customer || lead.name}</p>
            <p className="text-sm text-[#9ca3af]">{lead.phone}</p>
          </div>
          <div className="ml-auto">
            <AdminStatusBadge status={lead.status} />
          </div>
        </div>

        {/* Fields */}
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[#f0ebe3]">
            {fields.map(([k, v]) => (
              <tr key={k}>
                <td className="py-2 text-[#9ca3af] w-36 pr-4">{k}</td>
                <td className="py-2 text-[#374151] font-medium">{v || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Notes */}
        {lead.notes && (
          <div className="rounded-xl border border-[#e8e0d5] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] mb-1.5">Notes</p>
            <p className="text-sm text-[#374151]">{Array.isArray(lead.notes) ? lead.notes.join(" · ") : lead.notes}</p>
          </div>
        )}
      </div>
    </AdminDialog>
  );
}
