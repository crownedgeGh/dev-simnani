"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  MdCheckCircle,
  MdPauseCircle,
  MdCancel,
  MdWorkspacePremium,
  MdHourglassEmpty,
  MdPayments,
} from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminKpiCard from "@/components/admin/ui/AdminKpiCard";

const PLAN_FILTER_OPTIONS = ["free", "standard", "premium"];
const STATUS_FILTER_OPTIONS = ["Pending", "Approved", "Hold", "Rejected"];

const STATUS_COLORS = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Hold: "bg-gray-100 text-gray-600 border-gray-200",
  Rejected: "bg-red-50 text-red-600 border-red-200",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminPlansPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingId, setActingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/subscriptions", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSubscriptions(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      toast.error("Failed to load plan purchase requests");
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (active) {
        await load();
        setLoading(false);
      }
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

  const decide = useCallback(
    async (row, status) => {
      setActingId(row._id);
      try {
        const res = await fetch(`/api/admin/subscriptions/${row._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to update");
        setSubscriptions((prev) =>
          prev.map((s) => (s._id === row._id ? { ...s, status, expiresAt: json.data.subscription.expiresAt } : s))
        );
        const verb = status === "Approved" ? "approved" : status === "Hold" ? "put on hold" : "rejected";
        toast.success(`Request ${verb}`, { description: `${row.fullName || row.accountId} — ${row.plan} plan` });
      } catch (err) {
        toast.error(err.message || "Operation failed");
      } finally {
        setActingId(null);
      }
    },
    []
  );

  const kpis = useMemo(() => {
    const pending = subscriptions.filter((s) => s.status === "Pending").length;
    const approved = subscriptions.filter((s) => s.status === "Approved").length;
    const revenue = subscriptions
      .filter((s) => s.status === "Approved")
      .reduce((sum, s) => sum + (s.amount || 0), 0);
    return { total: subscriptions.length, pending, approved, revenue };
  }, [subscriptions]);

  const COLUMNS = [
    {
      key: "fullName",
      label: "User",
      sortable: true,
      primary: true,
      render: (val, row) => (
        <div>
          <p className="font-medium text-[#1a1a2e] text-sm">{val || "—"}</p>
          <p className="text-xs text-[#9ca3af]">{row.accountId}</p>
        </div>
      ),
    },
    {
      key: "mobile",
      label: "Mobile",
      render: (v) => <span className="text-sm text-[#374151] font-mono">{v || "—"}</span>,
    },
    {
      key: "plan",
      label: "Plan",
      type: "status",
      sortable: true,
      filterOptions: PLAN_FILTER_OPTIONS,
      statusColors: {
        free: "bg-gray-100 text-gray-600 border-gray-200",
        standard: "bg-blue-50 text-blue-700 border-blue-200",
        premium: "bg-purple-50 text-purple-700 border-purple-200",
      },
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (v) => <span className="text-sm font-semibold text-[#1a1a2e]">{v ? `₹${v}` : "Free"}</span>,
    },
    {
      key: "createdAt",
      label: "Requested",
      sortable: true,
      render: (v) => <span className="text-sm text-[#374151]">{formatDate(v)}</span>,
    },
    {
      key: "expiresAt",
      label: "Valid Till",
      render: (v) => <span className="text-sm text-[#374151]">{v ? formatDate(v) : "—"}</span>,
    },
    {
      key: "status",
      label: "Status",
      type: "status",
      sortable: true,
      filterOptions: STATUS_FILTER_OPTIONS,
      statusColors: STATUS_COLORS,
    },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        {
          label: actingId === row._id ? "Approving…" : "Approve",
          icon: MdCheckCircle,
          onClick: () => decide(row, "Approved"),
        },
        {
          label: actingId === row._id ? "Updating…" : "Put On Hold",
          icon: MdPauseCircle,
          onClick: () => decide(row, "Hold"),
        },
        {
          label: actingId === row._id ? "Updating…" : "Reject",
          icon: MdCancel,
          variant: "danger",
          onClick: () => decide(row, "Rejected"),
        },
      ],
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Plans & Subscriptions"
        description="Review and action every membership plan purchase request"
        badge={`${subscriptions.length} requests`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpiCard title="Total Requests" value={kpis.total} icon={MdWorkspacePremium} color="gold" />
        <AdminKpiCard title="Pending Review" value={kpis.pending} icon={MdHourglassEmpty} color="orange" />
        <AdminKpiCard title="Approved" value={kpis.approved} icon={MdCheckCircle} color="green" />
        <AdminKpiCard title="Revenue Collected" value={`₹${kpis.revenue}`} icon={MdPayments} color="blue" />
      </div>

      <AdminTable
        columns={COLUMNS}
        data={subscriptions}
        loading={loading}
        emptyMessage="No plan purchase requests yet"
        pageSize={10}
      />
    </div>
  );
}
