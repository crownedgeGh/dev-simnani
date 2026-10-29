"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdWorkspacePremium, MdMoneyOff } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminPhoneCell from "@/components/admin/ui/AdminPhoneCell";
import FeaturedLocationModal from "@/components/admin/ui/FeaturedLocationModal";
import Select from "@/components/ui/Select";

const POSITIONS = Array.from({ length: 10 }, (_, i) => i + 1);

// Paid = any plan other than "free" (see models/User.js plan enum). Only
// paid brokers can be featured on the homepage.
export default function AdminBrokersPage() {
  const router = useRouter();
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("paid");
  const [savingId, setSavingId] = useState(null);
  const [featuredModalRow, setFeaturedModalRow] = useState(null);
  const [featuredSaving, setFeaturedSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/users?accountType=broker", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setBrokers(json.data || []);
      else toast.error(json.error || "Failed to load brokers");
    } catch {
      toast.error("Network error loading brokers");
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

  const isPaid = (b) => (b.plan && b.plan !== "free") || b.topupCredits > 0;
  const paid = useMemo(() => brokers.filter(isPaid), [brokers]);
  const unpaid = useMemo(() => brokers.filter((b) => !isPaid(b)), [brokers]);
  const rows = tab === "paid" ? paid : unpaid;

  const takenPositions = useMemo(() => {
    const map = new Map();
    paid.forEach((b) => {
      if (b.isFeaturedBroker && b.featuredPosition) map.set(b.featuredPosition, b.accountId);
    });
    return map;
  }, [paid]);

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
        // Ask which cities this broker should be featured for — default to
        // the broker's own state/city.
        setFeaturedModalRow({ ...row, _position: position });
      } else {
        const ok = await persist(row.accountId, { isFeaturedBroker: false, featuredPosition: null });
        if (ok) toast.success(`${row.fullName} removed from featured brokers`);
      }
    },
    [nextFreePosition, persist]
  );

  const handleFeaturedLocationConfirm = useCallback(
    async ({ locations }) => {
      if (!featuredModalRow) return;
      setFeaturedSaving(true);
      const ok = await persist(featuredModalRow.accountId, {
        isFeaturedBroker: true,
        featuredPosition: featuredModalRow._position,
        featuredLocations: locations,
      });
      setFeaturedSaving(false);
      if (ok) {
        toast.success(`${featuredModalRow.fullName} is now featured at position ${featuredModalRow._position}`);
        setFeaturedModalRow(null);
      }
    },
    [featuredModalRow, persist]
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

  const COLUMNS = [
    { key: "fullName", label: "Broker", primary: true, sortable: true },
    { key: "mobile", label: "Mobile", render: (v) => <AdminPhoneCell value={v} /> },
    { key: "agencyName", label: "Agency", render: (v) => v || "—" },
    ...(tab === "paid"
      ? [
          {
            key: "plan",
            label: "Plan",
            sortable: true,
            render: (v, row) => (
              <span className="capitalize">
                {v && v !== "free" ? v : `Topup (${row.topupCredits} credits)`}
              </span>
            ),
          },
          {
            key: "planExpiresAt",
            label: "Expires",
            sortable: true,
            render: (v) => (v ? new Date(v).toLocaleDateString("en-IN") : "—"),
          },
        ]
      : []),
    { key: "status", label: "Status", type: "status", sortable: true },
    ...(tab === "paid"
      ? [
          {
            key: "isFeaturedBroker",
            label: "Featured",
            type: "toggle",
            onToggle: handleToggleFeatured,
            disabled: (row) => savingId === row.accountId,
          },
          {
            key: "featuredPosition",
            label: "Position",
            searchable: false,
            interactive: true,
            render: (v, row) => (
              <Select
                value={v || ""}
                disabled={!row.isFeaturedBroker || savingId === row.accountId}
                onChange={(e) => handlePositionChange(row, Number(e.target.value))}
                className="h-8 rounded-lg border border-[#e8e0d5] bg-white px-2 text-xs text-[#374151] outline-none transition focus:border-[#f0b429] disabled:cursor-not-allowed disabled:opacity-40"
                placeholder="—"
                options={POSITIONS.map((p) => {
                  const owner = takenPositions.get(p);
                  const taken = owner && owner !== row.accountId;
                  return { value: p, label: `${p}${taken ? " (taken)" : ""}` };
                })}
              />
            ),
          },
          {
            key: "featuredLocations",
            label: "Featured Cities",
            searchable: false,
            interactive: true,
            render: (v, row) => (
              <button
                type="button"
                disabled={!row.isFeaturedBroker}
                onClick={() => setFeaturedModalRow({ ...row, _position: row.featuredPosition })}
                className="text-left text-xs text-[#374151] underline decoration-dotted underline-offset-2 transition hover:text-[#d97706] disabled:cursor-not-allowed disabled:text-[#9ca3af] disabled:no-underline"
              >
                {Array.isArray(v) && v.length
                  ? v.map((l) => l.city).join(", ")
                  : row.isFeaturedBroker
                    ? "Set cities"
                    : "—"}
              </button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <AdminPageHeader
        title="Brokers"
        description="All broker accounts, split by whether a paid plan is active"
        badge={`${brokers.length} total`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-[#e8e0d5] bg-white p-1 gold-scrollbar">
        {[
          { value: "paid", label: "Paid Brokers", icon: MdWorkspacePremium, count: paid.length },
          { value: "unpaid", label: "Unpaid Brokers", icon: MdMoneyOff, count: unpaid.length },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
              tab === t.value
                ? "bg-[#fff8e1] text-[#d97706]"
                : "text-[#6b7280] hover:bg-[#faf8f5] hover:text-[#1a1a2e]"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            <span
              className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${
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
        emptyMessage={tab === "paid" ? "No paid brokers yet" : "No unpaid brokers"}
        pageSize={10}
        searchKeys={["fullName", "mobile", "agencyName"]}
        onRowClick={(row) => router.push(`/admin/users/${row.accountId}`)}
      />

      {tab === "paid" && (
        <FeaturedLocationModal
          isOpen={!!featuredModalRow}
          onClose={() => setFeaturedModalRow(null)}
          onConfirm={handleFeaturedLocationConfirm}
          isLoading={featuredSaving}
          title="Feature this broker"
          description="Choose the cities this broker should be featured in. A broker can be featured in multiple cities."
          multiple
          initialState={featuredModalRow?.state}
          initialCity={featuredModalRow?.city}
          initialLocations={featuredModalRow?.featuredLocations}
        />
      )}
    </div>
  );
}
