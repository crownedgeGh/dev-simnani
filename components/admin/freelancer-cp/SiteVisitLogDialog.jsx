"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminInputClass, adminSelectClass, adminTextareaClass } from "@/components/admin/ui/AdminFormField";

const EMPTY_SCHEDULE_FORM = { customer: "", phone: "", scheduledAt: "" };

// Handles both halves of the Field CP site-visit workflow:
// - mode "schedule": book a new visit against an assigned project/lead
// - mode "outcome": log the result of an already-scheduled visit
export default function SiteVisitLogDialog({ isOpen, onClose, mode = "schedule", context, visit, onSave }) {
  const [form, setForm] = useState(EMPTY_SCHEDULE_FORM);
  const [outcome, setOutcome] = useState("Attended");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      if (mode === "schedule") {
        setForm(EMPTY_SCHEDULE_FORM);
      } else {
        setOutcome("Attended");
        setNotes("");
      }
    });
    return () => { active = false; };
  }, [isOpen, mode]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (mode === "schedule") {
        if (!form.customer.trim() || !form.scheduledAt) {
          toast.error("Customer name and date/time are required");
          setSaving(false);
          return;
        }
        await onSave({ type: "schedule", ...form });
        toast.success("Site visit scheduled");
      } else {
        await onSave({ type: "outcome", visitId: visit?.id, outcome, notes: notes.trim() });
        toast.success(outcome === "Attended" ? "Visit marked as completed" : "Visit marked as no-show");
      }
      onClose();
    } catch {
      toast.error("Failed to save site visit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "schedule" ? "Schedule Site Visit" : "Log Visit Outcome"}
      description={context?.label}
      size="sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-[#e8e0d5] px-5 text-sm text-[#6b7280] transition hover:bg-[#faf8f5]">
            Cancel
          </button>
          <button type="submit" form="site-visit-form" disabled={saving} className="h-10 rounded-xl bg-[#f0b429] px-5 text-sm font-semibold text-white transition hover:bg-[#d97706] disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </>
      }
    >
      <form id="site-visit-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "schedule" ? (
          <>
            <AdminFormField label="Customer Name" id="visit-customer" required>
              <input id="visit-customer" value={form.customer} onChange={(e) => set("customer", e.target.value)} placeholder="e.g. Vivek Nair" className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Phone" id="visit-phone">
              <input id="visit-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Date & Time" id="visit-datetime" required>
              <input id="visit-datetime" type="datetime-local" value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} className={adminInputClass} />
            </AdminFormField>
          </>
        ) : (
          <>
            <AdminFormField label="Outcome" id="visit-outcome" required>
              <select id="visit-outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)} className={adminSelectClass}>
                <option value="Attended">Attended</option>
                <option value="No-show">No-show</option>
              </select>
            </AdminFormField>
            <AdminFormField label="Notes" id="visit-notes">
              <textarea id="visit-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes about the visit…" className={adminTextareaClass} />
            </AdminFormField>
          </>
        )}
      </form>
    </AdminDialog>
  );
}
