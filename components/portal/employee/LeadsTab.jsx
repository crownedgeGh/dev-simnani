import Badge from "@/components/portal/Badge";
import { selectClass } from "@/components/auth/inputStyles";
import { LEAD_STATUSES } from "@/lib/demoEmployeePortal";
import { STATUS_TONE, PRIORITY_TONE } from "./tones";

export default function LeadsTab({ leads, onStatusChange }) {
  if (leads.length === 0) {
    return (
      <div className="border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
        <p className="text-muted">No leads assigned in your district yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {leads.map((lead) => (
        <div key={lead.id} className="border border-navy-700/60 bg-navy-900 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-cream">{lead.name}</p>
                <Badge tone={PRIORITY_TONE[lead.priority] || "muted"}>{lead.priority} Priority</Badge>
              </div>
              <p className="mt-1 text-xs text-muted">
                {lead.phone} · Interested in {lead.property}
              </p>
              <p className="tracked-label mt-1 text-[10px] text-muted">
                {lead.source} · {lead.date}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
                <span>Last follow-up: {lead.lastFollowUp}</span>
                <span>Next follow-up: {lead.nextFollowUp}</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <Badge tone={STATUS_TONE[lead.status] || "muted"}>{lead.status}</Badge>
              <select
                aria-label={`Update status for ${lead.name}`}
                value={lead.status}
                onChange={(e) => onStatusChange(lead.id, e.target.value)}
                className={`${selectClass} h-11 w-full min-w-[11rem] text-xs sm:w-auto`}
              >
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
