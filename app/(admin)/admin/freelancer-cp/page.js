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
  MdCheckCircle,
  MdPauseCircle,
  MdCancel,
} from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import { ADMIN_KEYS, readCollection } from "@/lib/adminStorage";

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

const ROLE_LABEL = { company: "Company CP", digital: "Digital CP", field: "Field CP" };

const STATUS_LABEL = { pending: "Pending", hold: "On Hold", approved: "Approved", rejected: "Rejected" };

export default function FreelancerCPPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [cpCounts, setCpCounts] = useState({ cpNetwork: [], cpLeads: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/users?accountType=freelancer");
      const json = await res.json();
      const list = (json.success ? json.data : []).map((u) => ({ ...u, id: u.accountId }));
      setFreelancers(list);
    } catch {
      toast.error("Failed to load channel partners");
    }
    setCpCounts({
      cpNetwork: readCollection(ADMIN_KEYS.cpNetwork) || [],
      cpLeads: readCollection(ADMIN_KEYS.cpLeads) || [],
    });
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => load())
      .then(() => {
        if (active) setLoading(false);
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

  const updateStatus = async (accountId, cpApprovalStatus) => {
    setUpdatingId(accountId);
    try {
      const res = await fetch(`/api/users/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpApprovalStatus }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Update failed");
      setFreelancers((prev) =>
        prev.map((f) => (f.accountId === accountId ? { ...f, cpApprovalStatus } : f))
      );
      toast.success(`Marked as ${STATUS_LABEL[cpApprovalStatus]}`);
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const segmentCounts = useMemo(() => {
    const counts = {};
    CP_SEGMENTS.forEach((seg) => {
      counts[seg.key] = {
        partners: cpCounts.cpNetwork.filter((n) => n.cpType === seg.key).length,
        leads: cpCounts.cpLeads.filter((l) => l.submittedBy?.cpType === seg.key).length,
      };
    });
    return counts;
  }, [cpCounts]);

  const COLUMNS = [
    { key: "fullName", label: "Name", primary: true, sortable: true },
    { key: "city", label: "City", sortable: true, render: (v) => v || "—" },
    { key: "state", label: "State", sortable: true, render: (v) => v || "—" },
    {
      key: "cpType",
      label: "Role",
      sortable: true,
      filterOptions: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })),
      render: (v) => ROLE_LABEL[v] || v || "—",
    },
    {
      key: "cpApprovalStatus",
      label: "Status",
      sortable: true,
      filterOptions: Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
      render: (v) => {
        const status = v || "pending";
        const classes = {
          pending: "bg-amber-50 text-amber-700 border-amber-200",
          hold: "bg-gray-100 text-gray-600 border-gray-200",
          approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
          rejected: "bg-red-50 text-red-600 border-red-200",
        }[status];
        return (
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${classes}`}>
            {STATUS_LABEL[status]}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Approve / Hold / Reject",
      searchable: false,
      render: (_, row) => {
        const busy = updatingId === row.accountId;
        const status = row.cpApprovalStatus || "pending";
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={busy || status === "approved"}
              onClick={() => updateStatus(row.accountId, "approved")}
              className="flex h-8 min-h-[32px] items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MdCheckCircle size={14} /> Approve
            </button>
            <button
              type="button"
              disabled={busy || status === "hold"}
              onClick={() => updateStatus(row.accountId, "hold")}
              className="flex h-8 min-h-[32px] items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MdPauseCircle size={14} /> Hold
            </button>
            <button
              type="button"
              disabled={busy || status === "rejected"}
              onClick={() => updateStatus(row.accountId, "rejected")}
              className="flex h-8 min-h-[32px] items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MdCancel size={14} /> Reject
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Freelancer & CP Management"
        description="Review channel partner registrations and manage the network"
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

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

      <h3 className="mb-3 text-sm font-semibold text-[#1a1a2e]">Channel Partner Registrations</h3>
      <AdminTable
        columns={COLUMNS}
        data={freelancers}
        loading={loading}
        emptyMessage="No channel partner registrations yet"
        pageSize={10}
      />
    </div>
  );
}
