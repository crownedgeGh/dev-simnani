"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  MdCheckCircle,
  MdEdit,
  MdBlock,
  MdAdd,
  MdDelete,
  MdLeaderboard,
  MdAssignmentInd,
  MdGroups,
  MdAttachMoney,
  MdArrowBack,
  MdContentCopy,
} from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminKpiCard from "@/components/admin/ui/AdminKpiCard";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";
import CPPartnerFormDialog from "@/components/admin/freelancer-cp/CPPartnerFormDialog";
import VideoModerationDialog from "@/components/admin/freelancer-cp/VideoModerationDialog";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection } from "@/lib/adminStorage";

const CP_LEAD_STATUSES = ["Pending Verification", "Verified", "Assigned", "Site Visit Scheduled", "Site Visit Completed", "Converted", "Lost"];
const COMM_STATUSES = ["Pending", "Approved", "On Hold"];
const VIDEO_STATUSES = ["Pending Review", "Approved", "Suggested Edit"];
const ACTIVE_LEAD_STATUSES = ["Assigned", "Site Visit Scheduled", "Site Visit Completed"];

export default function CPTypeWorkspace({ cpType, title, description, icon: Icon, accentClasses, showCampaignVideos = true }) {
  const [tab, setTab] = useState("network");
  const [data, setData] = useState({ cpNetwork: [], cpLeads: [], campaignVideos: [], commissions: [], invitationCodes: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [videoTarget, setVideoTarget] = useState(null);
  const [partnerFormTarget, setPartnerFormTarget] = useState(undefined); // undefined = closed, null = create, object = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [fieldCPs, setFieldCPs] = useState([]);

  const load = useCallback(() => {
    const cpn = readCollection(ADMIN_KEYS.cpNetwork) || [];
    const cpl = readCollection(ADMIN_KEYS.cpLeads) || [];
    const cv = readCollection(ADMIN_KEYS.campaignVideos) || [];
    const comm = readCollection(ADMIN_KEYS.commissions) || [];
    const inv = readCollection(ADMIN_KEYS.invitationCodes) || [];
    setData({ cpNetwork: cpn, cpLeads: cpl, campaignVideos: cv, commissions: comm, invitationCodes: inv });
    setFieldCPs(cpn.filter((c) => c.cpType === "field").map((c) => c.name));
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      load();
      setLoading(false);
    });
    return () => { active = false; };
  }, [load]);

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

  // ---------------------------------------------------------------------
  // Scoped-to-this-CP-type collections
  // ---------------------------------------------------------------------
  const network = useMemo(() => data.cpNetwork.filter((n) => n.cpType === cpType), [data.cpNetwork, cpType]);
  const leads = useMemo(() => data.cpLeads.filter((l) => l.submittedBy?.cpType === cpType), [data.cpLeads, cpType]);
  const invitationCodes = useMemo(() => data.invitationCodes.filter((c) => c.cpType === cpType), [data.invitationCodes, cpType]);

  const leadCpTypeById = useMemo(() => {
    const map = {};
    data.cpLeads.forEach((l) => { map[l.id] = l.submittedBy?.cpType; });
    return map;
  }, [data.cpLeads]);
  const partnerCpTypeByName = useMemo(() => {
    const map = {};
    data.cpNetwork.forEach((n) => { map[n.name] = n.cpType; });
    return map;
  }, [data.cpNetwork]);

  const commissions = useMemo(
    () => data.commissions.filter((c) => c.source === "CP" && leadCpTypeById[c.leadId] === cpType),
    [data.commissions, cpType, leadCpTypeById]
  );
  const campaignVideos = useMemo(
    () => data.campaignVideos.filter((v) => partnerCpTypeByName[v.partnerName] === cpType),
    [data.campaignVideos, cpType, partnerCpTypeByName]
  );

  const kpis = useMemo(() => {
    const dealsClosed = network.reduce((sum, n) => sum + (n.dealsClosed || 0), 0);
    const siteVisits = network.reduce((sum, n) => sum + (n.siteVisits || 0), 0);
    return {
      totalLeads: leads.length,
      pendingVerification: leads.filter((l) => l.status === "Pending Verification").length,
      activeAssignments: leads.filter((l) => ACTIVE_LEAD_STATUSES.includes(l.status)).length,
      networkPartners: network.length,
      activePartners: network.filter((n) => n.status === "Active").length,
      dealsClosed,
      siteVisits,
      pendingCommissions: commissions.filter((c) => c.approvalStatus !== "Approved").length,
      approvedCommissions: commissions.filter((c) => c.approvalStatus === "Approved").length,
    };
  }, [leads, network, commissions]);

  const kpiCards = [
    { title: "CP Leads", value: kpis.totalLeads, subtitle: `${kpis.pendingVerification} pending verification`, icon: MdLeaderboard, color: "gold" },
    { title: "Active Assignments", value: kpis.activeAssignments, subtitle: "Assigned or in site-visit stage", icon: MdAssignmentInd, color: "blue" },
    { title: "Network Partners", value: kpis.networkPartners, subtitle: `${kpis.activePartners} active`, icon: MdGroups, color: "purple" },
    { title: "Deals Closed", value: kpis.dealsClosed, subtitle: `${kpis.siteVisits} site visits logged`, icon: MdCheckCircle, color: "green" },
    { title: "Pending Commissions", value: kpis.pendingCommissions, subtitle: `${kpis.approvedCommissions} approved`, icon: MdAttachMoney, color: "orange" },
  ];

  // ---------------------------------------------------------------------
  // CRUD handlers — CP Network partners
  // ---------------------------------------------------------------------
  const handleSavePartner = async (formData) => {
    if (partnerFormTarget) {
      // Edit — PUT replace
      const res = await adminAxios.put(`/admin/cp-network/${formData.id}`, formData);
      setData((prev) => ({ ...prev, cpNetwork: res.data.data }));
    } else {
      // Create — POST append
      const res = await adminAxios.post("/admin/cp-network", formData);
      setData((prev) => ({ ...prev, cpNetwork: res.data.data }));
    }
  };

  const handleDeletePartner = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await adminAxios.delete(`/admin/cp-network/${deleteTarget.id}`);
      setData((prev) => ({ ...prev, cpNetwork: res.data.data }));
      toast.success(`${deleteTarget.name} removed from the network`);
    } catch {
      toast.error("Failed to delete partner");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ---------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------
  const NETWORK_COLUMNS = [
    { key: "id", label: "CP ID", render: (v) => <span className="font-mono text-xs text-[#9ca3af]">{v}</span> },
    { key: "name", label: "Name", sortable: true, primary: true },
    { key: "phone", label: "Phone", render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span> },
    { key: "city", label: "City", sortable: true, render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span> },
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
        { label: "Edit", icon: MdEdit, onClick: () => setPartnerFormTarget(row) },
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
        { label: "Delete", icon: MdDelete, variant: "danger", onClick: () => setDeleteTarget(row) },
      ],
    },
  ];

  const LEAD_COLUMNS = [
    { key: "id", label: "Lead ID", render: (v) => <span className="font-mono text-xs text-[#9ca3af]">{v}</span> },
    { key: "customer", label: "Customer", sortable: true, primary: true },
    { key: "project", label: "Project", sortable: true },
    { key: "source", label: "Source" },
    {
      key: "submittedBy",
      label: "Submitted By",
      render: (_, row) => <span className="text-xs font-medium text-[#374151]">{row.submittedBy?.name || "—"}</span>,
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
          {cpType === "company" && fieldCPs.length > 0 && (
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

  const VIDEO_COLUMNS = [
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
        { label: "Suggest Edit", icon: MdEdit, onClick: () => setVideoTarget(row) },
      ],
    },
  ];

  const COMM_COLUMNS = [
    { key: "leadId", label: "Lead ID", render: (v) => <span className="font-mono text-xs text-[#9ca3af]">{v}</span> },
    { key: "customer", label: "Customer", sortable: true, primary: true },
    { key: "project", label: "Project", sortable: true },
    { key: "amount", label: "Amount", render: (v) => <span className="text-sm font-semibold text-[#d97706]">{v}</span> },
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

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Invitation code copied");
    } catch {
      toast.error("Couldn't copy — please copy manually");
    }
  };

  const INVITATION_COLUMNS = [
    {
      key: "code",
      label: "Invitation Code",
      primary: true,
      searchable: true,
      render: (v) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <span className="font-mono text-xs font-semibold text-[#d97706]">{v}</span>
          <button
            type="button"
            onClick={() => handleCopyCode(v)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#9ca3af] transition hover:bg-[#fff8e1] hover:text-[#d97706]"
            aria-label={`Copy ${v}`}
            title="Copy code"
          >
            <MdContentCopy size={14} />
          </button>
        </div>
      ),
    },
    { key: "name", label: "Name", sortable: true },
    { key: "mobile", label: "Mobile", render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span> },
    { key: "state", label: "State", sortable: true },
    { key: "address", label: "Full Address", render: (v) => <span className="max-w-[220px] block truncate text-xs text-[#6b7280]" title={v}>{v || "—"}</span> },
    {
      key: "createdAt",
      label: "Generated On",
      sortable: true,
      render: (v) => <span className="text-xs text-[#9ca3af]">{v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>,
    },
  ];

  const TABS = [
    { key: "network", label: "Network", count: network.length },
    { key: "leads", label: "Leads", count: leads.length },
    ...(showCampaignVideos ? [{ key: "campaignVideos", label: "Campaign Videos", count: campaignVideos.length }] : []),
    { key: "commissions", label: "Commissions", count: commissions.length },
    { key: "invitationCodes", label: "Invitation Codes", count: invitationCodes.length },
  ];

  const tabContent = {
    network: { columns: NETWORK_COLUMNS, data: network },
    leads: { columns: LEAD_COLUMNS, data: leads },
    campaignVideos: { columns: VIDEO_COLUMNS, data: campaignVideos },
    commissions: { columns: COMM_COLUMNS, data: commissions },
    invitationCodes: { columns: INVITATION_COLUMNS, data: invitationCodes },
  };
  const current = tabContent[tab] || tabContent.network;

  return (
    <div>
      <Link href="/admin/freelancer-cp" className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#9ca3af] transition hover:text-[#d97706]">
        <MdArrowBack size={14} /> Back to Freelancer &amp; CP Overview
      </Link>

      <AdminPageHeader
        title={title}
        description={description}
        badge={`${network.length} partners`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        actions={
          <button
            onClick={() => setPartnerFormTarget(null)}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-[#f0b429] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d97706]"
          >
            <MdAdd size={16} />
            <span>Add Partner</span>
          </button>
        }
      />

      {/* Type banner */}
      <div className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 ${accentClasses}`}>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
            <Icon size={20} />
          </div>
        )}
        <p className="text-sm font-medium">{description}</p>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#f0ebe3] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {kpiCards.map((card) => (
            <AdminKpiCard key={card.title} {...card} />
          ))}
        </div>
      )}

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
              {t.count}
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

      <CPPartnerFormDialog
        isOpen={partnerFormTarget !== undefined}
        onClose={() => setPartnerFormTarget(undefined)}
        cpType={cpType}
        partner={partnerFormTarget}
        onSave={handleSavePartner}
      />

      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeletePartner}
        title="Delete Partner"
        message={`Remove "${deleteTarget?.name}" from the ${title} network? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={deleting}
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
