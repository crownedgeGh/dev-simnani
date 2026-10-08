"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MdCheckCircle } from "react-icons/md";
import AdminTable from "@/components/admin/ui/AdminTable";

const ROLE_LABEL = { company: "Company CP", digital: "Digital CP", field: "Field CP" };

// Head CP's queue of CP registrations awaiting approval (cpApprovalStatus === "hold").
export default function PendingCpApprovals({ onCountChange }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/users?accountType=freelancer");
      const json = await res.json();
      const rows = json.success ? json.data.filter((u) => u.cpApprovalStatus === "hold") : [];
      setPending(rows);
      onCountChange?.(rows.length);
    } catch {
      toast.error("Failed to load pending CP registrations");
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) load();
    });
    return () => { active = false; };
  }, [load]);

  async function handleApprove(row) {
    setApproving(row.accountId);
    try {
      const res = await fetch(`/api/users/${row.accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpApprovalStatus: "active" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to approve");
      setPending((prev) => {
        const next = prev.filter((p) => p.accountId !== row.accountId);
        onCountChange?.(next.length);
        return next;
      });
      toast.success(`${row.fullName} approved — portal access unlocked`);
    } catch (err) {
      toast.error(err.message || "Failed to approve");
    } finally {
      setApproving(null);
    }
  }

  const COLUMNS = [
    { key: "fullName", label: "Name", primary: true, sortable: true },
    { key: "mobile", label: "Mobile" },
    { key: "city", label: "City", render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span> },
    { key: "cpType", label: "Role", render: (v) => ROLE_LABEL[v] || v || "—" },
    {
      key: "actions",
      label: "",
      searchable: false,
      render: (_, row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleApprove(row)}
            disabled={approving === row.accountId}
            className="flex h-8 items-center gap-1 rounded-lg bg-[#f0b429] px-2.5 text-xs font-medium text-white transition hover:bg-[#d97706] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdCheckCircle size={13} />
            {approving === row.accountId ? "Approving…" : "Approve"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminTable columns={COLUMNS} data={pending} loading={loading} emptyMessage="No pending registrations" pageSize={10} />
  );
}
