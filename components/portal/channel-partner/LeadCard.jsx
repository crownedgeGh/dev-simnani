import Badge from "@/components/portal/Badge";
import { LEAD_STATUS_TONE } from "./tones";

export default function LeadCard({ lead, action }) {
  return (
    <div className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm text-cream">{lead.customer}</p>
        <p className="mt-1 text-xs text-muted">
          {lead.phone ? `${lead.phone} · ` : ""}
          {lead.project}
          {lead.date ? ` · ${lead.date}` : ""}
        </p>
        <p className="tracked-label mt-1 text-[10px] text-muted">
          {lead.id}
          {lead.source ? ` · ${lead.source}` : ""}
          {lead.assignedTo ? ` · Assigned: ${lead.assignedTo}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:shrink-0 sm:justify-end">
        {lead.commission && <span className="text-sm text-gold-400">{lead.commission}</span>}
        <Badge tone={LEAD_STATUS_TONE[lead.status] || "muted"}>{lead.status}</Badge>
        {action}
      </div>
    </div>
  );
}
