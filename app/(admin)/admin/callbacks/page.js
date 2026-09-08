"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { MdCheckCircle, MdEdit } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import CallbackEditDialog from "@/components/admin/callbacks/CallbackEditDialog";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection } from "@/lib/adminStorage";

const STATUSES = ["Pending", "In Progress", "Handled"];

export default function AdminCallbacksPage() {
  const [callbacks, setCallbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const load = useCallback(() => setCallbacks(readCollection(ADMIN_KEYS.callbacks) || []), []);
  useEffect(() => { load(); setLoading(false); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 500));
    load();
    setRefreshing(false);
  };

  const patch = async (id, data) => {
    try {
      const res = await adminAxios.patch(`/admin/callbacks/${id}`, { ...data, id });
      setCallbacks(res.data.data);
      return true;
    } catch { toast.error("Operation failed"); return false; }
  };

  const handleMarkHandled = async (row) => {
    const ok = await patch(row.id, { status: "Handled" });
    if (ok) toast.success("Callback marked as handled");
  };

  const handleEdit = async (updated) => {
    const ok = await patch(updated.id, { assignedTo: updated.assignedTo, adminNotes: updated.adminNotes, status: updated.status || "In Progress" });
    if (ok) toast.success("Callback updated");
  };

  const COLUMNS = [
    {
      key: "id",
      label: "Request ID",
      render: (v) => <span className="font-mono text-xs text-[#9ca3af]">{v}</span>,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      primary: true,
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-[#1a1a2e]">{v}</p>
          <p className="text-xs text-[#9ca3af]">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (v) => <span className="text-xs text-[#374151]">{v}</span>,
    },
    {
      key: "topic",
      label: "Topic",
      sortable: true,
      render: (v) => <span className="text-sm text-[#374151] max-w-[160px] block truncate">{v}</span>,
    },
    {
      key: "message",
      label: "Message",
      render: (v) => <span className="text-xs text-[#9ca3af] max-w-[160px] block truncate">{v}</span>,
    },
    { key: "date", label: "Date", sortable: true },
    {
      key: "status",
      label: "Status",
      type: "status",
      sortable: true,
      filterOptions: STATUSES,
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span>,
    },
    {
      key: "adminNotes",
      label: "Notes",
      render: (v) => <span className="text-xs text-[#9ca3af] max-w-[140px] block truncate">{v || "—"}</span>,
    },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        {
          label: "Mark Handled",
          icon: MdCheckCircle,
          onClick: () => handleMarkHandled(row),
        },
        {
          label: "Edit",
          icon: MdEdit,
          onClick: () => setEditTarget(row),
        },
      ],
    },
  ];

  const pendingCount = callbacks.filter((c) => c.status === "Pending").length;

  return (
    <div>
      <AdminPageHeader
        title="Callback Requests"
        description="Manage all callback requests submitted by visitors"
        badge={pendingCount > 0 ? `${pendingCount} pending` : `${callbacks.length} total`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <AdminTable
        columns={COLUMNS}
        data={callbacks}
        loading={loading}
        emptyMessage="No callback requests found"
        pageSize={10}
        searchKeys={["name", "phone", "email", "topic"]}
      />

      <CallbackEditDialog
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        callback={editTarget}
        onSave={handleEdit}
      />
    </div>
  );
}
