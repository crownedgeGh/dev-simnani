"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdRestore, MdOpenInNew, MdVisibility, MdClose } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";

function SnapshotModal({ record, onClose }) {
  if (!record) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col border border-navy-700/60 bg-navy-900 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-cream">
            {record.fullName || record.accountId} — Archived Data
          </h3>
          <button type="button" onClick={onClose} className="text-muted transition hover:text-cream">
            <MdClose className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">
          Deleted {new Date(record.deletedAt).toLocaleString("en-IN")} — everything this account owned at the time.
        </p>
        <pre className="mt-4 overflow-auto rounded-sm border border-navy-700/60 bg-navy-950 p-4 text-xs text-muted">
          {JSON.stringify(record.snapshot, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default function AdminDeletedAccountsPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/users?status=Deleted", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUsers(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch deleted accounts:", err);
    }
    try {
      const res = await fetch("/api/admin/deleted-accounts", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setArchived(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch archived accounts:", err);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (active) {
        await load();
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleUndelete = async () => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      const res = await fetch(`/api/users/${restoreTarget.accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Active" }),
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) => prev.filter((u) => u.accountId !== restoreTarget.accountId));
        toast.success("Account restored");
      } else {
        toast.error(json.error || "Operation failed");
      }
    } catch {
      toast.error("Operation failed");
    } finally {
      setRestoring(false);
      setRestoreTarget(null);
    }
  };

  // Unified list: admin soft-deleted users (still live, restorable) + self-
  // deleted accounts (hard-deleted, archived snapshot only, not restorable).
  const rows = useMemo(
    () => [
      ...users.map((u) => ({ ...u, source: "soft", deletedOn: u.registeredDate })),
      ...archived.map((a) => ({ ...a, source: "archived", deletedOn: a.deletedAt })),
    ],
    [users, archived]
  );

  const COLUMNS = [
    {
      key: "fullName",
      label: "Name",
      sortable: true,
      primary: true,
      render: (val, row) => (
        <div>
          <p className="font-medium text-[#1a1a2e] text-sm">{val || "—"}</p>
          <p className="text-xs text-[#9ca3af]">{row.accountId}</p>
        </div>
      ),
    },
    { key: "mobile", label: "Mobile", render: (v) => <AdminPhoneCell value={v} /> },
    { key: "email", label: "Email", render: (v) => <span className="text-sm text-[#374151]">{v}</span> },
    { key: "accountType", label: "Account Type", type: "status", sortable: true },
    {
      key: "source",
      label: "Type",
      sortable: true,
      render: (v) => (
        <span className={`text-xs font-medium ${v === "archived" ? "text-[#b91c1c]" : "text-[#374151]"}`}>
          {v === "archived" ? "Self-Deleted (Archived)" : "Soft-Deleted"}
        </span>
      ),
    },
    {
      key: "deletedOn",
      label: "Deleted On",
      sortable: true,
      render: (v) => <span className="text-sm text-[#374151]">{v ? new Date(v).toLocaleDateString("en-IN") : "—"}</span>,
    },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) =>
        row.source === "archived"
          ? [{ label: "View Data", icon: MdVisibility, onClick: () => setViewing(row) }]
          : [
              { label: "View Profile", icon: MdOpenInNew, onClick: () => router.push(`/admin/users/${row.accountId}`) },
              { label: "Undelete", icon: MdRestore, onClick: () => setRestoreTarget(row) },
            ],
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Deleted Accounts"
        description="Accounts that self-deleted (hard-deleted, archived here) or were soft-deleted by an admin"
        badge={`${rows.length} accounts`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <AdminTable
        columns={COLUMNS}
        data={rows}
        loading={loading}
        onRowClick={(row) => (row.source === "archived" ? setViewing(row) : router.push(`/admin/users/${row.accountId}`))}
        emptyMessage="No deleted accounts"
        pageSize={10}
      />

      <AdminConfirmModal
        isOpen={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleUndelete}
        title="Undelete Account"
        message={`Restore "${restoreTarget?.fullName}"'s account to Active?`}
        confirmLabel="Undelete"
        confirmVariant="primary"
        isLoading={restoring}
      />

      <SnapshotModal record={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
