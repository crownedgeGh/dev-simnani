"use client";

import { MdLinkOff } from "react-icons/md";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f0ebe3] py-2.5 last:border-0">
      <span className="tracked-label text-[10px] text-[#9ca3af]">{label}</span>
      <span className="text-right text-sm font-medium text-[#1a1a2e]">{value || "—"}</span>
    </div>
  );
}

const ROLE_LABEL = { company: "Company CP", digital: "Digital CP", field: "Field CP" };
const STATUS_LABEL = { active: "Active", hold: "On Hold" };

function formatDateTime(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CompanyCPAssignmentDialog({ isOpen, onClose, assignment, cp, loading, onUnassign, unassigning }) {
  if (!assignment) return null;

  const approvalStatus = cp?.cpApprovalStatus === "hold" ? "hold" : "active";
  const skills = Array.isArray(cp?.skills) ? cp.skills : [];

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={assignment.assignedToName || "Company CP"}
      description={cp?.accountId ? `Account ${cp.accountId}` : assignment.assignedToAccountId}
      size="md"
      footer={
        onUnassign && (
          <button
            type="button"
            onClick={() => onUnassign(assignment)}
            disabled={unassigning}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdLinkOff size={16} /> {unassigning ? "Unassigning…" : "Unassign"}
          </button>
        )
      }
    >
      {loading ? (
        <p className="py-6 text-center text-sm text-[#9ca3af]">Loading partner details…</p>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <AdminStatusBadge status={STATUS_LABEL[approvalStatus]} />
            <span className="text-xs text-[#9ca3af]">{ROLE_LABEL[cp?.cpType] || "Company CP"}</span>
          </div>

          <div className="rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-4">
            <DetailRow label="Full Name" value={cp?.fullName || assignment.assignedToName} />
            <div className="flex items-start justify-between gap-4 border-b border-[#f0ebe3] py-2.5">
              <span className="tracked-label text-[10px] text-[#9ca3af]">Mobile</span>
              <AdminPhoneCell value={cp?.mobile} />
            </div>
            <DetailRow label="Email" value={cp?.email} />
            <DetailRow label="City" value={cp?.city || assignment.assignedToCity} />
            <DetailRow label="State" value={cp?.state || assignment.assignedToState} />
            {skills.length > 0 && (
              <DetailRow
                label="Skills"
                value={skills.map((s) => [s.category, s.subcategory].filter(Boolean).join(" / ")).join(", ")}
              />
            )}
            <DetailRow label="Account ID" value={cp?.accountId || assignment.assignedToAccountId} />
          </div>

          <div className="mt-4 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-4">
            <DetailRow label="Assigned By" value={assignment.assignedByName} />
            <DetailRow label="Assigned On" value={formatDateTime(assignment.createdAt)} />
            <DetailRow label="Assignment Status" value={assignment.status || "Assigned"} />
          </div>
        </>
      )}
    </AdminDialog>
  );
}
