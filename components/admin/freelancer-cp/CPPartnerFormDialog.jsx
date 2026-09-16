"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminInputClass, adminSelectClass } from "@/components/admin/ui/AdminFormField";

const ID_PREFIX = { company: "CCP", digital: "DCP", field: "FCP" };

const EMPTY_FORM = { name: "", phone: "", email: "", city: "", status: "Active" };

export default function CPPartnerFormDialog({ isOpen, onClose, cpType, partner, onSave }) {
  const isEdit = Boolean(partner);
  const [form, setForm] = useState(EMPTY_FORM);
  const [generatedId, setGeneratedId] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset the form whenever the dialog opens, and generate a fresh partner
  // ID client-side for new partners (never during render, to avoid hydration drift).
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      if (isEdit) {
        setForm({
          name: partner.name || "",
          phone: partner.phone || "",
          email: partner.email || "",
          city: partner.city || "",
          status: partner.status || "Active",
        });
      } else {
        setForm(EMPTY_FORM);
        const prefix = ID_PREFIX[cpType] || "CP";
        setGeneratedId(`SG-${prefix}-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    });
    return () => { active = false; };
  }, [isOpen, isEdit, partner, cpType]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Partner name is required");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await onSave({ ...partner, ...form });
        toast.success("Partner updated successfully");
      } else {
        await onSave({
          id: generatedId,
          cpType,
          leadsSubmitted: 0,
          siteVisits: 0,
          dealsClosed: 0,
          ...form,
        });
        toast.success("Partner added successfully");
      }
      onClose();
    } catch {
      toast.error(isEdit ? "Failed to update partner" : "Failed to add partner");
    } finally {
      setSaving(false);
    }
  };

  const typeLabel = { company: "Company", digital: "Digital", field: "Field" }[cpType] || "";

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Partner" : `Add ${typeLabel} CP Partner`}
      description={isEdit ? `Editing ${partner?.name}` : `Create a new ${typeLabel} channel partner record`}
      size="sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-[#e8e0d5] px-5 text-sm text-[#6b7280] transition hover:bg-[#faf8f5]">
            Cancel
          </button>
          <button type="submit" form="cp-partner-form" disabled={saving} className="h-10 rounded-xl bg-[#f0b429] px-5 text-sm font-semibold text-white transition hover:bg-[#d97706] disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Partner"}
          </button>
        </>
      }
    >
      <form id="cp-partner-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isEdit && (
          <AdminFormField label="Partner ID" hint="Auto-generated">
            <div className="h-11 flex items-center rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-3 font-mono text-sm text-[#6b7280]">
              {generatedId}
            </div>
          </AdminFormField>
        )}
        <AdminFormField label="Full Name" id="cp-partner-name" required>
          <input
            id="cp-partner-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Rohan Deshpande"
            className={adminInputClass}
          />
        </AdminFormField>
        <AdminFormField label="Phone" id="cp-partner-phone">
          <input
            id="cp-partner-phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+91 98765 43210"
            className={adminInputClass}
          />
        </AdminFormField>
        <AdminFormField label="Email" id="cp-partner-email">
          <input
            id="cp-partner-email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="partner@email.com"
            className={adminInputClass}
          />
        </AdminFormField>
        <AdminFormField label="City" id="cp-partner-city">
          <input
            id="cp-partner-city"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="e.g. Bangalore"
            className={adminInputClass}
          />
        </AdminFormField>
        <AdminFormField label="Status" id="cp-partner-status">
          <select id="cp-partner-status" value={form.status} onChange={(e) => set("status", e.target.value)} className={adminSelectClass}>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </AdminFormField>
      </form>
    </AdminDialog>
  );
}
