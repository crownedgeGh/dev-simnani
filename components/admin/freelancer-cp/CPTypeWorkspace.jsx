"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminKpiCard from "@/components/admin/ui/AdminKpiCard";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";
import CPPartnerFormDialog from "@/components/admin/freelancer-cp/CPPartnerFormDialog";
import VideoModerationDialog from "@/components/admin/freelancer-cp/VideoModerationDialog";
import AssignPropertyDialog from "@/components/admin/freelancer-cp/AssignPropertyDialog";
import InvitationCodeDialog from "@/components/admin/freelancer-cp/InvitationCodeDialog";

const CP_LEAD_STATUSES = ["Pending Verification", "Verified", "Assigned", "Site Visit Scheduled", "Site Visit Completed", "Converted", "Lost"];
const COMM_STATUSES = ["Pending", "Approved", "On Hold"];
const VIDEO_STATUSES = ["Pending Review", "Approved", "Suggested Edit", "Rejected"];
const ACTIVE_LEAD_STATUSES = ["Assigned", "Site Visit Scheduled", "Site Visit Completed"];
const CHILD_LEVEL_FOR_TYPE = { field: "company-to-field", digital: "company-to-digital" };
const SITE_VISIT_STATUSES = ["Scheduled", "Moving", "Visit Done", "No Show"];

