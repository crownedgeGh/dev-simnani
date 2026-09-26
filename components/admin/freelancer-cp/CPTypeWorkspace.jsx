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
  MdSend,
  MdCalendarToday,
  MdEventAvailable,
} from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminKpiCard from "@/components/admin/ui/AdminKpiCard";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";
import CPPartnerFormDialog from "@/components/admin/freelancer-cp/CPPartnerFormDialog";
import VideoModerationDialog from "@/components/admin/freelancer-cp/VideoModerationDialog";
import AssignPropertyDialog from "@/components/admin/freelancer-cp/AssignPropertyDialog";
import SiteVisitLogDialog from "@/components/admin/freelancer-cp/SiteVisitLogDialog";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection, addCpAssignment, addCpSiteVisit, updateCpSiteVisit } from "@/lib/adminStorage";

const CP_LEAD_STATUSES = ["Pending Verification", "Verified", "Assigned", "Site Visit Scheduled", "Site Visit Completed", "Converted", "Lost"];
const COMM_STATUSES = ["Pending", "Approved", "On Hold"];
const VIDEO_STATUSES = ["Pending Review", "Approved", "Suggested Edit"];
const ACTIVE_LEAD_STATUSES = ["Assigned", "Site Visit Scheduled", "Site Visit Completed"];
const CHILD_LEVEL_FOR_TYPE = { field: "company-to-field", digital: "company-to-digital" };

