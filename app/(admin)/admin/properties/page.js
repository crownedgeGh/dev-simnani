"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdAdd, MdEdit, MdDelete, MdOpenInNew, MdLocationOn, MdReportProblem, MdSend } from "react-icons/md";
import AdminPageHeader from "@/components/admin/layout/AdminPageHeader";
import AdminTable from "@/components/admin/ui/AdminTable";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";
import PropertyFormDialog from "@/components/admin/properties/PropertyFormDialog";
import FeaturedLocationModal from "@/components/admin/ui/FeaturedLocationModal";
import ForwardToCompanyCpModal from "@/components/admin/ui/ForwardToCompanyCpModal";
import adminAxios from "@/lib/adminAxios";
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
  const [featuredModalRow, setFeaturedModalRow] = useState(null);
  const [featuredSaving, setFeaturedSaving] = useState(false);
  const [forwardModalRow, setForwardModalRow] = useState(null);
  const [forwarding, setForwarding] = useState(false);

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
      const res = await fetch(`/api/admin/properties/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setProperties((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        toast.success("Property deleted successfully");
        return;
      }
      toast.error(json.error || "Failed to delete property");
    } catch {
      toast.error("Failed to delete property");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Featured toggle
  const MAX_FEATURED = 6;
  const persistFeatured = async (row, patch) => {
    try {
      const res = await fetch(`/api/admin/properties/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const updated = normalizeProperty(json.data);
        setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success(patch.featured ? "Featured on the public site" : "Removed from public site");
        return true;
      }
      toast.error(json.error || "Failed to update featured status");
      return false;
    } catch {
      toast.error("Failed to update featured status — check your connection and try again");
      return false;
    }
  };

  const handleFeaturedToggle = async (row, val) => {
    if (!val) {
      await persistFeatured(row, { featured: false });
      return;
    }
    const featuredCount = properties.filter((p) => p.featured && p.id !== row.id).length;
    if (featuredCount >= MAX_FEATURED) {
      toast.error(`Only ${MAX_FEATURED} properties can be featured at a time. Unfeature one first.`);
      return;
    }
    // Ask which state/city this featured listing should be shown for.
    setFeaturedModalRow(row);
  };

  const handleFeaturedLocationConfirm = async ({ state, city }) => {
    if (!featuredModalRow) return;
    setFeaturedSaving(true);
    const ok = await persistFeatured(featuredModalRow, { featured: true, state, city });
    setFeaturedSaving(false);
    if (ok) setFeaturedModalRow(null);
  };

  // Forward to Company CP — first leg of the Head -> Company -> Field/Digital chain
  const handleForwardConfirm = async (accountId) => {
    if (!forwardModalRow) return;
    setForwarding(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: forwardModalRow.id,
          propertyTitle: forwardModalRow.title,
          propertyImage: forwardModalRow.image,
          propertyLocation: forwardModalRow.location,
          level: "head-to-company",
          assignedToAccountId: accountId,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to forward");
      toast.success(`Forwarded to ${json.data?.assignedToName || "Company CP"}`);
      setForwardModalRow(null);
    } catch (err) {
      toast.error(err.message || "Failed to forward property");
    } finally {
      setForwarding(false);
    }
  };

  // This page is for public-facing listings only (posted by common users /
  // brokers via the site). CP & Super Admin postings live on /admin/sg-properties.
  const publicProperties = useMemo(
    () => properties.filter((p) => isPublicPostedByRole(p.postedByRole)),
    [properties]
  );

  // Listings the owner has resubmitted after a correction request — need an
  // admin to go check the fix and clear the hold.
  const reviewList = useMemo(
    () => publicProperties.filter((p) => p.correctionRequest?.underReview && !p.correctionRequest?.active),
    [publicProperties]
  );

  // Dynamically extract all unique cities present in current properties
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
            label: "Forward to Company CP",
            icon: MdSend,
            onClick: () => setForwardModalRow(row),
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
        badge={`${publicProperties.length} total`}
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

      {reviewList.length > 0 && (
        <div className="mb-5 rounded-2xl border border-[#f0b429]/40 bg-[#fff8e1] p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0b429]/20 text-[#d97706]">
              <MdReportProblem size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1a1a2e]">
                {reviewList.length} listing{reviewList.length === 1 ? "" : "s"} need your review
              </p>
              <p className="mt-0.5 text-sm text-[#6b7280]">
                The owner made changes after your correction request — please check and clear the hold.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {reviewList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => router.push(`/admin/properties/${p.id}`)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#f0b429]/30 bg-white px-3 py-2 text-left text-sm text-[#374151] transition hover:border-[#f0b429]/60"
                  >
                    <span className="truncate">{p.title}</span>
                    <span className="tracked-label shrink-0 text-xs font-semibold text-[#d97706]">Check & Clear →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminTable
        columns={COLUMNS}
        data={publicProperties}
        loading={loading}
        onRowClick={(row) => router.push(`/admin/properties/${row.id}`)}
        emptyMessage="No properties found. Add your first property!"
        pageSize={10}
        searchKeys={["id", "title", "location", "city", "type", "price", "status"]}
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

      {/* Featured location picker */}
      <FeaturedLocationModal
        isOpen={!!featuredModalRow}
        onClose={() => setFeaturedModalRow(null)}
        onConfirm={handleFeaturedLocationConfirm}
        isLoading={featuredSaving}
        title="Feature this property"
        description="Choose the state and city this property should be featured for."
        initialState={featuredModalRow?.state}
        initialCity={featuredModalRow?.city}
      />

      {/* Forward to Company CP */}
      <ForwardToCompanyCpModal
        isOpen={!!forwardModalRow}
        onClose={() => setForwardModalRow(null)}
        onConfirm={handleForwardConfirm}
        isLoading={forwarding}
        propertyTitle={forwardModalRow?.title}
      />
    </div>
  );
}
