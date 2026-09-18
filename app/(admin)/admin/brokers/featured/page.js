"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { MdStar, MdWorkspacePremium, MdApartment } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminKpiCard from "@/components/admin/ui/AdminKpiCard";

const POSITIONS = Array.from({ length: 10 }, (_, i) => i + 1);

export default function AdminFeaturedBrokersPage() {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/brokers/featured", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBrokers(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch premium brokers:", err);
      toast.error("Failed to load premium brokers");
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

  const takenPositions = useMemo(() => {
    const map = new Map();
    brokers.forEach((b) => {
      if (b.isFeaturedBroker && b.featuredPosition) map.set(b.featuredPosition, b.accountId);
    });
    return map;
  }, [brokers]);

  const nextFreePosition = useCallback(
    (excludeAccountId) => {
      return POSITIONS.find((p) => {
        const owner = takenPositions.get(p);
        return !owner || owner === excludeAccountId;
      });
    },
    [takenPositions]
  );

  const persist = useCallback(async (accountId, patch) => {
    setSavingId(accountId);
    try {
      const res = await fetch(`/api/users/${accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update broker");
      setBrokers((prev) =>
        prev.map((b) => (b.accountId === accountId ? { ...b, ...patch } : b))
      );
      return true;
    } catch (err) {
      toast.error(err.message || "Failed to update broker");
      return false;
    } finally {
      setSavingId(null);
    }
  }, []);

  const handleToggleFeatured = useCallback(
    async (row, checked) => {
      if (checked) {
        const position = row.featuredPosition || nextFreePosition(row.accountId);
        if (!position) {
          toast.error("All 10 featured slots are taken — free one up first");
          return;
        }
        const ok = await persist(row.accountId, { isFeaturedBroker: true, featuredPosition: position });
        if (ok) toast.success(`${row.fullName} is now featured at position ${position}`);
      } else {
        const ok = await persist(row.accountId, { isFeaturedBroker: false, featuredPosition: null });
        if (ok) toast.success(`${row.fullName} removed from featured brokers`);
      }
    },
    [nextFreePosition, persist]
  );

  const handlePositionChange = useCallback(
    async (row, position) => {
      const owner = takenPositions.get(position);
      if (owner && owner !== row.accountId) {
        toast.error(`Position ${position} is already taken`);
        return;
      }
      await persist(row.accountId, { featuredPosition: position });
    },
    [takenPositions, persist]
  );

  const kpis = useMemo(() => {
    const featured = brokers.filter((b) => b.isFeaturedBroker).length;
    return { total: brokers.length, featured, free: 10 - featured };
  }, [brokers]);

  const COLUMNS = [
    {
      key: "fullName",
      label: "Broker",
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
      key: "agencyName",
      label: "Agency",
      render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span>,
    },
    {
      key: "experience",
      label: "Experience",
      render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span>,
    },
    {
      key: "propertiesListed",
      label: "Properties Listed",
      sortable: true,
      render: (v) => <span className="text-sm font-semibold text-[#1a1a2e]">{v ?? 0}</span>,
    },
    {
      key: "isFeaturedBroker",
      label: "Featured",
      type: "toggle",
      onToggle: handleToggleFeatured,
    },
    {
      key: "featuredPosition",
      label: "Position",
      searchable: false,
      render: (v, row) => (
        <select
          value={v || ""}
          disabled={!row.isFeaturedBroker || savingId === row.accountId}
          onChange={(e) => handlePositionChange(row, Number(e.target.value))}
          className="h-8 rounded-lg border border-[#e8e0d5] bg-white px-2 text-xs text-[#374151] outline-none transition focus:border-[#f0b429] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <option value="" disabled>
            —
          </option>
          {POSITIONS.map((p) => {
            const owner = takenPositions.get(p);
            const disabled = owner && owner !== row.accountId;
            return (
              <option key={p} value={p} disabled={disabled}>
                {p}
                {disabled ? " (taken)" : ""}
              </option>
            );
          })}
        </select>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Featured Brokers"
        description="Feature premium-plan brokers on the homepage and set their display position (1–10)."
        badge={`${brokers.length} premium brokers`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminKpiCard title="Premium Brokers" value={kpis.total} icon={MdWorkspacePremium} color="purple" />
        <AdminKpiCard title="Featured on Homepage" value={kpis.featured} icon={MdStar} color="gold" />
        <AdminKpiCard title="Slots Available" value={kpis.free} icon={MdApartment} color="blue" />
      </div>

      <AdminTable
        columns={COLUMNS}
        data={brokers}
        loading={loading}
        emptyMessage="No premium-plan brokers yet"
        pageSize={10}
      />
    </div>
  );
}