export default function CPTypeWorkspace({
  cpType,
  leadCpTypes,
  routingStage,
  title,
  description,
  icon: Icon,
  accentClasses,
  showCampaignVideos = true,
  showNetworkTab = true,
  showAddPartner = true,
  showInvitationCodes = true,
  showCommissions = true,
  showAssignedProjects = false,
  assignmentLevel,
  delegateToTypes,
  showSiteVisits = false,
  emptyMessage = "No records found",
}) {
  const effectiveLeadCpTypes = useMemo(
    () => leadCpTypes || (cpType ? [cpType] : []),
    [leadCpTypes, cpType]
  );
  const [tab, setTab] = useState(showNetworkTab ? "network" : "leads");
  const [data, setData] = useState({
    cpNetwork: [],
    cpLeads: [],
    campaignVideos: [],
    commissions: [],
    invitationCodes: [],
    cpAssignments: [],
    cpSiteVisits: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [videoTarget, setVideoTarget] = useState(null);
  const [partnerFormTarget, setPartnerFormTarget] = useState(undefined); // undefined = closed, null = create, object = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [fieldCPs, setFieldCPs] = useState([]);
  const [delegateTarget, setDelegateTarget] = useState(null); // assignment row being delegated onward
  const [visitDialog, setVisitDialog] = useState(null); // { mode, context, visit }

  const load = useCallback(() => {
    const cpn = readCollection(ADMIN_KEYS.cpNetwork) || [];
    const cpl = readCollection(ADMIN_KEYS.cpLeads) || [];
    const cv = readCollection(ADMIN_KEYS.campaignVideos) || [];
    const comm = readCollection(ADMIN_KEYS.commissions) || [];
    const inv = readCollection(ADMIN_KEYS.invitationCodes) || [];
    const asg = readCollection(ADMIN_KEYS.cpAssignments) || [];
    const visits = readCollection(ADMIN_KEYS.cpSiteVisits) || [];
    setData({ cpNetwork: cpn, cpLeads: cpl, campaignVideos: cv, commissions: comm, invitationCodes: inv, cpAssignments: asg, cpSiteVisits: visits });
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
  const network = useMemo(
    () => (cpType ? data.cpNetwork.filter((n) => n.cpType === cpType) : []),
    [data.cpNetwork, cpType]
  );
  // Every lead is owned by exactly one routing stage at a time — this is the
  // single source of truth for lead visibility, decoupled from who originally
  // submitted it. Leads missing the field (shouldn't happen post-migration,
  // but defensively) default to the Head CP inbox rather than disappearing.
  const leads = useMemo(
    () => (routingStage ? data.cpLeads.filter((l) => (l.routingStage || "head-cp") === routingStage) : []),
    [data.cpLeads, routingStage]
  );
  const companyPartners = useMemo(
    () => data.cpNetwork.filter((n) => n.cpType === "company" && n.status !== "Suspended").map((n) => ({ id: n.id, name: n.name, cpType: "company" })),
    [data.cpNetwork]
  );
  const delegatePartners = useMemo(
    () =>
      (delegateToTypes || [])
        .flatMap((t) => data.cpNetwork.filter((n) => n.cpType === t && n.status !== "Suspended"))
        .map((n) => ({ id: n.id, name: n.name, cpType: n.cpType })),
    [data.cpNetwork, delegateToTypes]
  );
  const assignedProjects = useMemo(
    () => (assignmentLevel ? data.cpAssignments.filter((a) => a.level === assignmentLevel) : []),
    [data.cpAssignments, assignmentLevel]
  );
  const invitationCodes = useMemo(
    () => (cpType ? data.invitationCodes.filter((c) => c.cpType === cpType) : []),
    [data.invitationCodes, cpType]
  );

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
    () => data.commissions.filter((c) => c.source === "CP" && effectiveLeadCpTypes.includes(leadCpTypeById[c.leadId])),
    [data.commissions, effectiveLeadCpTypes, leadCpTypeById]
  );
  const campaignVideos = useMemo(
    () => (cpType ? data.campaignVideos.filter((v) => partnerCpTypeByName[v.partnerName] === cpType) : []),
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
    routingStage === "head-cp"
      ? { title: "Pending Forward", value: kpis.totalLeads, subtitle: "Awaiting Forward to Company CP", icon: MdSend, color: "gold" }
      : { title: "CP Leads", value: kpis.totalLeads, subtitle: `${kpis.pendingVerification} pending verification`, icon: MdLeaderboard, color: "gold" },
    { title: "Active Assignments", value: kpis.activeAssignments, subtitle: "Assigned or in site-visit stage", icon: MdAssignmentInd, color: "blue" },
    ...(showNetworkTab
      ? [{ title: "Network Partners", value: kpis.networkPartners, subtitle: `${kpis.activePartners} active`, icon: MdGroups, color: "purple" },
         { title: "Deals Closed", value: kpis.dealsClosed, subtitle: `${kpis.siteVisits} site visits logged`, icon: MdCheckCircle, color: "green" }]
      : []),
    ...(showCommissions
      ? [{ title: "Pending Commissions", value: kpis.pendingCommissions, subtitle: `${kpis.approvedCommissions} approved`, icon: MdAttachMoney, color: "orange" }]
      : []),
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
              const nextStatus = e.target.value;
              const ok = await patchItem("cp-leads", row.id, { status: nextStatus }, "cpLeads");
              if (ok) {
                toast.success(`Lead status updated to ${nextStatus}`);
                if (nextStatus === "Converted") {
                  const existing = data.commissions.find((c) => c.leadId === row.id);
                  if (!existing) {
                    const res = await adminAxios.post("/admin/commissions", {
                      id: row.id,
                      leadId: row.id,
                      customer: row.customer,
                      project: row.project,
                      amount: "Pending",
                      approvalStatus: "Pending",
                      source: "CP",
                      type: "channel-partner",
                    });
                    setData((prev) => ({ ...prev, commissions: res.data.data }));
                    toast.success("Commission record created for this conversion");
                  }
                }
              }
            }}
            className="h-8 rounded-lg border border-[#e8e0d5] bg-white px-1.5 text-xs outline-none focus:border-[#f0b429] cursor-pointer"
          >
            {CP_LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {routingStage === "head-cp" && (
            <select
              value=""
              onChange={async (e) => {
                if (!e.target.value) return;
                const ok = await patchItem("cp-leads", row.id, { routingStage: "company-cp", assignedTo: e.target.value }, "cpLeads");
                if (ok) toast.success(`Lead forwarded to ${e.target.value}`);
              }}
              disabled={companyPartners.length === 0}
              className="h-8 rounded-lg border border-[#e8e0d5] bg-white px-1.5 text-xs outline-none focus:border-[#f0b429] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {companyPartners.length === 0 ? "No Company CP yet" : "Forward to Company CP…"}
              </option>
              {companyPartners.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          )}

          {routingStage === "company-cp" && (
            <select
              value=""
              onChange={async (e) => {
                if (!e.target.value) return;
                const [nextCpType, ...rest] = e.target.value.split("::");
                const name = rest.join("::");
                const ok = await patchItem(
                  "cp-leads",
                  row.id,
                  { routingStage: `${nextCpType}-cp`, assignedTo: name, status: "Assigned" },
                  "cpLeads"
                );
                if (ok) toast.success(`Lead delegated to ${name}`);
              }}
              disabled={fieldCPs.length === 0 && delegatePartners.filter((p) => p.cpType === "digital").length === 0}
              className="h-8 rounded-lg border border-[#e8e0d5] bg-white px-1.5 text-xs outline-none focus:border-[#f0b429] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Assign to…</option>
              {data.cpNetwork.filter((n) => n.cpType === "field").length > 0 && (
                <optgroup label="Field CP">
                  {data.cpNetwork.filter((n) => n.cpType === "field").map((p) => (
                    <option key={`field::${p.name}`} value={`field::${p.name}`}>{p.name}</option>
                  ))}
                </optgroup>
              )}
              {data.cpNetwork.filter((n) => n.cpType === "digital").length > 0 && (
                <optgroup label="Digital CP">
                  {data.cpNetwork.filter((n) => n.cpType === "digital").map((p) => (
                    <option key={`digital::${p.name}`} value={`digital::${p.name}`}>{p.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
          )}

          {routingStage === "field-cp" && showSiteVisits && !data.cpSiteVisits.some((v) => v.leadId === row.id && v.status === "Scheduled") && (
            <button
              type="button"
              onClick={() => setVisitDialog({ mode: "schedule", context: { label: row.customer, leadId: row.id } })}
              className="flex h-8 items-center gap-1 rounded-lg border border-[#e8e0d5] bg-white px-2 text-xs font-medium text-[#374151] transition hover:bg-[#faf8f5]"
            >
              <MdCalendarToday size={13} />
              Schedule Visit
            </button>
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

  const ASSIGNED_PROJECT_COLUMNS = [
    {
      key: "propertyTitle",
      label: "Property",
      primary: true,
      sortable: true,
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-[#1a1a2e]">{v}</p>
          <p className="mt-0.5 text-xs text-[#9ca3af]">{row.propertyLocation}</p>
        </div>
      ),
    },
    { key: "assignedByName", label: "Assigned By", render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span> },
    { key: "assignedToName", label: "Assigned To", sortable: true, render: (v) => <span className="text-sm font-medium text-[#374151]">{v || "—"}</span> },
    { key: "status", label: "Status", type: "status", filterOptions: ["Assigned", "In Progress", "Completed"] },
    {
      key: "actions",
      label: "",
      searchable: false,
      render: (_, row) => {
        const childLevels = (delegateToTypes || []).map((t) => CHILD_LEVEL_FOR_TYPE[t]);
        const alreadyDelegated = data.cpAssignments.some(
          (a) => a.parentAssignmentId === row.id && childLevels.includes(a.level)
        );
        return (
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            {delegateToTypes && delegateToTypes.length > 0 && (
              <button
                type="button"
                onClick={() => setDelegateTarget(row)}
                className="flex h-8 items-center gap-1 rounded-lg border border-[#e8e0d5] bg-white px-2.5 text-xs font-medium text-[#374151] transition hover:bg-[#faf8f5]"
              >
                <MdSend size={13} />
                {alreadyDelegated ? "Re-delegate" : "Delegate"}
              </button>
            )}
            {showSiteVisits && assignmentLevel === "company-to-field" && (
              <button
                type="button"
                onClick={() => setVisitDialog({ mode: "schedule", context: { label: row.propertyTitle, assignmentId: row.id } })}
                className="flex h-8 items-center gap-1 rounded-lg border border-[#e8e0d5] bg-white px-2.5 text-xs font-medium text-[#374151] transition hover:bg-[#faf8f5]"
              >
                <MdCalendarToday size={13} />
                Schedule Visit
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const SITE_VISIT_COLUMNS = [
    { key: "customer", label: "Customer", primary: true, sortable: true },
    { key: "phone", label: "Phone", render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span> },
    { key: "propertyTitle", label: "Property", render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span> },
    {
      key: "scheduledAt",
      label: "Scheduled",
      sortable: true,
      render: (v) => <span className="text-xs text-[#6b7280]">{v ? new Date(v).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}</span>,
    },
    { key: "status", label: "Status", type: "status", filterOptions: ["Scheduled", "Completed", "No-show"] },
    { key: "notes", label: "Notes", render: (v) => <span className="max-w-[160px] block truncate text-xs text-[#6b7280]">{v || "—"}</span> },
    {
      key: "actions",
      label: "",
      searchable: false,
      render: (_, row) =>
        row.status === "Scheduled" ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setVisitDialog({ mode: "outcome", visit: row, context: { label: row.customer } }); }}
            className="flex h-8 items-center gap-1 rounded-lg border border-[#e8e0d5] bg-white px-2.5 text-xs font-medium text-[#374151] transition hover:bg-[#faf8f5]"
          >
            <MdEventAvailable size={13} />
            Log Outcome
          </button>
        ) : (
          <span className="text-xs text-[#9ca3af]">—</span>
        ),
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
    { key: "city", label: "City", sortable: true, render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span> },
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
    ...(showNetworkTab ? [{ key: "network", label: "Network", count: network.length }] : []),
    ...(showAssignedProjects ? [{ key: "assignedProjects", label: "Assigned Projects", count: assignedProjects.length }] : []),
    { key: "leads", label: "Leads", count: leads.length },
    ...(showSiteVisits ? [{ key: "siteVisits", label: "Site Visits", count: data.cpSiteVisits.length }] : []),
    ...(showCampaignVideos ? [{ key: "campaignVideos", label: "Campaign Videos", count: campaignVideos.length }] : []),
    ...(showCommissions ? [{ key: "commissions", label: "Commissions", count: commissions.length }] : []),
    ...(showInvitationCodes ? [{ key: "invitationCodes", label: "Invitation Codes", count: invitationCodes.length }] : []),
  ];

  const tabContent = {
    network: { columns: NETWORK_COLUMNS, data: network },
    assignedProjects: { columns: ASSIGNED_PROJECT_COLUMNS, data: assignedProjects },
    leads: { columns: LEAD_COLUMNS, data: leads },
    siteVisits: { columns: SITE_VISIT_COLUMNS, data: data.cpSiteVisits },
    campaignVideos: { columns: VIDEO_COLUMNS, data: campaignVideos },
    commissions: { columns: COMM_COLUMNS, data: commissions },
    invitationCodes: { columns: INVITATION_COLUMNS, data: invitationCodes },
  };
  const current = tabContent[tab] || tabContent.leads;

  return (
    <div>
      <Link href="/admin/freelancer-cp" className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#9ca3af] transition hover:text-[#d97706]">
        <MdArrowBack size={14} /> Back to Freelancer &amp; CP Overview
      </Link>

      <AdminPageHeader
        title={title}
        description={description}
        badge={showNetworkTab ? `${network.length} partners` : `${leads.length} leads`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        actions={
          tab === "siteVisits" && showSiteVisits ? (
            <button
              onClick={() => setVisitDialog({ mode: "schedule", context: null })}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-[#f0b429] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d97706]"
            >
              <MdCalendarToday size={16} />
              <span>Schedule Site Visit</span>
            </button>
          ) : showAddPartner ? (
            <button
              onClick={() => setPartnerFormTarget(null)}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-[#f0b429] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d97706]"
            >
              <MdAdd size={16} />
              <span>Add Partner</span>
            </button>
          ) : undefined
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
        emptyMessage={emptyMessage}
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

      <AssignPropertyDialog
        isOpen={!!delegateTarget}
        onClose={() => setDelegateTarget(null)}
        title="Delegate Project"
        propertyTitle={delegateTarget?.propertyTitle}
        partners={delegatePartners}
        onAssign={async (partner) => {
          const child = addCpAssignment({
            propertyId: delegateTarget.propertyId,
            propertyTitle: delegateTarget.propertyTitle,
            propertyImage: delegateTarget.propertyImage,
            propertyLocation: delegateTarget.propertyLocation,
            level: CHILD_LEVEL_FOR_TYPE[partner.cpType],
            assignedByCpType: delegateTarget.assignedToCpType,
            assignedByName: delegateTarget.assignedToName,
            assignedToCpType: partner.cpType,
            assignedToName: partner.name,
            parentAssignmentId: delegateTarget.id,
          });
          setData((prev) => ({ ...prev, cpAssignments: [child, ...prev.cpAssignments] }));
          toast.success(`Delegated to ${partner.name}`);
        }}
      />

      <SiteVisitLogDialog
        isOpen={!!visitDialog}
        onClose={() => setVisitDialog(null)}
        mode={visitDialog?.mode}
        context={visitDialog?.context}
        visit={visitDialog?.visit}
        onSave={async (payload) => {
          if (payload.type === "schedule") {
            const visit = addCpSiteVisit({
              customer: payload.customer,
              phone: payload.phone,
              scheduledAt: payload.scheduledAt,
              propertyTitle: visitDialog?.context?.label || "",
              assignmentId: visitDialog?.context?.assignmentId || null,
              leadId: visitDialog?.context?.leadId || null,
            });
            setData((prev) => ({ ...prev, cpSiteVisits: [visit, ...prev.cpSiteVisits] }));
          } else {
            const status = payload.outcome === "Attended" ? "Completed" : "No-show";
            const updated = updateCpSiteVisit(payload.visitId, { status, notes: payload.notes });
            setData((prev) => ({ ...prev, cpSiteVisits: updated }));
            const visit = updated.find((v) => v.id === payload.visitId);
            if (visit?.leadId) {
              const nextStatus = payload.outcome === "Attended" ? "Site Visit Completed" : "Site Visit Scheduled";
              const ok = await patchItem("cp-leads", visit.leadId, { status: nextStatus }, "cpLeads");
              if (!ok) toast.error("Visit saved, but the linked lead status could not be updated");
            }
          }
        }}
      />
    </div>
  );
}
