"use client";

import Link from "next/link";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import AdminCopyCell from "@/components/admin/ui/AdminCopyCell";

export default function HelpdeskDetailPanel({ isOpen, onClose, ticket }) {
  if (!ticket) return null;

  const fields = [
    ["Ticket ID", ticket.id],
    ["Account ID", ticket.accountId, "copy"],
    ["Name", ticket.userName || "—"],
    ["Phone", ticket.userPhone, "phone"],
    ["Email", ticket.userEmail || "—"],
    ["Account Type", ticket.accountType || "—"],
    ["Property ID", ticket.propertyId || "—", ticket.propertyId ? "copy" : undefined],
    ["Property", ticket.propertyTitle || "—"],
    ["Date", ticket.date],
  ];

  return (
    <AdminDialog isOpen={isOpen} onClose={onClose} title="Helpdesk Ticket" size="md">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-xl bg-[#faf8f5] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff8e1] text-lg font-bold text-[#d97706]">
            {(ticket.userName || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1a1a2e]">{ticket.userName || "Unknown"}</p>
            <AdminPhoneCell value={ticket.userPhone} className="text-[#9ca3af]" />
          </div>
          <div className="ml-auto shrink-0">
            <AdminStatusBadge status={ticket.status} />
          </div>
        </div>

        <table className="w-full text-sm">
          <tbody className="divide-y divide-[#f0ebe3]">
            {fields.map(([k, v, type]) => (
              <tr key={k}>
                <td className="py-2 text-[#9ca3af] w-40 pr-4 align-top">{k}</td>
                <td className="py-2 text-[#374151] font-medium">
                  {type === "phone" ? (
                    <AdminPhoneCell value={v} />
                  ) : type === "copy" ? (
                    <span className="inline-flex items-center gap-1.5">
                      {v}
                      <AdminCopyCell value={v} label={k} />
                    </span>
                  ) : (
                    v || "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="rounded-xl border border-[#e8e0d5] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af] mb-1.5">
            Request Message
          </p>
          <p className="text-sm text-[#374151] whitespace-pre-line">{ticket.message}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ticket.propertyId && (
            <Link
              href={`/admin/properties/${ticket.propertyId}`}
              className="rounded-xl border border-[#e8e0d5] px-3 py-2 text-xs font-semibold text-[#374151] hover:bg-[#faf8f5]"
            >
              View Property
            </Link>
          )}
          {ticket.accountId && (
            <Link
              href={`/admin/users/${ticket.accountId}`}
              className="rounded-xl border border-[#e8e0d5] px-3 py-2 text-xs font-semibold text-[#374151] hover:bg-[#faf8f5]"
            >
              View User
            </Link>
          )}
        </div>
      </div>
    </AdminDialog>
  );
}
