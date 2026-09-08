"use client";

import { useState } from "react";
import { toast } from "sonner";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminInputClass, adminSelectClass } from "@/components/admin/ui/AdminFormField";

const ACCOUNT_TYPES = ["buyer", "broker", "investor", "freelancer", "common-person", "employee"];
const STATUSES = ["Active", "Suspended", "Deleted"];

export default function UserEditDialog({ isOpen, onClose, user, onSave }) {
  const [form, setForm] = useState(user ? { accountType: user.accountType, status: user.status } : {});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...user, ...form });
      toast.success("User updated successfully");
      onClose();
    } catch {
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User"
      description={`Editing account for ${user.fullName}`}
      size="sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-[#e8e0d5] px-5 text-sm text-[#6b7280] transition hover:bg-[#faf8f5]">Cancel</button>
          <button type="submit" form="user-edit-form" disabled={saving} className="h-10 rounded-xl bg-[#f0b429] px-5 text-sm font-semibold text-white transition hover:bg-[#d97706] disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </>
      }
    >
      <form id="user-edit-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AdminFormField label="Account Type" id="user-account-type">
          <select id="user-account-type" value={form.accountType || ""} onChange={(e) => set("accountType", e.target.value)} className={adminSelectClass}>
            {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </AdminFormField>
        <AdminFormField label="Status" id="user-status">
          <select id="user-status" value={form.status || ""} onChange={(e) => set("status", e.target.value)} className={adminSelectClass}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </AdminFormField>
      </form>
    </AdminDialog>
  );
}
