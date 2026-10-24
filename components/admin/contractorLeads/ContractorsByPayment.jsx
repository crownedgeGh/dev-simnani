"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import { SERVICE_PROVIDER_TYPES, getServiceTypeLabel } from "@/lib/serviceProviders";
import { getServicePlanById } from "@/lib/servicePlans";

// Shared by /admin/contractor-leads/paid and /unpaid — same service-provider
// account list, split by whether a lead plan has been activated.
export default function ContractorsByPayment({ paid }) {
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

  const paymentFiltered = useMemo(
    () =>
      contractors.filter((c) =>
        paid ? c.servicePlan && c.servicePlan !== "none" : !c.servicePlan || c.servicePlan === "none"
      ),
    [contractors, paid]
  );

  const tabs = useMemo(
    () =>
      SERVICE_PROVIDER_TYPES.map((t) => ({
        ...t,
        count: paymentFiltered.filter((c) => c.serviceType === t.value).length,
      })),
    [paymentFiltered]
  );

  const rows = useMemo(() => paymentFiltered.filter((c) => c.serviceType === tab), [paymentFiltered, tab]);

  const COLUMNS = [
    { key: "fullName", label: "Name", primary: true, sortable: true },
    { key: "mobile", label: "Mobile", render: (v) => <AdminPhoneCell value={v} /> },
    { key: "city", label: "City", sortable: true, render: (v) => v || "—" },
    ...(paid
      ? [
          {
            key: "servicePlan",
            label: "Plan",
            sortable: true,
            render: (v) => getServicePlanById(v)?.name || v,
          },
          {
            key: "servicePlanExpiresAt",
            label: "Expires",
            sortable: true,
            render: (v) => (v ? new Date(v).toLocaleDateString("en-IN") : "—"),
          },
        ]
      : []),
    { key: "status", label: "Status", type: "status", sortable: true },
  ];

  return (
    <div>
      <AdminPageHeader
        title={paid ? "Paid Contractors" : "Unpaid Contractors"}
        description={
          paid
            ? "Service providers with an active lead plan"
            : "Service providers who signed up but haven't activated a lead plan yet"
        }
        badge={`${paymentFiltered.length} total`}
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
        emptyMessage={
          paid
            ? `No paid ${getServiceTypeLabel(tab)} contractors yet`
            : `No unpaid ${getServiceTypeLabel(tab)} contractors`
        }
        pageSize={10}
        searchKeys={["fullName", "mobile", "city"]}
      />
    </div>
  );
}
