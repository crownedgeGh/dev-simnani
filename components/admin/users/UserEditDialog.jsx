"use client";

import { useState } from "react";
import { toast } from "sonner";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminInputClass, adminSelectClass } from "@/components/admin/ui/AdminFormField";

const ACCOUNT_TYPES = ["buyer", "broker", "investor", "freelancer", "common-person", "employee"];
const STATUSES = ["Active", "Suspended", "Deleted"];

export default function UserEditDialog({ isOpen, onClose, user, onSave }) {
  const [form, setForm] = useState(
    user ? { accountType: user.accountType, status: user.status, dealsClosed: user.dealsClosed ?? 0 } : {}
  );
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...user, ...form };
      if (payload.accountType === "broker" && payload.dealsClosed !== undefined && payload.dealsClosed !== "") {
        payload.dealsClosed = Math.max(0, Number(payload.dealsClosed) || 0);
      }
      if (newPassword) payload.password = newPassword;
      await onSave(payload);
      toast.success("User updated successfully");
      setNewPassword("");
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
        {(user.accountType === "broker" || form.accountType === "broker") && (
          <AdminFormField label="Deals Closed" id="user-deals-closed">
            <input
              id="user-deals-closed"
              type="number"
              min="0"
              value={form.dealsClosed ?? 0}
              onChange={(e) => set("dealsClosed", e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value, 10) || 0))}
              className={adminInputClass}
            />
          </AdminFormField>
        )}
        <AdminFormField label="Reset Password" id="user-new-password" hint="Leave blank to keep the current password">
          <input
            id="user-new-password"
            type="password"
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={adminInputClass}
          />
        </AdminFormField>
      </form>
    </AdminDialog>
  );
}
