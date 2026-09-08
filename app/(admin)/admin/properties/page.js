"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdAdd, MdEdit, MdDelete, MdOpenInNew } from "react-icons/md";
import Image from "next/image";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";
import PropertyFormDialog from "@/components/admin/properties/PropertyFormDialog";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection } from "@/lib/adminStorage";

const PROPERTY_TYPES = ["buy", "sell", "rent", "invest", "commercial", "farming", "industrial", "lease", "seized-property"];

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

  const loadProperties = useCallback(() => {
    const data = readCollection(ADMIN_KEYS.properties) || [];
    setProperties(data);
  }, []);

  useEffect(() => {
    loadProperties();
    setLoading(false);
  }, [loadProperties]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 500));
    loadProperties();
    setRefreshing(false);
  };

  // Create
  const handleCreate = async (formData) => {
    const newProp = {
      ...formData,
      id: `PROP-${Date.now()}`,
      addedDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    };
    const res = await adminAxios.post("/admin/properties", newProp);
    setProperties(res.data.data);
  };

  // Edit
  const handleEdit = async (formData) => {
    const res = await adminAxios.put(`/admin/properties/${formData.id}`, formData);
    setProperties(res.data.data);
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await adminAxios.delete(`/admin/properties/${deleteTarget.id}`);
      setProperties(res.data.data);
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
      const res = await adminAxios.patch(`/admin/properties/${row.id}`, { featured: val });
      setProperties(res.data.data);
      toast.success(val ? "Featured enabled" : "Featured disabled");
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  const COLUMNS = [
    {
      key: "image",
      label: "Image",
      width: "w-16",
      searchable: false,
      render: (val, row) => (
        <div className="h-10 w-14 overflow-hidden rounded-lg bg-[#f0ebe3] shrink-0">
          {(val || row.image) ? (
            <img
              src={val || row.image}
              alt={row.title}
              className="h-full w-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
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
      filterOptions: ["true", "false"],
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
          onClick: () => { setEditingProperty(row); setFormOpen(true); },
        },
        {
          label: "Delete",
          icon: MdDelete,
          variant: "danger",
          onClick: () => setDeleteTarget(row),
        },
      ],
    },
  ];

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
            onClick={() => { setEditingProperty(null); setFormOpen(true); }}
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
        onClose={() => { setFormOpen(false); setEditingProperty(null); }}
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
