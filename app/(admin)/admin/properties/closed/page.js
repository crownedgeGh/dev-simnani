"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdOpenInNew, MdLockOpen, MdLocationOn } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import { ADMIN_KEYS, readCollection, writeCollection } from "@/lib/adminStorage";
import { getLocationCity } from "@/lib/properties";
import { isPublicPostedByRole } from "@/lib/postedByRoles";

const PROPERTY_TYPES = [
  "buy",
  "sell",
  "rent",
  "invest",
  "commercial",
  "farming",
  "industrial",
  "lease",
  "seized-property",
];

function normalizeProperty(p) {
  return {
    ...p,
    city: p.city || (p.location ? getLocationCity(p.location) : "") || "Other",
    postedByRole: p.postedByRole || "public",
  };
}

export default function AdminClosedListingsPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reopeningId, setReopeningId] = useState(null);

  const loadProperties = useCallback(async () => {
    try {
      const res = await fetch("/api/properties?status=Closed", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const normalized = json.data.map(normalizeProperty);
        setProperties(normalized);
        return;
      }
    } catch (err) {
      console.error("Failed to fetch closed properties from API:", err);
    }
    const data = readCollection(ADMIN_KEYS.properties) || [];
    setProperties(
      data.map(normalizeProperty).filter((p) => p.status === "Closed")
    );
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (active) {
        await loadProperties();
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [loadProperties]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  };

  const handleReopen = async (row) => {
    setReopeningId(row.id);
    try {
      const res = await fetch(`/api/admin/properties/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Active" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setProperties((prev) => prev.filter((p) => p.id !== row.id));
        try {
          const all = readCollection(ADMIN_KEYS.properties) || [];
          writeCollection(
            ADMIN_KEYS.properties,
            all.map((p) => (p.id === row.id ? { ...p, status: "Active" } : p))
          );
        } catch {
          // ignore
        }
        toast.success("Listing reopened — visible on the public site again");
        return;
      }
      toast.error(json.error || "Failed to reopen listing");
    } catch {
      toast.error("Failed to reopen listing");
    } finally {
      setReopeningId(null);
    }
  };

  const publicProperties = useMemo(
    () => properties.filter((p) => isPublicPostedByRole(p.postedByRole)),
    [properties]
  );

  const cityOptions = useMemo(() => {
    const set = new Set();
    publicProperties.forEach((p) => {
      const c = p.city || (p.location ? getLocationCity(p.location) : "");
      if (c && c !== "Other") set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [publicProperties]);

  const COLUMNS = useMemo(
    () => [
      {
        key: "image",
        label: "Image",
        width: "w-16",
        searchable: false,
        render: (val, row) => (
          <div className="h-10 w-14 overflow-hidden rounded-lg bg-[#f0ebe3] shrink-0">
            {val || row.image ? (
              <img
                src={val || row.image}
                alt={row.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : null}
          </div>
        ),
      },
      {
        key: "title",
        label: "Title",
        sortable: true,
        primary: true,
        width: "min-w-[200px] max-w-xs",
        render: (val, row) => (
          <div className="min-w-[180px] max-w-xs whitespace-normal break-words">
            <p className="font-medium text-[#1a1a2e] text-sm leading-snug">{val}</p>
            <p className="text-xs text-[#9ca3af] mt-0.5">{row.location}</p>
          </div>
        ),
      },
      {
        key: "city",
        label: "City",
        sortable: true,
        filterOptions: cityOptions,
        render: (val, row) => {
          const cityName = val || (row.location ? getLocationCity(row.location) : "") || "—";
          return (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#374151]">
              <MdLocationOn size={13} className="text-[#d97706] shrink-0" />
              {cityName}
            </span>
          );
        },
      },
      {
        key: "type",
        label: "Type",
        type: "status",
        sortable: true,
        filterOptions: PROPERTY_TYPES,
      },
      {
        key: "price",
        label: "Price",
        sortable: true,
        render: (val) => <span className="text-sm font-semibold text-[#d97706]">{val}</span>,
      },
      {
        key: "status",
        label: "Status",
        type: "status",
        sortable: true,
      },
      {
        key: "actions",
        label: "",
        type: "actions",
        searchable: false,
        actions: (row) => [
          {
            label: "View Details",
            icon: MdOpenInNew,
            onClick: () => router.push(`/admin/properties/${row.id}`),
          },
          {
            label: reopeningId === row.id ? "Reopening…" : "Reopen Listing",
            icon: MdLockOpen,
            onClick: () => handleReopen(row),
          },
        ],
      },
    ],
    [cityOptions, router, reopeningId]
  );

  return (
    <div>
      <AdminPageHeader
        title="Closed Listings"
        description="Listings closed by admins — hidden from the public site until reopened"
        badge={`${publicProperties.length} total`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <AdminTable
        columns={COLUMNS}
        data={publicProperties}
        loading={loading}
        onRowClick={(row) => router.push(`/admin/properties/${row.id}`)}
        emptyMessage="No closed listings"
        pageSize={10}
      />
    </div>
  );
}
