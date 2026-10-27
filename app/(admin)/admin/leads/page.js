"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { MdOpenInNew, MdRefresh } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import InquiryDetailPanel from "@/components/admin/leads/InquiryDetailPanel";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import Select from "@/components/ui/Select";

const ALL_STATUSES = ["New", "Contacted", "Closed"];
const NOTE_REQUIRED_STATUSES = ["Contacted", "Closed"];
const USER_TYPES = ["buyer", "tenant", "agent", "investor", "other"];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailLead, setDetailLead] = useState(null);
  const [statusModal, setStatusModal] = useState(null); // { row, status }
  const [statusNote, setStatusNote] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inquiries", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setLeads(json.data || []);
      } else {
        toast.error("Failed to load leads: " + (json.error || "Unknown error"));
      }
    } catch (err) {
      toast.error("Network error loading leads");
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

  const patchLead = async (id, patch) => {
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const json = await res.json();
      if (json.success) {
        // Update local state optimistically
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
        );
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
      label: "Inquiry ID",
      primary: true,
      render: (v) => <span className="font-mono text-xs text-[#9ca3af]">{v}</span>,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-[#1a1a2e]">{v}</p>
          <AdminPhoneCell value={row.phone} className="text-xs text-[#9ca3af]" />
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (v) => (
        <span className="text-xs text-[#374151]">{v || "—"}</span>
      ),
    },
    {
      key: "userType",
      label: "User Type",
      sortable: true,
      type: "status",
      filterOptions: USER_TYPES,
      render: (v) => (
        <span className="capitalize text-sm text-[#374151]">{v || "—"}</span>
      ),
    },
    {
      key: "source",
      label: "Source",
      sortable: true,
      render: (v) => <span className="text-xs text-[#374151]">{v || "—"}</span>,
    },
    {
      key: "propertyTitle",
      label: "Property / Interest",
      sortable: true,
      render: (v) => (
        <span className="text-sm text-[#374151] line-clamp-1 max-w-[180px] block">
          {v || "—"}
        </span>
      ),
    },
    {
      key: "message",
      label: "Message",
      render: (v) => (
        <span className="text-xs text-[#9ca3af] max-w-[180px] block truncate">
          {v || "—"}
        </span>
      ),
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
        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={row.status || "New"}
            onChange={async (e) => {
              const newStatus = e.target.value;
              if (NOTE_REQUIRED_STATUSES.includes(newStatus)) {
                setStatusNote("");
                setStatusModal({ row, status: newStatus });
                return;
              }
              const ok = await patchLead(row.id, { status: newStatus });
              if (ok) toast.success(`Status updated to ${newStatus}`);
            }}
            className="h-8 rounded-lg border border-[#e8e0d5] bg-white px-2 text-xs text-[#374151] outline-none focus:border-[#f0b429] cursor-pointer max-w-[140px]"
            options={ALL_STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </div>
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
          onClick: () => setDetailLead(row),
        },
      ],
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Leads"
        description="All contact enquiries submitted through the website forms"
        badge={`${leads.length} total`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <AdminTable
        columns={COLUMNS}
        data={leads}
        loading={loading}
        onRowClick={(row) => setDetailLead(row)}
        emptyMessage="No leads yet — form submissions will appear here"
        pageSize={15}
        searchKeys={["name", "phone", "email", "source", "propertyTitle", "userType", "message"]}
      />

      <InquiryDetailPanel
        isOpen={!!detailLead}
        onClose={() => setDetailLead(null)}
        lead={detailLead}
      />

      <AdminDialog
        isOpen={!!statusModal}
        onClose={() => setStatusModal(null)}
        title={`Mark as ${statusModal?.status}`}
        description="Add a note for this status change"
        footer={
          <>
            <button
              onClick={() => setStatusModal(null)}
              className="h-10 rounded-lg border border-[#e8e0d5] px-4 text-sm text-[#374151] transition hover:bg-[#faf8f5]"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                const { row, status } = statusModal;
                const ok = await patchLead(row.id, { status, statusNote });
                if (ok) toast.success(`Status updated to ${status}`);
                setStatusModal(null);
              }}
              className="h-10 rounded-lg bg-[#f0b429] px-4 text-sm font-medium text-[#1a1a2e] transition hover:bg-[#d99e1f]"
            >
              Save
            </button>
          </>
        }
      >
        <textarea
          value={statusNote}
          onChange={(e) => setStatusNote(e.target.value)}
          placeholder="Enter a message..."
          rows={4}
          className="w-full rounded-lg border border-[#e8e0d5] bg-white px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#f0b429]"
        />
      </AdminDialog>
    </div>
  );
}
