"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MdCheckCircle, MdPhoneForwarded, MdClose } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import {
  SERVICE_PROVIDER_TYPES,
  getServiceTypeLabel,
} from "@/lib/serviceProviders";

const STATUSES = ["New", "Contacted", "Closed"];

const TIME_LABELS = {
  morning: "Morning (9AM - 12PM)",
  afternoon: "Afternoon (12PM - 5PM)",
  evening: "Evening (5PM - 8PM)",
};

export default function AdminContractorLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState(SERVICE_PROVIDER_TYPES[0].value);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/contractor-leads", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setLeads(json.data || []);
      else toast.error(json.error || "Failed to load contractor leads");
    } catch {
      toast.error("Network error loading contractor leads");
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
      const res = await fetch("/api/contractor-leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Update failed");
        return;
      }
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      );
      toast.success(`Lead marked as ${patch.status}`);
    } catch {
      toast.error("Network error");
    }
  };

  // One tab per service provider role; counts come off the single fetch.
  const tabs = useMemo(
    () =>
      SERVICE_PROVIDER_TYPES.map((t) => ({
        ...t,
        count: leads.filter((l) => l.serviceType === t.value).length,
      })),
    [leads],
  );

  const rows = useMemo(
    () => leads.filter((l) => l.serviceType === tab),
    [leads, tab],
  );
  const newCount = leads.filter((l) => l.status === "New").length;

  const COLUMNS = [
    {
      key: "id",
      label: "Request ID",
      render: (v) => (
        <span className="font-mono text-xs text-[#9ca3af]">{v}</span>
      ),
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      primary: true,
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-[#1a1a2e]">{v}</p>
          <AdminPhoneCell
            value={row.phone}
            className="text-xs text-[#9ca3af]"
          />
        </div>
      ),
    },
    {
      key: "serviceType",
      label: "Requested Role",
      sortable: true,
      render: (v) => (
        <span className="rounded-full bg-[#fff8e1] px-2.5 py-0.5 text-xs font-semibold text-[#d97706] border border-[#f0b429]/30">
          {getServiceTypeLabel(v)}
        </span>
      ),
    },
    {
      key: "sourcePath",
      label: "Requested From",
      render: (v) => (
        <span className="font-mono text-xs text-[#374151]">{v || "—"}</span>
      ),
    },
    {
      key: "city",
      label: "Location",
      render: (v, row) => (
        <span className="text-xs text-[#374151]">
          {[v, row.state].filter(Boolean).join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "bestTime",
      label: "Best Time",
      render: (v) => (
        <span className="text-xs text-[#374151]">{TIME_LABELS[v] || "—"}</span>
      ),
    },
    { key: "date", label: "Date", sortable: true },
    {
      key: "status",
      label: "Status",
      type: "status",
      sortable: true,
      filterOptions: STATUSES,
    },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        {
          label: "Mark Contacted",
          icon: MdPhoneForwarded,
          onClick: () => patchLead(row.id, { status: "Contacted" }),
        },
        {
          label: "Mark Closed",
          icon: MdCheckCircle,
          onClick: () => patchLead(row.id, { status: "Closed" }),
        },
        {
          label: "Reopen",
          icon: MdClose,
          onClick: () => patchLead(row.id, { status: "New" }),
        },
      ],
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Contractor Leads"
        description="Callback requests raised from the service provider sections, grouped by the role the visitor asked for"
        badge={newCount > 0 ? `${newCount} new` : `${leads.length} total`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-[#e8e0d5] bg-white p-1 gold-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex-shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition ${
              tab === t.value
                ? "bg-[#fff8e1] text-[#d97706]"
                : "text-[#6b7280] hover:bg-[#faf8f5] hover:text-[#1a1a2e]"
            }`}
          >
            {t.label}
            <span
              className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                tab === t.value
                  ? "bg-[#f0b429]/20 text-[#d97706]"
                  : "bg-[#f0ebe3] text-[#9ca3af]"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <AdminTable
        columns={COLUMNS}
        data={rows}
        loading={loading}
        emptyMessage={`No ${getServiceTypeLabel(tab)} callback requests yet`}
        pageSize={10}
        searchKeys={["name", "phone", "id", "sourcePath", "city", "state"]}
      />
    </div>
  );
}
