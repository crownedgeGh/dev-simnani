"use client";

import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f0ebe3] py-2.5 last:border-0">
      <span className="tracked-label text-[10px] text-[#9ca3af]">{label}</span>
      <span className="text-right text-sm font-medium text-[#1a1a2e]">{value || "—"}</span>
    </div>
  );
}

const ROUTING_STAGE_LABELS = {
  "digital-cp": "Digital CP",
  "field-cp": "Field CP",
  "head-cp": "Head CP",
  "company-cp": "Company CP",
};

export default function LeadDetailDialog({ isOpen, onClose, lead }) {
  if (!lead) return null;

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={lead.customer}
      description={`Lead ${lead.id}`}
      size="md"
    >
      <div className="mb-4 flex items-center gap-2">
        <AdminStatusBadge status={lead.status} />
        <span className="text-xs text-[#9ca3af]">
          Currently at {ROUTING_STAGE_LABELS[lead.routingStage] || lead.routingStage || "—"}
        </span>
      </div>

      <div className="rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-4">
        <DetailRow label="Customer" value={lead.customer} />
        <DetailRow label="Phone" value={lead.phone} />
        <DetailRow label="Project" value={lead.project} />
        {lead.projectId && <DetailRow label="Project ID" value={lead.projectId} />}
        <DetailRow label="Source" value={lead.source} />
        <DetailRow
          label="Submitted By"
          value={
            lead.submittedBy?.name
              ? `${lead.submittedBy.name} (${lead.submittedBy.cpType || "—"} CP)`
              : "—"
          }
        />
        <DetailRow label="Assigned To" value={lead.assignedTo} />
        <DetailRow label="Date" value={lead.date} />
        {lead.notes && <DetailRow label="Notes" value={lead.notes} />}
      </div>
    </AdminDialog>
  );
}
