"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { MdCheckCircle, MdEdit, MdBlock } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import VideoModerationDialog from "@/components/admin/freelancer-cp/VideoModerationDialog";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection } from "@/lib/adminStorage";
import { adminSelectClass } from "@/components/admin/ui/AdminFormField";

const TABS = [
  { key: "freelancerLeads", label: "Freelancer Leads" },
  { key: "freelancerProps", label: "Freelancer Properties" },
  { key: "cpNetwork", label: "CP Network" },
  { key: "cpLeads", label: "CP Leads" },
  { key: "campaignVideos", label: "Campaign Videos" },
  { key: "commissions", label: "Commissions" },
];

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Site Visit", "Converted", "Lost"];
const CP_LEAD_STATUSES = ["Pending Verification", "Verified", "Assigned", "Site Visit Scheduled", "Site Visit Completed", "Converted", "Lost"];
const CP_TYPES = ["digital", "field", "company"];
const PROP_STATUSES = ["Pending Review", "Live", "Rejected"];
const COMM_STATUSES = ["Pending", "Approved", "On Hold"];
const VIDEO_STATUSES = ["Pending Review", "Approved", "Suggested Edit"];

export default function FreelancerCPPage() {
  const [tab, setTab] = useState("freelancerLeads");
  const [data, setData] = useState({ freelancerLeads: [], freelancerProps: [], cpNetwork: [], cpLeads: [], campaignVideos: [], commissions: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [videoTarget, setVideoTarget] = useState(null);
  const [fieldCPs, setFieldCPs] = useState([]);

  const load = useCallback(() => {
    const fl = readCollection(ADMIN_KEYS.freelancerLeads) || [];
    const fp = readCollection(ADMIN_KEYS.freelancerProperties) || [];
    const cpn = readCollection(ADMIN_KEYS.cpNetwork) || [];
    const cpl = readCollection(ADMIN_KEYS.cpLeads) || [];
    const cv = readCollection(ADMIN_KEYS.campaignVideos) || [];
    const comm = readCollection(ADMIN_KEYS.commissions) || [];
    setData({ freelancerLeads: fl, freelancerProps: fp, cpNetwork: cpn, cpLeads: cpl, campaignVideos: cv, commissions: comm });
    setFieldCPs(cpn.filter((c) => c.cpType === "field").map((c) => c.name));
  }, []);

  useEffect(() => { load(); setLoading(false); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 500));
    load();
    setRefreshing(false);
  };

  const patchItem = async (collection, id, patch, setKey) => {
    try {
      const res = await adminAxios.patch(`/admin/${collection}/${id}`, { ...patch, id });
      setData((prev) => ({ ...prev, [setKey]: res.data.data }));
      return true;
    } catch { toast.error("Operation failed"); return false; }
  };

  // Freelancer leads columns
  const FL_COLUMNS = [
    { key: "id", label: "Lead ID", primary: true, render: (v) => <span className="font-mono text-xs text-[#9ca3af]">{v}</span> },
    { key: "customer", label: "Customer", sortable: true },
    { key: "phone", label: "Phone" },
    { key: "project", label: "Project", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "status", label: "Status", type: "status", sortable: true, filterOptions: LEAD_STATUSES },
    { key: "commission", label: "Commission" },
    {
      key: "statusChange",
      label: "Change Status",
      searchable: false,
      render: (_, row) => (
        <select
          value={row.status}
          onClick={(e) => e.stopPropagation()}
          onChange={async (e) => {
            const ok = await patchItem("freelancer-leads", row.id, { status: e.target.value }, "freelancerLeads");
            if (ok) toast.success(`Lead status updated to ${e.target.value}`);
          }}
          className="h-8 rounded-lg border border-[#e8e0d5] bg-white px-2 text-xs text-[#374151] outline-none focus:border-[#f0b429] cursor-pointer"
        >
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
  ];

  // Freelancer properties columns
  const FP_COLUMNS = [
    { key: "id", label: "ID", render: (v) => <span className="font-mono text-xs text-[#9ca3af]">{v}</span> },
    { key: "title", label: "Title", sortable: true, primary: true },
    { key: "city", label: "City", sortable: true },
    { key: "price", label: "Price" },
    { key: "status", label: "Status", type: "status", filterOptions: PROP_STATUSES },
    {
      key: "statusChange",
      label: "Change Status",
      searchable: false,
      render: (_, row) => (
        <select
          value={row.status}
          onClick={(e) => e.stopPropagation()}
          onChange={async (e) => {
            const ok = await patchItem("freelancer-properties", row.id, { status: e.target.value }, "freelancerProps");
            if (ok) toast.success(`Property status changed to ${e.target.value}`);
          }}
          className="h-8 rounded-lg border border-[#e8e0d5] bg-white px-2 text-xs outline-none focus:border-[#f0b429] cursor-pointer"
        >
          {PROP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
  ];

  // CP Network columns
  const CPN_COLUMNS = [
    { key: "id", label: "CP ID", render: (v) => <span className="font-mono text-xs text-[#9ca3af]">{v}</span> },
    { key: "name", label: "Name", sortable: true, primary: true },
    { key: "cpType", label: "CP Type", type: "status", filterOptions: CP_TYPES },
    { key: "leadsSubmitted", label: "Leads", sortable: true },
    { key: "siteVisits", label: "Visits", sortable: true },
    { key: "dealsClosed", label: "Deals", sortable: true },
    { key: "status", label: "Status", type: "status", filterOptions: ["Active", "Suspended"] },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        {
          label: row.status === "Active" ? "Suspend" : "Reactivate",
          icon: MdBlock,
          variant: row.status === "Active" ? "danger" : "default",
          onClick: async () => {
            const newStatus = row.status === "Active" ? "Suspended" : "Active";
            const ok = await patchItem("cp-network", row.id, { status: newStatus }, "cpNetwork");
            if (ok) toast.success(`CP status changed to ${newStatus}`);
          },
        },
      ],
    },
  ];

  // CP Leads columns
  const CPL_COLUMNS = [
    { key: "id", label: "Lead ID", render: (v) => <span className="font-mono text-xs text-[#9ca3af]">{v}</span> },
    { key: "customer", label: "Customer", sortable: true, primary: true },
    { key: "project", label: "Project", sortable: true },
    { key: "source", label: "Source" },
    {
      key: "submittedBy",
      label: "Submitted By",
      render: (_, row) => (
        <div>
          <p className="text-xs font-medium text-[#374151]">{row.submittedBy?.name || "—"}</p>
          <AdminStatusBadge status={row.submittedBy?.cpType} />
        </div>
      ),
    },
    { key: "status", label: "Status", type: "status", filterOptions: CP_LEAD_STATUSES },
    { key: "assignedTo", label: "Assigned To", render: (v) => <span className="text-sm">{v || "—"}</span> },
    {
      key: "statusChange",
      label: "Pipeline",
      searchable: false,
      render: (_, row) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <select
            value={row.status}
            onChange={async (e) => {
              const ok = await patchItem("cp-leads", row.id, { status: e.target.value }, "cpLeads");
              if (ok) toast.success(`Lead status updated to ${e.target.value}`);
            }}
            className="h-8 rounded-lg border border-[#e8e0d5] bg-white px-1.5 text-xs outline-none focus:border-[#f0b429] cursor-pointer"
          >
            {CP_LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {fieldCPs.length > 0 && (
            <select
              value={row.assignedTo || ""}
              onChange={async (e) => {
                const ok = await patchItem("cp-leads", row.id, { assignedTo: e.target.value, status: e.target.value ? "Assigned" : row.status }, "cpLeads");
                if (ok) toast.success(`Lead assigned to ${e.target.value}`);
              }}
              className="h-8 rounded-lg border border-[#e8e0d5] bg-white px-1.5 text-xs outline-none focus:border-[#f0b429] cursor-pointer"
            >
              <option value="">Assign to…</option>
              {fieldCPs.map((cp) => <option key={cp} value={cp}>{cp}</option>)}
            </select>
          )}
        </div>
      ),
    },
  ];

  // Campaign videos columns
  const CV_COLUMNS = [
    { key: "id", label: "ID", render: (v) => <span className="font-mono text-xs text-[#9ca3af]">{v}</span> },
    { key: "partnerName", label: "Partner", sortable: true, primary: true },
    { key: "project", label: "Project", sortable: true },
    { key: "videoName", label: "Video" },
    { key: "status", label: "Status", type: "status", filterOptions: VIDEO_STATUSES },
    { key: "note", label: "Note", render: (v) => <span className="text-xs text-[#9ca3af] max-w-[140px] block truncate">{v || "—"}</span> },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        {
          label: "Approve",
          icon: MdCheckCircle,
          onClick: async () => {
            const ok = await patchItem("campaign-videos", row.id, { status: "Approved", note: "" }, "campaignVideos");
            if (ok) toast.success("Video approved");
          },
        },
        {
          label: "Suggest Edit",
          icon: MdEdit,
          onClick: () => setVideoTarget(row),
        },
      ],
    },
  ];

  // Commissions columns
  const COMM_COLUMNS = [
    { key: "leadId", label: "Lead ID", render: (v) => <span className="font-mono text-xs text-[#9ca3af]">{v}</span> },
    { key: "customer", label: "Customer", sortable: true, primary: true },
    { key: "project", label: "Project", sortable: true },
    { key: "amount", label: "Amount", render: (v) => <span className="text-sm font-semibold text-[#d97706]">{v}</span> },
    { key: "source", label: "Source", filterOptions: ["CP", "Broker"] },
    { key: "approvalStatus", label: "Status", type: "status", filterOptions: COMM_STATUSES },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        {
          label: "Approve",
          icon: MdCheckCircle,
          onClick: async () => {
            const ok = await patchItem("commissions", row.leadId, { approvalStatus: "Approved", id: row.leadId }, "commissions");
            if (ok) toast.success("Commission approved");
          },
        },
        {
          label: "Put On Hold",
          icon: MdBlock,
          onClick: async () => {
            const ok = await patchItem("commissions", row.leadId, { approvalStatus: "On Hold", id: row.leadId }, "commissions");
            if (ok) toast.success("Commission put on hold");
          },
        },
      ],
    },
  ];

  const tabContent = {
    freelancerLeads: { columns: FL_COLUMNS, data: data.freelancerLeads, key: "freelancerLeads" },
    freelancerProps: { columns: FP_COLUMNS, data: data.freelancerProps, key: "freelancerProps" },
    cpNetwork: { columns: CPN_COLUMNS, data: data.cpNetwork, key: "cpNetwork" },
    cpLeads: { columns: CPL_COLUMNS, data: data.cpLeads, key: "cpLeads" },
    campaignVideos: { columns: CV_COLUMNS, data: data.campaignVideos, key: "campaignVideos" },
    commissions: { columns: COMM_COLUMNS, data: data.commissions, key: "commissions" },
  };

  const current = tabContent[tab];

  return (
    <div>
      <AdminPageHeader
        title="Freelancer & CP Management"
        description="Manage freelancer leads, channel partners, campaign videos, and commissions"
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      {/* Tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-[#e8e0d5] bg-white p-1 gold-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition ${
              tab === t.key ? "bg-[#fff8e1] text-[#d97706]" : "text-[#6b7280] hover:bg-[#faf8f5] hover:text-[#1a1a2e]"
            }`}
          >
            {t.label}
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${tab === t.key ? "bg-[#f0b429]/20 text-[#d97706]" : "bg-[#f0ebe3] text-[#9ca3af]"}`}>
              {tabContent[t.key]?.data?.length || 0}
            </span>
          </button>
        ))}
      </div>

      <AdminTable
        columns={current.columns}
        data={current.data}
        loading={loading}
        emptyMessage="No records found"
        pageSize={10}
      />

      <VideoModerationDialog
        isOpen={!!videoTarget}
        onClose={() => setVideoTarget(null)}
        video={videoTarget}
        onSave={async (updated) => {
          const ok = await patchItem("campaign-videos", updated.id, { status: updated.status, note: updated.note }, "campaignVideos");
          if (ok) setVideoTarget(null);
        }}
      />
    </div>
  );
}
