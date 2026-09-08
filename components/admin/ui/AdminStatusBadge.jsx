// Status badge color mapping
const STATUS_COLORS = {
  // Property statuses
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Pending Review": "bg-amber-50 text-amber-700 border-amber-200",
  Rejected: "bg-red-50 text-red-600 border-red-200",
  Live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  // User statuses
  Suspended: "bg-red-50 text-red-600 border-red-200",
  Deleted: "bg-gray-100 text-gray-400 border-gray-200",
  // Lead statuses
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-purple-50 text-purple-700 border-purple-200",
  Qualified: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Interested: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Site Visit": "bg-orange-50 text-orange-700 border-orange-200",
  "Site Visit Scheduled": "bg-orange-50 text-orange-700 border-orange-200",
  "Site Visit Completed": "bg-orange-50 text-orange-700 border-orange-200",
  "Site Visit Done": "bg-orange-50 text-orange-700 border-orange-200",
  Converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Booked: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Lost: "bg-red-50 text-red-600 border-red-200",
  Negotiation: "bg-violet-50 text-violet-700 border-violet-200",
  // CP statuses
  "Pending Verification": "bg-amber-50 text-amber-700 border-amber-200",
  Verified: "bg-blue-50 text-blue-700 border-blue-200",
  Assigned: "bg-indigo-50 text-indigo-700 border-indigo-200",
  // Commission/approval
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "On Hold": "bg-gray-100 text-gray-600 border-gray-200",
  // Video moderation
  "Pending Review": "bg-amber-50 text-amber-700 border-amber-200",
  "Suggested Edit": "bg-purple-50 text-purple-700 border-purple-200",
  // Callback statuses
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Handled: "bg-emerald-50 text-emerald-700 border-emerald-200",
  // Project statuses
  "Under Construction": "bg-orange-50 text-orange-700 border-orange-200",
  "Ready to Move": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Ready to Register": "bg-blue-50 text-blue-700 border-blue-200",
  // CP type
  digital: "bg-purple-50 text-purple-700 border-purple-200",
  field: "bg-orange-50 text-orange-700 border-orange-200",
  company: "bg-blue-50 text-blue-700 border-blue-200",
  // Account types
  buyer: "bg-blue-50 text-blue-700 border-blue-200",
  broker: "bg-indigo-50 text-indigo-700 border-indigo-200",
  investor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  freelancer: "bg-purple-50 text-purple-700 border-purple-200",
  "common-person": "bg-gray-100 text-gray-600 border-gray-200",
  employee: "bg-orange-50 text-orange-700 border-orange-200",
};

const DEFAULT_COLOR = "bg-gray-100 text-gray-600 border-gray-200";

export default function AdminStatusBadge({ status, customColors, className = "" }) {
  const colorClass = (customColors || STATUS_COLORS)[status] || DEFAULT_COLOR;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${colorClass} ${className}`}
    >
      {status || "—"}
    </span>
  );
}

export { STATUS_COLORS };
