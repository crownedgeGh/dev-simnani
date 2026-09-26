"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdAdd, MdEdit, MdDelete, MdOpenInNew, MdLocationOn, MdReportProblem } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection, writeCollection } from "@/lib/adminStorage";
import { getLocationCity } from "@/lib/properties";
import {
  NON_PUBLIC_POSTED_BY_ROLES,
  POSTED_BY_ROLE_OPTIONS,
  getPostedByRoleLabel,
} from "@/lib/postedByRoles";

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

const POSTED_BY_BADGE_STYLES = {
  "super-admin": "border-purple-200 bg-purple-50 text-purple-700",
  "head-cp": "border-blue-200 bg-blue-50 text-blue-700",
  "company-cp": "border-teal-200 bg-teal-50 text-teal-700",
  "field-cp": "border-orange-200 bg-orange-50 text-orange-700",
  "digital-cp": "border-pink-200 bg-pink-50 text-pink-700",
};

function normalizeProperty(p) {
  return {
    ...p,
    city: p.city || (p.location ? getLocationCity(p.location) : "") || "Other",
    postedByRole: p.postedByRole || "public",
  };
}

export default function AdminSgPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProperties = useCallback(async () => {
    try {
      const res = await fetch("/api/properties", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const normalized = json.data.map(normalizeProperty);
        setProperties(normalized);
        try {
          writeCollection(ADMIN_KEYS.properties, normalized);
        } catch {
          // ignore
        }
        return;
      }
    } catch (err) {
      console.error("Failed to fetch properties from API:", err);
    }
    const data = readCollection(ADMIN_KEYS.properties) || [];
    setProperties(data.map(normalizeProperty));
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

  // Only staff-posted listings — Super Admin & every CP tier. Public /
  // broker submissions stay on /admin/properties.
  const sgProperties = useMemo(
    () => properties.filter((p) => NON_PUBLIC_POSTED_BY_ROLES.includes(p.postedByRole)),
    [properties]
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/properties/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setProperties((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        toast.success("Property deleted successfully");
        setDeleting(false);
        setDeleteTarget(null);
        return;
      }
    } catch {
      // Fallback
    }
    try {
      const res = await adminAxios.delete(`/admin/properties/${deleteTarget.id}`);
      setProperties((res.data.data || []).map(normalizeProperty));
      toast.success("Property deleted successfully");
    } catch {
      toast.error("Failed to delete property");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const cityOptions = useMemo(() => {
    const set = new Set();
    sgProperties.forEach((p) => {
      const c = p.city || (p.location ? getLocationCity(p.location) : "");
      if (c && c !== "Other") set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [sgProperties]);

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
        render: (val, row) => (
          <div>
            <p className="font-medium text-[#1a1a2e] text-sm leading-tight">{val}</p>
            <p className="text-xs text-[#9ca3af] mt-0.5">{row.location}</p>
          </div>
        ),
      },
      {
        key: "postedByRole",
        label: "Posted By",
        sortable: true,
        searchable: false,
        filterOptions: POSTED_BY_ROLE_OPTIONS,
        render: (val) => (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
              POSTED_BY_BADGE_STYLES[val] || "border-[#e8e0d5] bg-[#faf8f5] text-[#9ca3af]"
            }`}
          >
            {getPostedByRoleLabel(val)}
          </span>
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
        key: "beds",
        label: "Beds/Baths",
        render: (val, row) => (
          <span className="text-sm text-[#374151]">
            {row.beds ? `${row.beds}B / ${row.baths}Ba` : "—"}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        type: "status",
        sortable: true,
        filterOptions: ["Active", "Pending Review", "Rejected", "Closed"],
      },
      {
        key: "correctionRequest",
        label: "Review",
        searchable: false,
        render: (val) =>
          val?.underReview && !val?.active ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#f0b429]/40 bg-[#fff8e1] px-2 py-0.5 text-xs font-medium text-[#d97706] whitespace-nowrap">
              <MdReportProblem size={12} /> Awaiting Review
            </span>
          ) : val?.active ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 whitespace-nowrap">
              On Hold
            </span>
          ) : null,
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
            label: "Edit",
            icon: MdEdit,
            onClick: () => router.push(`/admin/properties/${row.id}/edit`),
          },
          {
            label: "Delete",
            icon: MdDelete,
            variant: "danger",
            onClick: () => setDeleteTarget(row),
          },
        ],
      },
    ],
    [cityOptions, router]
  );

  return (
    <div>
      <AdminPageHeader
        title="SG Properties"
        description="Listings posted internally by Super Admin, Head CP, Company CP, Field CP & Digital CP"
        badge={`${sgProperties.length} total`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        actions={
          <button
            onClick={() => router.push("/admin/properties/add")}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-[#f0b429] px-4 text-sm font-semibold text-white transition hover:bg-[#d97706]"
          >
            <MdAdd size={18} />
            Add Property
          </button>
        }
      />

      <AdminTable
        columns={COLUMNS}
        data={sgProperties}
        loading={loading}
        onRowClick={(row) => router.push(`/admin/properties/${row.id}`)}
        emptyMessage="No properties posted by CPs or Super Admin yet."
        pageSize={10}
      />

      <AdminConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Property"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
