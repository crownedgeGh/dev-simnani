"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminSelectClass } from "@/components/admin/ui/AdminFormField";

const CP_TYPE_LABEL = { company: "Company CP", field: "Field CP", digital: "Digital CP" };

// Reusable picker for the top-down property/project delegation chain:
// Head CP → Company CP (partners filtered to cpType "company"), and
// Company CP → Field CP / Digital CP (partners filtered to cpType "field"/"digital").
function formatPartnerLabel(p) {
  const place = [p.city, p.state].filter(Boolean).join(", ");
  return place ? `${p.name} — ${place}` : p.name;
}

export default function AssignPropertyDialog({
  isOpen,
  onClose,
  title,
  description,
  propertyTitle,
  partners = [],
  currentAssigneeId,
  onAssign,
}) {
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    Promise.resolve().then(() => {
      if (active) setSelected(currentAssigneeId || "");
    });
    return () => { active = false; };
  }, [isOpen, currentAssigneeId]);

  const groupedByType = partners.reduce((acc, p) => {
    (acc[p.cpType] = acc[p.cpType] || []).push(p);
    return acc;
  }, {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) {
      toast.error("Please select a partner");
      return;
    }
    const partner = partners.find((p) => p.id === selected);
    if (!partner) return;
    setSaving(true);
    try {
      await onAssign(partner);
      onClose();
    } catch {
      toast.error("Failed to assign");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description || propertyTitle}
      size="sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-[#e8e0d5] px-5 text-sm text-[#6b7280] transition hover:bg-[#faf8f5]">
            Cancel
          </button>
          <button type="submit" form="assign-property-form" disabled={saving} className="h-10 rounded-xl bg-[#f0b429] px-5 text-sm font-semibold text-white transition hover:bg-[#d97706] disabled:opacity-60">
            {saving ? "Assigning…" : "Assign"}
          </button>
        </>
      }
    >
      <form id="assign-property-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {partners.length === 0 ? (
          <p className="text-sm text-[#9ca3af]">
            No active partners available yet. Add a partner to the network first.
          </p>
        ) : (
          <AdminFormField label="Assign to" id="assign-property-select" required>
            <select
              id="assign-property-select"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className={adminSelectClass}
            >
              <option value="" disabled>
                Select a partner
              </option>
              {Object.entries(groupedByType).map(([cpType, list]) => (
                <optgroup key={cpType} label={CP_TYPE_LABEL[cpType] || cpType}>
                  {list.map((p) => (
                    <option key={p.id} value={p.id}>
                      {formatPartnerLabel(p)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </AdminFormField>
        )}
      </form>
    </AdminDialog>
  );
}