async function getJSON(url) {
  const res = await fetch(url);
  const json = await res.json();
  return json.success ? json.data : [];
}

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
  const router = useRouter();
  const effectiveLeadCpTypes = useMemo(
    () => leadCpTypes || (cpType ? [cpType] : []),
    [leadCpTypes, cpType]
  );
  const [tab, setTab] = useState(showNetworkTab ? "network" : "leads");
  const [data, setData] = useState({
    cpLeads: [],
    campaignVideos: [],
    commissions: [],
    invitationCodes: [],
    cpAssignments: [],
    siteVisits: [],
  });
  const [networks, setNetworks] = useState({ company: [], digital: [], field: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [videoTarget, setVideoTarget] = useState(null);
  const [partnerFormTarget, setPartnerFormTarget] = useState(undefined); // undefined = closed, null = create, object = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [delegateTarget, setDelegateTarget] = useState(null); // assignment row being delegated onward
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);

  const needsNetwork = (t) =>
    t === cpType || (delegateToTypes || []).includes(t) || (t === "company" && routingStage === "head-cp");

  const load = useCallback(async () => {
    const [company, digital, field] = await Promise.all([
      needsNetwork("company") ? getJSON("/api/admin/cp-network?cpType=company") : Promise.resolve([]),
      needsNetwork("digital") ? getJSON("/api/admin/cp-network?cpType=digital") : Promise.resolve([]),
      needsNetwork("field") ? getJSON("/api/admin/field-cps") : Promise.resolve([]),
    ]);
    setNetworks({ company, digital, field });

    const [cpl, cv, comm, inv, asg, visits] = await Promise.all([
      routingStage ? getJSON(`/api/cp-leads?routingStage=${routingStage}`) : Promise.resolve([]),
      showCampaignVideos ? getJSON("/api/campaign-videos") : Promise.resolve([]),
      showCommissions ? getJSON(`/api/commissions?cpType=${cpType || ""}`) : Promise.resolve([]),
      showInvitationCodes && cpType ? getJSON(`/api/invitation-codes?cpType=${cpType}`) : Promise.resolve([]),
      assignmentLevel ? getJSON(`/api/assignments?level=${assignmentLevel}`) : Promise.resolve([]),
      showSiteVisits ? getJSON("/api/site-visits") : Promise.resolve([]),
    ]);
    setData({ cpLeads: cpl, campaignVideos: cv, commissions: comm, invitationCodes: inv, cpAssignments: asg, siteVisits: visits });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpType, routingStage, assignmentLevel, showCampaignVideos, showCommissions, showInvitationCodes, showSiteVisits, delegateToTypes]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setLoading(true);
      load().finally(() => {
        if (active) setLoading(false);
      });
    });
    return () => { active = false; };
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // ---------------------------------------------------------------------
  // Scoped-to-this-CP-type collections
  // ---------------------------------------------------------------------
  const network = useMemo(() => (cpType ? networks[cpType] || [] : []), [networks, cpType]);
  const leads = data.cpLeads;
  const companyPartners = useMemo(
    () => networks.company.filter((n) => n.status !== "Suspended").map((n) => ({ id: n.id, accountId: n.accountId, name: n.name, cpType: "company" })),
    [networks.company]
  );
  const delegatePartners = useMemo(
    () =>
      (delegateToTypes || [])
        .flatMap((t) => (networks[t] || []).filter((n) => n.status !== "Suspended"))
        .map((n) => ({ id: n.id, accountId: n.accountId, name: n.name, cpType: n.cpType, city: n.city, state: n.state })),
    [networks, delegateToTypes]
  );
  const assignedProjects = useMemo(
    () => (assignmentLevel ? data.cpAssignments.filter((a) => a.level === assignmentLevel) : []),
    [data.cpAssignments, assignmentLevel]
  );
  const invitationCodes = data.invitationCodes;

  const commissions = useMemo(
    () => data.commissions.filter((c) => effectiveLeadCpTypes.includes(c.cpType)),
    [data.commissions, effectiveLeadCpTypes]
  );
  const campaignVideos = useMemo(() => {
    if (cpType === "digital") {
      const accountIds = new Set(network.map((n) => n.accountId));
      return data.campaignVideos.filter((v) => accountIds.has(v.partnerAccountId));
    }
    if (cpType === "company") return data.campaignVideos;
    return [];
  }, [data.campaignVideos, cpType, network]);

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
  // Mutation helpers — each talks to its own real Mongo-backed endpoint.
  // ---------------------------------------------------------------------
  const patchLead = async (id, patch) => {
    try {
      const res = await fetch(`/api/cp-leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData((prev) => ({ ...prev, cpLeads: prev.cpLeads.map((l) => (l.id === id ? json.data : l)) }));
      return json.data;
    } catch {
      toast.error("Operation failed");
      return null;
    }
  };

  const patchVideo = async (id, patch) => {
    try {
      const res = await fetch(`/api/campaign-videos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData((prev) => ({ ...prev, campaignVideos: prev.campaignVideos.map((v) => (v.id === id ? json.data : v)) }));
      return json.data;
    } catch {
      toast.error("Operation failed");
      return null;
    }
  };

  const patchCommission = async (id, patch) => {
    try {
      const res = await fetch(`/api/commissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData((prev) => ({ ...prev, commissions: prev.commissions.map((c) => (c.id === id ? json.data : c)) }));
      return json.data;
    } catch {
      toast.error("Operation failed");
      return null;
    }
  };

  const patchPartnerStatus = async (accountId, status) => {
    try {
      const res = await fetch(`/api/users/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setNetworks((prev) => ({
        ...prev,
        [cpType]: prev[cpType].map((n) => (n.accountId === accountId ? { ...n, status } : n)),
      }));
      return json.data;
    } catch {
      toast.error("Operation failed");
      return null;
    }
  };

  // ---------------------------------------------------------------------
  // CRUD handlers — CP Network partners (real Mongo User accounts)
  // ---------------------------------------------------------------------
  const handleSavePartner = async (formData) => {
    if (partnerFormTarget) {
      const res = await fetch(`/api/users/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: formData.name, mobile: formData.phone, email: formData.email, city: formData.city, status: formData.status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      await load();
    } else {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: formData.id,
          fullName: formData.name,
          mobile: formData.phone,
          email: formData.email,
          city: formData.city,
          status: formData.status,
          accountType: "freelancer",
          cpType,
          password: `Simnani@${Math.floor(1000 + Math.random() * 9000)}`,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      await load();
    }
  };

  const handleDeletePartner = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${deleteTarget.accountId || deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setNetworks((prev) => ({ ...prev, [cpType]: prev[cpType].filter((n) => n.id !== deleteTarget.id) }));
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
    {
      key: "name",
      label: "Name",
      sortable: true,
      primary: true,
      render: (v) => <span className="text-sm font-medium text-[#1a1a2e] transition hover:text-[#d97706] hover:underline">{v}</span>,
    },
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
      // Field CP partners are viewed read-only here (click a row to see their
      // real site visits) — Edit/Suspend/Delete apply to Company/Digital CP.
      actions:
        cpType === "field"
          ? () => []
          : (row) => [
              { label: "Edit", icon: MdEdit, onClick: () => setPartnerFormTarget(row) },
              {
                label: row.status === "Active" ? "Suspend" : "Reactivate",
                icon: MdBlock,
                variant: row.status === "Active" ? "danger" : "default",
                onClick: async () => {
                  const newStatus = row.status === "Active" ? "Suspended" : "Active";
                  const ok = await patchPartnerStatus(row.accountId || row.id, newStatus);
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
              const updated = await patchLead(row.id, { status: nextStatus });
              if (updated) {
                toast.success(`Lead status updated to ${nextStatus}`);
                if (nextStatus === "Converted") {
                  const existing = data.commissions.find((c) => c.leadId === row.id);
                  if (!existing) {
                    const res = await fetch("/api/commissions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        leadId: row.id,
                        customer: row.customer,
                        project: row.project,
                        cpType: row.submittedBy?.cpType,
                        cpAccountId: row.submittedBy?.accountId,
                      }),
                    });
                    const json = await res.json();
                    if (json.success) {
                      setData((prev) => ({ ...prev, commissions: [json.data, ...prev.commissions] }));
                      toast.success("Commission record created for this conversion");
                    }
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
                const partner = companyPartners.find((p) => p.accountId === e.target.value);
                const ok = await patchLead(row.id, { routingStage: "company-cp", assignedTo: partner?.name, assignedToAccountId: e.target.value });
                if (ok) toast.success(`Lead forwarded to ${partner?.name}`);
              }}
              disabled={companyPartners.length === 0}
              className="h-8 rounded-lg border border-[#e8e0d5] bg-white px-1.5 text-xs outline-none focus:border-[#f0b429] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {companyPartners.length === 0 ? "No Company CP yet" : "Forward to Company CP…"}
              </option>
              {companyPartners.map((p) => <option key={p.accountId} value={p.accountId}>{p.name}</option>)}
            </select>
          )}

          {routingStage === "company-cp" && (
            <select
              value=""
              onChange={async (e) => {
                if (!e.target.value) return;
                const [nextCpType, accountId] = e.target.value.split("::");
                const partner = (networks[nextCpType] || []).find((p) => p.accountId === accountId);
                const ok = await patchLead(row.id, {
                  routingStage: `${nextCpType}-cp`,
                  assignedTo: partner?.name,
                  assignedToAccountId: accountId,
                  status: "Assigned",
                });
                if (ok) toast.success(`Lead delegated to ${partner?.name}`);
              }}
              disabled={networks.field.length === 0 && networks.digital.length === 0}
              className="h-8 rounded-lg border border-[#e8e0d5] bg-white px-1.5 text-xs outline-none focus:border-[#f0b429] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Assign to…</option>
              {networks.field.length > 0 && (
                <optgroup label="Field CP">
                  {networks.field.map((p) => (
                    <option key={`field::${p.accountId}`} value={`field::${p.accountId}`}>{p.name}</option>
                  ))}
                </optgroup>
              )}
              {networks.digital.length > 0 && (
                <optgroup label="Digital CP">
                  {networks.digital.map((p) => (
                    <option key={`digital::${p.accountId}`} value={`digital::${p.accountId}`}>{p.name}</option>
                  ))}
                </optgroup>
              )}
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
            const ok = await patchVideo(row.id, { status: "Approved", note: "" });
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
            const ok = await patchCommission(row.id, { approvalStatus: "Approved" });
            if (ok) toast.success("Commission approved");
          },
        },
        {
          label: "Put On Hold",
          icon: MdBlock,
          onClick: async () => {
            const ok = await patchCommission(row.id, { approvalStatus: "On Hold" });
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
        <Link href={`/property/${row.propertyId || row.id}`} target="_blank" className="group block">
          <p className="text-sm font-medium text-[#1a1a2e] transition group-hover:text-[#d97706] group-hover:underline">{v}</p>
          <p className="mt-0.5 text-xs text-[#9ca3af]">{row.propertyLocation}</p>
        </Link>
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
          </div>
        );
      },
    },
  ];

  const SITE_VISIT_COLUMNS = [
    { key: "customer", label: "Customer", primary: true, sortable: true },
    { key: "phone", label: "Phone", render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span> },
    { key: "project", label: "Project", render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span> },
    { key: "fieldCpAccountId", label: "Field CP", render: (v) => <span className="font-mono text-xs text-[#9ca3af]">{v}</span> },
    {
      key: "scheduledAt",
      label: "Scheduled",
      sortable: true,
      render: (v) => <span className="text-xs text-[#6b7280]">{v || "—"}</span>,
    },
    { key: "status", label: "Status", type: "status", filterOptions: SITE_VISIT_STATUSES },
    { key: "notes", label: "Notes", render: (v) => <span className="max-w-[160px] block truncate text-xs text-[#6b7280]">{v || "—"}</span> },
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
      key: "used",
      label: "Status",
      render: (v) => <span className={`text-xs font-medium ${v ? "text-[#9ca3af]" : "text-[#16a34a]"}`}>{v ? "Used" : "Unused"}</span>,
    },
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
    ...(showSiteVisits ? [{ key: "siteVisits", label: "Site Visits", count: data.siteVisits.length }] : []),
    ...(showCampaignVideos ? [{ key: "campaignVideos", label: "Campaign Videos", count: campaignVideos.length }] : []),
    ...(showCommissions ? [{ key: "commissions", label: "Commissions", count: commissions.length }] : []),
    ...(showInvitationCodes ? [{ key: "invitationCodes", label: "Invitation Codes", count: invitationCodes.length }] : []),
  ];

  const tabContent = {
    network: { columns: NETWORK_COLUMNS, data: network },
    assignedProjects: { columns: ASSIGNED_PROJECT_COLUMNS, data: assignedProjects },
    leads: { columns: LEAD_COLUMNS, data: leads },
    siteVisits: { columns: SITE_VISIT_COLUMNS, data: data.siteVisits },
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
          tab === "invitationCodes" && showInvitationCodes ? (
            <button
              onClick={() => setInvitationDialogOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-[#f0b429] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d97706]"
            >
              <MdAdd size={16} />
              <span>Generate Code</span>
            </button>
          ) : showAddPartner && cpType !== "field" ? (
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
        onRowClick={tab === "network" ? (row) => router.push(`/admin/freelancer-cp/${cpType}/${row.accountId || row.id}`) : undefined}
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
          const ok = await patchVideo(updated.id, { status: updated.status, note: updated.note });
          if (ok) setVideoTarget(null);
        }}
      />

      <InvitationCodeDialog
        isOpen={invitationDialogOpen}
        onClose={() => setInvitationDialogOpen(false)}
        cpType={cpType}
        onGenerated={(code) => setData((prev) => ({ ...prev, invitationCodes: [code, ...prev.invitationCodes] }))}
      />

      <AssignPropertyDialog
        isOpen={!!delegateTarget}
        onClose={() => setDelegateTarget(null)}
        title="Delegate Project"
        propertyTitle={delegateTarget?.propertyTitle}
        partners={delegatePartners}
        onAssign={async (partner) => {
          const res = await fetch("/api/assignments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              propertyId: delegateTarget.propertyId,
              propertyTitle: delegateTarget.propertyTitle,
              propertyImage: delegateTarget.propertyImage,
              propertyLocation: delegateTarget.propertyLocation,
              level: CHILD_LEVEL_FOR_TYPE[partner.cpType],
              assignedToAccountId: partner.accountId,
              assignedByAccountId: delegateTarget.assignedToAccountId,
              parentAssignmentId: delegateTarget.id,
            }),
          });
          const json = await res.json();
          if (!json.success) {
            toast.error(json.error || "Failed to delegate");
            return;
          }
          setData((prev) => ({ ...prev, cpAssignments: [json.data, ...prev.cpAssignments] }));
          toast.success(`Delegated to ${partner.name}`);
        }}
      />

    </div>
  );
}
