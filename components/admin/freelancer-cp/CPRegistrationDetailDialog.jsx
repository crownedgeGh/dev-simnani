"use client";

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

export default function CPRegistrationDetailDialog({ isOpen, onClose, cp }) {
  if (!cp) return null;

  const skills = Array.isArray(cp.skills) ? cp.skills : [];
  const status = cp.cpApprovalStatus === "hold" ? "hold" : "active";

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={cp.fullName || "Channel Partner"}
      description={cp.accountId ? `Account ${cp.accountId}` : undefined}
      size="md"
    >
      <div className="mb-4 flex items-center gap-2">
        <AdminStatusBadge status={STATUS_LABEL[status]} />
        <span className="text-xs text-[#9ca3af]">{ROLE_LABEL[cp.cpType] || cp.cpType || "—"}</span>
      </div>

      <div className="rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-4">
        <DetailRow label="Full Name" value={cp.fullName} />
        <div className="flex items-start justify-between gap-4 border-b border-[#f0ebe3] py-2.5">
          <span className="tracked-label text-[10px] text-[#9ca3af]">Mobile</span>
          <AdminPhoneCell value={cp.mobile} />
        </div>
        <DetailRow label="Email" value={cp.email} />
        <DetailRow label="City" value={cp.city} />
        <DetailRow label="State" value={cp.state} />
        <DetailRow label="CP Type" value={ROLE_LABEL[cp.cpType] || cp.cpType} />
        <DetailRow label="Approval Status" value={STATUS_LABEL[status]} />
        {cp.cpType === "digital" && (
          <DetailRow label="Currently Working" value={cp.currentlyWorking === "yes" ? "Yes" : "No"} />
        )}
        {cp.cpType === "field" && <DetailRow label="Coverage Areas" value={cp.coverageAreas} />}
        {skills.length > 0 && (
          <DetailRow
            label="Skills"
            value={skills.map((s) => [s.category, s.subcategory].filter(Boolean).join(" / ")).join(", ")}
          />
        )}
        <DetailRow label="Registered On" value={formatDateTime(cp.registeredAt || cp.registeredDate || cp.createdAt)} />
        <DetailRow label="Account ID" value={cp.accountId} />
      </div>
    </AdminDialog>
  );
}
