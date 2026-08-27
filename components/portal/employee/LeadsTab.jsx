import { FiChevronDown } from "react-icons/fi";
import EmployeeBadge from "./EmployeeBadge";
import { selectClass } from "./inputStyles";
import { LEAD_STATUSES } from "@/lib/demoEmployeePortal";
import { STATUS_TONE, PRIORITY_TONE, PRIORITY_ACCENT } from "./tones";

export default function LeadsTab({ leads, onStatusChange }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-sm border border-gray-200 bg-white px-6 py-16 text-center">
        <p className="text-gray-500">No leads assigned in your district yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {leads.map((lead) => (
        <div
          key={lead.id}
          className={`rounded-sm border border-l-4 border-gray-200 bg-white p-4 transition hover:border-cyan-400 hover:bg-cyan-50/30 ${
            PRIORITY_ACCENT[lead.priority] || "border-l-gray-200"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-gray-900">{lead.name}</p>
                <EmployeeBadge tone={PRIORITY_TONE[lead.priority] || "neutral"}>
                  {lead.priority} Priority
                </EmployeeBadge>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {lead.phone} · Interested in {lead.property}
              </p>
              <p className="tracked-label mt-1 text-[10px] text-gray-400">
                {lead.source} · {lead.date}
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                <span>Last follow-up: {lead.lastFollowUp}</span>
                <span>Next follow-up: {lead.nextFollowUp}</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <EmployeeBadge tone={STATUS_TONE[lead.status] || "neutral"}>{lead.status}</EmployeeBadge>
              <div className="relative w-full sm:w-auto">
                <select
                  aria-label={`Update status for ${lead.name}`}
                  value={lead.status}
                  onChange={(e) => onStatusChange(lead.id, e.target.value)}
                  className={`${selectClass} h-11 w-full min-w-[11rem] rounded-sm pr-9 text-xs sm:w-auto`}
                >
                  {LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
