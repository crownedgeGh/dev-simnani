"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MdApartment,
  MdPeople,
  MdLeaderboard,
  MdBusiness,
  MdAttachMoney,
  MdPhone,
  MdCheckCircle,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSwapVert,
} from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminKpiCard from "@/components/admin/ui/AdminKpiCard";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import { ADMIN_KEYS, readCollection } from "@/lib/adminStorage";

const ACTIVITY_ICONS = {
  created: MdAdd,
  updated: MdEdit,
  deleted: MdDelete,
};

const ACTIVITY_COLORS = {
  created: "text-emerald-600 bg-emerald-50",
  updated: "text-blue-600 bg-blue-50",
  deleted: "text-red-500 bg-red-50",
};

function timeAgo(iso) {
  try {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "—";
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(() => {
    const properties = readCollection(ADMIN_KEYS.properties) || [];
    const users = readCollection(ADMIN_KEYS.users) || [];
    const leads = readCollection(ADMIN_KEYS.leads) || [];
    const projects = readCollection(ADMIN_KEYS.projects) || [];
    const commissions = readCollection(ADMIN_KEYS.commissions) || [];
    const callbacks = readCollection(ADMIN_KEYS.callbacks) || [];
    const activityLog = readCollection(ADMIN_KEYS.activityLog) || [];

    // Property breakdown
    const typeBreakdown = properties.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {});

    // Lead pipeline
    const leadPipeline = leads.reduce((acc, l) => {
      const s = l.status || "Unknown";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    setStats({
      totalProperties: properties.length,
      featuredProperties: properties.filter((p) => p.featured).length,
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === "Active").length,
      totalLeads: leads.length,
      convertedLeads: leads.filter((l) => l.status === "Converted").length,
      activeProjects: projects.length,
      pendingCommissions: commissions.filter((c) => c.approvalStatus !== "Approved").length,
      pendingCallbacks: callbacks.filter((c) => c.status === "Pending").length,
      typeBreakdown,
      leadPipeline,
      recentActivity: activityLog.slice(0, 10),
    });
  }, []);

  useEffect(() => {
    loadStats();
    setLoading(false);
  }, [loadStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    loadStats();
    setRefreshing(false);
  };

  const kpiCards = stats
    ? [
        { title: "Total Properties", value: stats.totalProperties, subtitle: `${stats.featuredProperties} featured`, icon: MdApartment, color: "gold" },
        { title: "Registered Users", value: stats.totalUsers, subtitle: `${stats.activeUsers} active`, icon: MdPeople, color: "blue" },
        { title: "Total Leads", value: stats.totalLeads, subtitle: `${stats.convertedLeads} converted`, icon: MdLeaderboard, color: "green" },
        { title: "Active Projects", value: stats.activeProjects, subtitle: "Across all cities", icon: MdBusiness, color: "purple" },
        { title: "Pending Commissions", value: stats.pendingCommissions, subtitle: "Awaiting approval", icon: MdAttachMoney, color: "orange" },
        { title: "Pending Callbacks", value: stats.pendingCallbacks, subtitle: "Awaiting response", icon: MdPhone, color: "red" },
      ]
    : [];

  const PIPELINE_ORDER = ["New", "Contacted", "Qualified", "Site Visit Scheduled", "Site Visit Completed", "Converted", "Lost"];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Platform-wide overview — properties, users, leads & activity"
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#f0ebe3] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 mb-6">
            {kpiCards.map((card) => (
              <AdminKpiCard key={card.title} {...card} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Recent Activity */}
            <div className="lg:col-span-2 rounded-2xl border border-[#e8e0d5] bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold text-[#1a1a2e]">Recent Activity</h3>
              {stats.recentActivity.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <MdCheckCircle size={28} className="text-[#c9c3bc]" />
                  <p className="text-sm text-[#9ca3af]">No activity yet — start managing the platform!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {stats.recentActivity.map((entry, i) => {
                    const Icon = ACTIVITY_ICONS[entry.action] || MdEdit;
                    const colorClass = ACTIVITY_COLORS[entry.action] || "text-gray-600 bg-gray-100";
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-[#faf8f5]">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#374151] truncate">
                            <span className="font-medium capitalize">{entry.action}</span>{" "}
                            <span className="text-[#9ca3af]">{entry.entityType}:</span>{" "}
                            {entry.entityTitle}
                          </p>
                          <p className="text-[11px] text-[#9ca3af]">{timeAgo(entry.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">
              {/* Property breakdown by type */}
              <div className="rounded-2xl border border-[#e8e0d5] bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold text-[#1a1a2e]">Properties by Type</h3>
                <div className="flex flex-col gap-2">
                  {Object.entries(stats.typeBreakdown).length === 0 ? (
                    <p className="text-sm text-[#9ca3af]">No data</p>
                  ) : (
                    Object.entries(stats.typeBreakdown).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AdminStatusBadge status={type} />
                        </div>
                        <span className="text-sm font-semibold text-[#1a1a2e]">{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Lead pipeline summary */}
              <div className="rounded-2xl border border-[#e8e0d5] bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold text-[#1a1a2e]">Lead Pipeline</h3>
                <div className="flex flex-col gap-1.5">
                  {PIPELINE_ORDER.filter((s) => stats.leadPipeline[s] > 0).length === 0 ? (
                    <p className="text-sm text-[#9ca3af]">No leads yet</p>
                  ) : (
                    PIPELINE_ORDER.filter((s) => stats.leadPipeline[s] > 0).map((stage) => (
                      <div key={stage} className="flex items-center justify-between">
                        <AdminStatusBadge status={stage} />
                        <span className="text-sm font-semibold text-[#1a1a2e]">{stats.leadPipeline[stage]}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
