"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { MdOpenInNew } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import HelpdeskDetailPanel from "@/components/admin/helpdesk/HelpdeskDetailPanel";

const ALL_STATUSES = ["Pending", "In Progress", "Handled"];

export default function AdminHelpdeskPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailTicket, setDetailTicket] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/helpdesk", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setTickets(json.data || []);
      } else {
        toast.error("Failed to load tickets: " + (json.error || "Unknown error"));
      }
    } catch {
      toast.error("Network error loading tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const patchTicket = async (id, patch) => {
    try {
      const res = await fetch("/api/admin/helpdesk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const json = await res.json();
      if (json.success) {
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
        return true;
      }
      toast.error(json.error || "Update failed");
      return false;
    } catch {
      toast.error("Network error");
      return false;
    }
  };

  const COLUMNS = [
    {
      key: "id",
      label: "Ticket ID",
      primary: true,
      render: (v) => <span className="font-mono text-xs text-[#9ca3af]">{v}</span>,
    },
    {
      key: "userName",
      label: "User",
      sortable: true,
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-[#1a1a2e]">{v || "—"}</p>
          <AdminPhoneCell value={row.userPhone} className="text-xs text-[#9ca3af]" />
        </div>
      ),
    },
    {
      key: "accountType",
      label: "Account Type",
      sortable: true,
      render: (v) => <span className="capitalize text-sm text-[#374151]">{v || "—"}</span>,
    },
    {
      key: "propertyId",
      label: "Property",
      sortable: true,
      render: (v, row) => (
        <div>
          <p className="font-mono text-xs text-[#374151]">{v || "—"}</p>
          {row.propertyTitle && (
            <p className="text-xs text-[#9ca3af] max-w-[160px] truncate">{row.propertyTitle}</p>
          )}
        </div>
      ),
    },
    {
      key: "message",
      label: "Message",
      render: (v) => <span className="text-xs text-[#9ca3af] max-w-[200px] block truncate">{v}</span>,
    },
    { key: "date", label: "Date", sortable: true },
    {
      key: "status",
      label: "Status",
      type: "status",
      sortable: true,
      filterOptions: ALL_STATUSES,
    },
    {
      key: "pipeline",
      label: "Change Status",
      searchable: false,
      render: (_, row) => (
        <select
          value={row.status || "Pending"}
          onClick={(e) => e.stopPropagation()}
          onChange={async (e) => {
            const ok = await patchTicket(row.id, { status: e.target.value });
            if (ok) toast.success(`Status updated to ${e.target.value}`);
          }}
          className="h-8 rounded-lg border border-[#e8e0d5] bg-white px-2 text-xs text-[#374151] outline-none focus:border-[#f0b429] cursor-pointer max-w-[140px]"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        {
          label: "View Details",
          icon: MdOpenInNew,
          onClick: () => setDetailTicket(row),
        },
      ],
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Helpdesk"
        description="Change requests users send from the Edit Listing page for fields they can't self-edit"
        badge={`${tickets.length} total`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <AdminTable
        columns={COLUMNS}
        data={tickets}
        loading={loading}
        onRowClick={(row) => setDetailTicket(row)}
        emptyMessage="No helpdesk requests yet"
        pageSize={15}
        searchKeys={["id", "userName", "userPhone", "userEmail", "propertyId", "propertyTitle", "message"]}
      />

      <HelpdeskDetailPanel
        isOpen={!!detailTicket}
        onClose={() => setDetailTicket(null)}
        ticket={detailTicket}
      />
    </div>
  );
}
