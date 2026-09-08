"use client";

import { useState } from "react";
import { toast } from "sonner";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminInputClass, adminTextareaClass } from "@/components/admin/ui/AdminFormField";

export default function CallbackEditDialog({ isOpen, onClose, callback: cb, onSave }) {
  const [assignedTo, setAssignedTo] = useState(cb?.assignedTo || "");
  const [adminNotes, setAdminNotes] = useState(cb?.adminNotes || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...cb, assignedTo, adminNotes });
      toast.success("Callback updated successfully");
      onClose();
    } catch { toast.error("Update failed"); }
    finally { setSaving(false); }
  };

  if (!cb) return null;

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Callback"
      description={`Request from ${cb.name}`}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="h-10 rounded-xl border border-[#e8e0d5] px-5 text-sm text-[#6b7280] hover:bg-[#faf8f5]">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="h-10 rounded-xl bg-[#f0b429] px-5 text-sm font-semibold text-white hover:bg-[#d97706] disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Read-only info */}
        <div className="rounded-xl bg-[#faf8f5] p-3 text-sm">
          <p className="font-medium text-[#1a1a2e]">{cb.name} · {cb.phone}</p>
          <p className="text-[#9ca3af] mt-0.5 text-xs">{cb.topic}</p>
          {cb.message && <p className="mt-1.5 text-[#374151] text-xs border-t border-[#e8e0d5] pt-1.5">{cb.message}</p>}
        </div>

        <AdminFormField label="Assigned To">
          <input
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="e.g. Karthik Iyer"
            className={adminInputClass}
          />
        </AdminFormField>

        <AdminFormField label="Admin Notes">
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            placeholder="Internal notes about this callback…"
            className={adminTextareaClass}
          />
        </AdminFormField>
      </div>
    </AdminDialog>
  );
}
