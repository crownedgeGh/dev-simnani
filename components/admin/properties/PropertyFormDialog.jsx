"use client";

import { useState } from "react";
import { toast } from "sonner";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminInputClass, adminSelectClass, adminTextareaClass } from "@/components/admin/ui/AdminFormField";
import { getLocationCity, CATEGORIES_BY_TYPE } from "@/lib/properties";

const PROPERTY_TYPES = ["buy", "sell", "rent", "invest", "commercial", "farming", "industrial", "lease", "seized-property"];
const STATUSES = ["Active", "Pending Review", "Rejected"];

const EMPTY_FORM = {
  title: "",
  type: "buy",
  category: "",
  price: "",
  location: "",
  beds: "",
  baths: "",
  area: "",
  image: "",
  status: "Active",
  featured: false,
  badge: "",
};

export default function PropertyFormDialog({ isOpen, onClose, property, onSave }) {
  const isEdit = !!property;
  const [form, setForm] = useState(property ? { ...EMPTY_FORM, ...property } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when dialog opens
  const handleOpen = () => {
    setForm(property ? { ...EMPTY_FORM, ...property } : { ...EMPTY_FORM });
    setErrors({});
  };

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.price.trim()) errs.price = "Price is required";
    if (!form.location.trim()) errs.location = "Location is required";
    if (!form.type) errs.type = "Type is required";
    if (CATEGORIES_BY_TYPE[form.type] && !form.category) errs.category = "Category is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave({
        ...form,
        city: form.city || (form.location ? getLocationCity(form.location) : "") || "Other",
        beds: Number(form.beds) || 0,
        baths: Number(form.baths) || 0,
      });
      toast.success(isEdit ? "Property updated successfully" : "Property created successfully");
      onClose();
    } catch (err) {
      toast.error(err.message || "Operation failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Property" : "Add New Property"}
      description={isEdit ? "Update property details below." : "Fill in the details to add a new property."}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-[#e8e0d5] px-5 text-sm text-[#6b7280] transition hover:bg-[#faf8f5]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="property-form"
            disabled={saving}
            className="h-10 rounded-xl bg-[#f0b429] px-5 text-sm font-semibold text-white transition hover:bg-[#d97706] disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Update Property" : "Add Property"}
          </button>
        </>
      }
    >
      <form id="property-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <AdminFormField label="Title" id="prop-title" required error={errors.title}>
            <input id="prop-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Luxury 3 BHK Apartment" className={adminInputClass} />
          </AdminFormField>
        </div>

        <AdminFormField label="Type" id="prop-type" required error={errors.type}>
          <select
            id="prop-type"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value, category: "" }))}
            className={adminSelectClass}
          >
            {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </AdminFormField>

        {CATEGORIES_BY_TYPE[form.type] && (
          <AdminFormField label="Category" id="prop-category" required error={errors.category}>
            <select id="prop-category" value={form.category} onChange={(e) => set("category", e.target.value)} className={adminSelectClass}>
              <option value="">Select category</option>
              {CATEGORIES_BY_TYPE[form.type].map((cat) => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
          </AdminFormField>
        )}

        <AdminFormField label="Status" id="prop-status">
          <select id="prop-status" value={form.status} onChange={(e) => set("status", e.target.value)} className={adminSelectClass}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </AdminFormField>

        <AdminFormField label="Price" id="prop-price" required error={errors.price}>
          <input id="prop-price" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. ₹1.25 Cr" className={adminInputClass} />
        </AdminFormField>

        <AdminFormField label="Location" id="prop-location" required error={errors.location}>
          <input id="prop-location" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Indiranagar, Bangalore" className={adminInputClass} />
        </AdminFormField>

        <AdminFormField label="Beds" id="prop-beds">
          <input id="prop-beds" type="number" min="0" value={form.beds} onChange={(e) => set("beds", e.target.value)} placeholder="e.g. 3" className={adminInputClass} />
        </AdminFormField>

        <AdminFormField label="Baths" id="prop-baths">
          <input id="prop-baths" type="number" min="0" value={form.baths} onChange={(e) => set("baths", e.target.value)} placeholder="e.g. 2" className={adminInputClass} />
        </AdminFormField>

        <AdminFormField label="Area" id="prop-area">
          <input id="prop-area" value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. 1,850 sq.ft." className={adminInputClass} />
        </AdminFormField>

        <AdminFormField label="Badge" id="prop-badge" hint="Optional label shown on card (e.g. Featured, New, Owner Listed)">
          <input id="prop-badge" value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="e.g. New" className={adminInputClass} />
        </AdminFormField>

        <div className="sm:col-span-2">
          <AdminFormField label="Image URL" id="prop-image" hint="Unsplash URL recommended">
            <input id="prop-image" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://images.unsplash.com/…" className={adminInputClass} />
          </AdminFormField>
        </div>

        <div className="sm:col-span-2 flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-[#374151]">Featured</label>
          <button
            type="button"
            role="switch"
            aria-checked={form.featured}
            onClick={() => set("featured", !form.featured)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${form.featured ? "bg-[#f0b429]" : "bg-[#e8e0d5]"}`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${form.featured ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
          <span className="text-sm text-[#9ca3af]">{form.featured ? "Yes — show in featured section" : "No"}</span>
        </div>
      </form>
    </AdminDialog>
  );
}
