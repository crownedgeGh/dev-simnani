"use client";

import { useState } from "react";
import { toast } from "sonner";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminInputClass, adminSelectClass } from "@/components/admin/ui/AdminFormField";

const PROJECT_STATUSES = ["Under Construction", "Ready to Move", "Ready to Register", "Possession 2026", "Possession 2027", "Possession 2028"];

const EMPTY = { name: "", location: "", startingPrice: "", developer: "", status: "Under Construction", image: "" };

export default function ProjectFormDialog({ isOpen, onClose, project, onSave }) {
  const isEdit = !!project;
  const [form, setForm] = useState(project ? { ...EMPTY, ...project } : { ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.startingPrice.trim()) e.startingPrice = "Starting price is required";
    if (!form.developer.trim()) e.developer = "Developer is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave(form);
      toast.success(isEdit ? "Project updated successfully" : "Project created successfully");
      onClose();
    } catch {
      toast.error("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Project" : "Add New Project"}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-[#e8e0d5] px-5 text-sm text-[#6b7280] hover:bg-[#faf8f5]">Cancel</button>
          <button type="submit" form="project-form" disabled={saving} className="h-10 rounded-xl bg-[#f0b429] px-5 text-sm font-semibold text-white hover:bg-[#d97706] disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Update" : "Add Project"}
          </button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <AdminFormField label="Project Name" required error={errors.name}>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Simnani Green Residences" className={adminInputClass} />
          </AdminFormField>
        </div>
        <AdminFormField label="Location" required error={errors.location}>
          <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Whitefield, Bangalore" className={adminInputClass} />
        </AdminFormField>
        <AdminFormField label="Starting Price" required error={errors.startingPrice}>
          <input value={form.startingPrice} onChange={(e) => set("startingPrice", e.target.value)} placeholder="e.g. ₹78 Lakh onwards" className={adminInputClass} />
        </AdminFormField>
        <AdminFormField label="Developer" required error={errors.developer}>
          <input value={form.developer} onChange={(e) => set("developer", e.target.value)} placeholder="e.g. Simnani Developers" className={adminInputClass} />
        </AdminFormField>
        <AdminFormField label="Status">
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className={adminSelectClass}>
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </AdminFormField>
        <div className="sm:col-span-2">
          <AdminFormField label="Image URL" hint="Unsplash URL recommended">
            <input value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://images.unsplash.com/…" className={adminInputClass} />
          </AdminFormField>
        </div>
      </form>
    </AdminDialog>
  );
}
