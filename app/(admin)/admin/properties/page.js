"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdAdd, MdEdit, MdDelete, MdOpenInNew, MdLocationOn } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";
import PropertyFormDialog from "@/components/admin/properties/PropertyFormDialog";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection, writeCollection } from "@/lib/adminStorage";
import { getLocationCity } from "@/lib/properties";

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
  };
}

export default function AdminPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
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

  // Create
  const handleCreate = async (formData) => {
    const newProp = {
      ...formData,
      id: `PROP-${Date.now()}`,
      addedDate: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProp),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setProperties((prev) => [normalizeProperty(json.data), ...prev]);
        toast.success("Property created successfully");
        return;
      }
    } catch {
      // Fallback to local mock if API fails
    }
    const res = await adminAxios.post("/admin/properties", newProp);
    setProperties((res.data.data || []).map(normalizeProperty));
    toast.success("Property created successfully");
  };

  // Edit
  const handleEdit = async (formData) => {
    try {
      const res = await fetch(`/api/properties/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const updated = normalizeProperty(json.data);
        setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Property updated successfully");
        return;
      }
    } catch {
      // Fallback
    }
    const res = await adminAxios.put(`/admin/properties/${formData.id}`, formData);
    setProperties((res.data.data || []).map(normalizeProperty));
    toast.success("Property updated successfully");
  };

  // Delete
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

  // Featured toggle
  const handleFeaturedToggle = async (row, val) => {
    try {
      const res = await fetch(`/api/properties/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: val }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const updated = normalizeProperty(json.data);
        setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success(val ? "Featured enabled" : "Featured disabled");
        return;
      }
    } catch {
      // Fallback
    }
    try {
      const res = await adminAxios.patch(`/admin/properties/${row.id}`, { featured: val });
      setProperties((res.data.data || []).map(normalizeProperty));
      toast.success(val ? "Featured enabled" : "Featured disabled");
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  // Dynamically extract all unique cities present in current properties
  const cityOptions = useMemo(() => {
    const set = new Set();
    properties.forEach((p) => {
      const c = p.city || (p.location ? getLocationCity(p.location) : "");
      if (c && c !== "Other") set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [properties]);

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
        filterOptions: ["Active", "Pending Review", "Rejected"],
      },
      {
        key: "featured",
        label: "Featured",
        type: "toggle",
        onToggle: handleFeaturedToggle,
        filterOptions: [
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ],
        render: null,
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
        title="Properties"
        description="Manage all property listings on the platform"
        badge={`${properties.length} total`}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        actions={
          <button
            id="admin-add-property-btn"
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
        data={properties}
        loading={loading}
        onRowClick={(row) => router.push(`/admin/properties/${row.id}`)}
        emptyMessage="No properties found. Add your first property!"
        pageSize={10}
      />

      {/* Create / Edit Dialog */}
      <PropertyFormDialog
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProperty(null);
        }}
        property={editingProperty}
        onSave={editingProperty ? handleEdit : handleCreate}
      />

      {/* Delete Confirm */}
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
