"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  MdBusiness,
  MdCampaign,
  MdDirectionsWalk,
  MdArrowForward,
  MdGroups,
  MdLeaderboard,
  MdVpnKey,
} from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import InvitationCodeDialog from "@/components/admin/freelancer-cp/InvitationCodeDialog";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection } from "@/lib/adminStorage";

const TABS = [
  { key: "freelancerLeads", label: "Freelancer Leads" },
  { key: "freelancerProps", label: "Freelancer Properties" },
];

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Site Visit", "Converted", "Lost"];
const PROP_STATUSES = ["Pending Review", "Live", "Rejected"];

// CP type segments — each has its own dedicated management page with full
// CRUD, mirroring the three public dashboards at
// /portal/freelancer?cpType=company|digital|field.
const CP_SEGMENTS = [
  {
    key: "company",
    href: "/admin/freelancer-cp/company",
    label: "Company CP",
    icon: MdBusiness,
    description: "Verifies leads, assigns Field CPs and manages the wider network.",
    classes: "border-blue-200 bg-blue-50 text-blue-700",
    iconBg: "bg-white/70",
  },
  {
    key: "digital",
    href: "/admin/freelancer-cp/digital",
    label: "Digital CP",
    icon: MdCampaign,
    description: "Promotes approved projects, generates leads and earns commission.",
    classes: "border-purple-200 bg-purple-50 text-purple-700",
    iconBg: "bg-white/70",
  },
  {
    key: "field",
    href: "/admin/freelancer-cp/field",
    label: "Field CP",
    icon: MdDirectionsWalk,
    description: "Converts assigned leads through site visits and earns commission.",
    classes: "border-orange-200 bg-orange-50 text-orange-700",
    iconBg: "bg-white/70",
  },
];

export default function FreelancerCPPage() {
  const [tab, setTab] = useState("freelancerLeads");
  const [data, setData] = useState({ freelancerLeads: [], freelancerProps: [], cpNetwork: [], cpLeads: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const load = useCallback(() => {
    const fl = readCollection(ADMIN_KEYS.freelancerLeads) || [];
    const fp = readCollection(ADMIN_KEYS.freelancerProperties) || [];
    const cpn = readCollection(ADMIN_KEYS.cpNetwork) || [];
    const cpl = readCollection(ADMIN_KEYS.cpLeads) || [];
    setData({ freelancerLeads: fl, freelancerProps: fp, cpNetwork: cpn, cpLeads: cpl });
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

  const segmentCounts = useMemo(() => {
    const counts = {};
    CP_SEGMENTS.forEach((seg) => {
      counts[seg.key] = {
        partners: data.cpNetwork.filter((n) => n.cpType === seg.key).length,
        leads: data.cpLeads.filter((l) => l.submittedBy?.cpType === seg.key).length,
      };
    });
    return counts;
  }, [data.cpNetwork, data.cpLeads]);

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

  const tabContent = {
    freelancerLeads: { columns: FL_COLUMNS, data: data.freelancerLeads },
    freelancerProps: { columns: FP_COLUMNS, data: data.freelancerProps },
  };

  const current = tabContent[tab];

  return (
    <div>
      <AdminPageHeader
        title="Freelancer & CP Management"
        description="Manage freelancer leads, channel partner networks, and commissions"
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        actions={
          <button
            onClick={() => setShowInviteDialog(true)}
            className="flex h-9 min-h-[44px] items-center gap-1.5 rounded-xl bg-[#f0b429] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d97706] sm:min-h-0"
          >
            <MdVpnKey size={16} />
            <span>Generate Invitation Code</span>
          </button>
        }
      />

      <InvitationCodeDialog isOpen={showInviteDialog} onClose={() => setShowInviteDialog(false)} />

      {/* CP Type — dedicated management pages */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-[#1a1a2e]">Channel Partner Networks</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CP_SEGMENTS.map((seg) => {
            const SegIcon = seg.icon;
            const counts = segmentCounts[seg.key] || { partners: 0, leads: 0 };
            return (
              <Link
                key={seg.key}
                href={seg.href}
                className={`group flex flex-col gap-3 rounded-2xl border p-5 transition hover:shadow-md ${seg.classes}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${seg.iconBg}`}>
                    <SegIcon size={20} />
                  </div>
                  <MdArrowForward size={18} className="opacity-50 transition group-hover:translate-x-1 group-hover:opacity-100" />
                </div>
                <div>
                  <p className="text-sm font-bold">{seg.label}</p>
                  <p className="mt-1 text-xs opacity-80">{seg.description}</p>
                </div>
                <div className="mt-1 flex items-center gap-4 border-t border-current/15 pt-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5"><MdGroups size={14} /> {counts.partners} partners</span>
                  <span className="flex items-center gap-1.5"><MdLeaderboard size={14} /> {counts.leads} leads</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Freelancer tabs */}
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
    </div>
  );
}
