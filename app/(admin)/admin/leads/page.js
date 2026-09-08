"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { MdOpenInNew } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import LeadDetailPanel from "@/components/admin/leads/LeadDetailPanel";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection } from "@/lib/adminStorage";

const ALL_STATUSES = [
  "New", "Contacted", "Qualified", "Interested",
  "Site Visit Scheduled", "Site Visit Completed", "Site Visit Done",
  "Pending Verification", "Verified", "Assigned",
  "Negotiation", "Converted", "Booked", "Lost",
];
const PORTAL_SOURCES = ["Freelancer", "CP-digital", "CP-field", "CP-company", "Employee"];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailLead, setDetailLead] = useState(null);

  const load = useCallback(() => setLeads(readCollection(ADMIN_KEYS.leads) || []), []);
  useEffect(() => { load(); setLoading(false); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 500));
    load();
    setRefreshing(false);
  };

  const patchLead = async (id, patch) => {
    try {
      const res = await adminAxios.patch(`/admin/leads/${id}`, { ...patch, id });
      setLeads(res.data.data);
      return true;
    } catch { toast.error("Operation failed"); return false; }
  };

  const COLUMNS = [
    {
      key: "id",
      label: "Lead ID",
      primary: true,
      render: (v) => <span className="font-mono text-xs text-[#9ca3af]">{v}</span>,
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-[#1a1a2e]">{v || row.name}</p>
          <p className="text-xs text-[#9ca3af]">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "property",
      label: "Project / Property",
      sortable: true,
      render: (v, row) => (
        <span className="text-sm text-[#374151] line-clamp-1">{v || row.project || "—"}</span>
      ),
    },
    { key: "source", label: "Source", sortable: true },
    {
      key: "portalSource",
      label: "Portal",
      type: "status",
      sortable: true,
      filterOptions: PORTAL_SOURCES,
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
      key: "assignedTo",
      label: "Assigned To",
      render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span>,
    },
    {
      key: "commission",
      label: "Commission",
      render: (v) => (
        <span className={`text-sm font-medium ${v && v !== "—" && v !== "Pending" ? "text-emerald-600" : "text-[#9ca3af]"}`}>
          {v || "—"}
        </span>
      ),
    },
    {
      key: "pipeline",
      label: "Change Status",
      searchable: false,
      render: (_, row) => (
        <select
          value={row.status}
          onClick={(e) => e.stopPropagation()}
          onChange={async (e) => {
            const ok = await patchLead(row.id, { status: e.target.value });
            if (ok) toast.success(`Lead status updated to ${e.target.value}`);
          }}
          className="h-8 rounded-lg border border-[#e8e0d5] bg-white px-2 text-xs text-[#374151] outline-none focus:border-[#f0b429] cursor-pointer max-w-[160px]"
        >
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        { label: "View Details", icon: MdOpenInNew, onClick: () => setDetailLead(row) },
      ],
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Leads"
        description="Unified view of all leads across freelancer, channel partner, and employee portals"
        badge={`${leads.length} total`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <AdminTable
        columns={COLUMNS}
        data={leads}
        loading={loading}
        onRowClick={(row) => setDetailLead(row)}
        emptyMessage="No leads found"
        pageSize={10}
        searchKeys={["customer", "name", "phone", "project", "property", "source", "portalSource"]}
      />

      <LeadDetailPanel
        isOpen={!!detailLead}
        onClose={() => setDetailLead(null)}
        lead={detailLead}
      />
    </div>
  );
}
