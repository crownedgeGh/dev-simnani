"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdRestore, MdOpenInNew } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";

export default function AdminDeletedAccountsPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoring, setRestoring] = useState(false);

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

  const COLUMNS = [
    {
      key: "fullName",
      label: "Name",
      sortable: true,
      primary: true,
      render: (val, row) => (
        <div>
          <p className="font-medium text-[#1a1a2e] text-sm">{val}</p>
          <p className="text-xs text-[#9ca3af]">{row.accountId}</p>
        </div>
      ),
    },
    { key: "mobile", label: "Mobile", render: (v) => <AdminPhoneCell value={v} /> },
    { key: "email", label: "Email", render: (v) => <span className="text-sm text-[#374151]">{v}</span> },
    { key: "accountType", label: "Account Type", type: "status", sortable: true },
    { key: "city", label: "City", sortable: true },
    { key: "registeredDate", label: "Registered", sortable: true },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        { label: "View Profile", icon: MdOpenInNew, onClick: () => router.push(`/admin/users/${row.accountId}`) },
        { label: "Undelete", icon: MdRestore, onClick: () => setRestoreTarget(row) },
      ],
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Deleted Accounts"
        description="Accounts that self-deleted or were soft-deleted by an admin"
        badge={`${users.length} accounts`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <AdminTable
        columns={COLUMNS}
        data={users}
        loading={loading}
        onRowClick={(row) => router.push(`/admin/users/${row.accountId}`)}
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
    </div>
  );
}
