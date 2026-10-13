"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdVisibility } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import { SERVICE_PROVIDER_TYPES, getServiceTypeLabel } from "@/lib/serviceProviders";

export default function AdminContractorsPage() {
  const router = useRouter();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState(SERVICE_PROVIDER_TYPES[0].value);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/users?accountType=service-provider");
      const json = await res.json();
      if (json.success) setContractors(json.data || []);
      else toast.error(json.error || "Failed to load contractors");
    } catch {
      toast.error("Network error loading contractors");
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

  const tabs = useMemo(
    () =>
      SERVICE_PROVIDER_TYPES.map((t) => ({
        ...t,
        count: contractors.filter((c) => c.serviceType === t.value).length,
      })),
    [contractors]
  );

  const rows = useMemo(() => contractors.filter((c) => c.serviceType === tab), [contractors, tab]);

  const COLUMNS = [
    { key: "fullName", label: "Name", primary: true, sortable: true },
    { key: "mobile", label: "Mobile", render: (v) => <AdminPhoneCell value={v} /> },
    { key: "city", label: "City", sortable: true, render: (v) => v || "—" },
    { key: "state", label: "State", sortable: true, render: (v) => v || "—" },
    { key: "yearsOfExperience", label: "Experience", render: (v) => (v ? `${v} yrs` : "—") },
    { key: "status", label: "Status", type: "status", sortable: true },
    {
      key: "actions",
      label: "",
      type: "actions",
      searchable: false,
      actions: (row) => [
        {
          label: "View Contractor",
          icon: MdVisibility,
          onClick: () => router.push(`/admin/freelancer-cp/contractor/${row.accountId}`),
        },
      ],
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Contractors"
        description="Registered civil, industrial EPC and agri infrastructure contractors"
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-[#e8e0d5] bg-white p-1 gold-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex-shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition ${
              tab === t.value ? "bg-[#fff8e1] text-[#d97706]" : "text-[#6b7280] hover:bg-[#faf8f5] hover:text-[#1a1a2e]"
            }`}
          >
            {t.label}
            <span
              className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                tab === t.value ? "bg-[#f0b429]/20 text-[#d97706]" : "bg-[#f0ebe3] text-[#9ca3af]"
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
        emptyMessage={`No ${getServiceTypeLabel(tab)} registered yet`}
        pageSize={10}
        searchKeys={["fullName", "mobile", "city", "state"]}
        onRowClick={(row) => router.push(`/admin/freelancer-cp/contractor/${row.accountId}`)}
      />
    </div>
  );
}
