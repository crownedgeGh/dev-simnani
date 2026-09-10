"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdEdit, MdBlock, MdOpenInNew } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";
import UserEditDialog from "@/components/admin/users/UserEditDialog";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection, writeCollection } from "@/lib/adminStorage";

const ACCOUNT_TYPES = ["buyer", "broker", "investor", "freelancer", "common-person", "employee"];
const STATUSES = ["Active", "Suspended", "Deleted"];

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setUsers(json.data);
        try {
          writeCollection(ADMIN_KEYS.users, json.data);
        } catch {
          // ignore
        }
        return;
      }
    } catch (err) {
      console.error("Failed to fetch users from API:", err);
    }
    setUsers(readCollection(ADMIN_KEYS.users) || []);
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

  const handleEdit = async (updated) => {
    try {
      const res = await fetch(`/api/users/${updated.accountId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setUsers((prev) => prev.map((u) => (u.accountId === json.data.accountId ? json.data : u)));
        return;
      }
    } catch {
      // Fallback
    }
    const res = await adminAxios.put(`/admin/users/${updated.accountId}`, { ...updated, id: updated.accountId });
    setUsers(res.data.data);
  };

  const handleSoftDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${deleteTarget.accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Deleted" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setUsers((prev) => prev.map((u) => (u.accountId === json.data.accountId ? json.data : u)));
        toast.warning("User account marked as deleted");
        setDeleting(false);
        setDeleteTarget(null);
        return;
      }
    } catch {
      // Fallback
    }
    try {
      const res = await adminAxios.patch(`/admin/users/${deleteTarget.accountId}`, { status: "Deleted", id: deleteTarget.accountId });
      setUsers(res.data.data);
      toast.warning("User account marked as deleted");
    } catch {
      toast.error("Operation failed");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
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
    {
      key: "mobile",
      label: "Mobile",
      render: (v) => <span className="text-sm text-[#374151] font-mono">{v}</span>,
    },
    {
      key: "email",
      label: "Email",
      render: (v) => <span className="text-sm text-[#374151] truncate max-w-[160px] block">{v}</span>,
    },
    {
      key: "accountType",
      label: "Account Type",
      type: "status",
      sortable: true,
      filterOptions: ACCOUNT_TYPES,
    },
    {
      key: "city",
      label: "City",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      type: "status",
      sortable: true,
      filterOptions: STATUSES,
    },
    {
      key: "registeredDate",
      label: "Registered",
      sortable: true,
    },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        { label: "View Profile", icon: MdOpenInNew, onClick: () => router.push(`/admin/users/${row.accountId}`) },
        { label: "Edit", icon: MdEdit, onClick: () => setEditTarget(row) },
        { label: "Soft Delete", icon: MdBlock, variant: "danger", onClick: () => setDeleteTarget(row) },
      ],
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="Manage all registered user accounts"
        badge={`${users.length} accounts`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <AdminTable
        columns={COLUMNS}
        data={users}
        loading={loading}
        onRowClick={(row) => router.push(`/admin/users/${row.accountId}`)}
        emptyMessage="No users found"
        pageSize={10}
      />

      <UserEditDialog isOpen={!!editTarget} onClose={() => setEditTarget(null)} user={editTarget} onSave={handleEdit} />
      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleSoftDelete}
        title="Soft Delete User"
        message={`Mark "${deleteTarget?.fullName}"'s account as Deleted? They will lose access but data is retained.`}
        confirmLabel="Mark Deleted"
        confirmVariant="warning"
        isLoading={deleting}
      />
    </div>
  );
}
