"use client";

import { useState } from "react";
import FormField from "@/components/auth/FormField";
import { inputClass, selectClass, textareaClass } from "@/components/auth/inputStyles";
import { generateAccountId } from "@/lib/auth";
import { LEAD_SOURCES } from "@/lib/demoPortal";

const INITIAL_FORM = {
  customer: "",
  phone: "",
  project: "",
  source: "",
  notes: "",
};

export default function AddLeadForm({ projects, onSubmit, onCancel }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.customer.trim() || !form.phone.trim() || !form.project) {
      setError("Please fill in customer name, phone and project.");
      return;
    }
    setError("");
    onSubmit({
      id: generateAccountId("LED"),
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      project: form.project,
      date: new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: "New",
      source: form.source || "Other",
      commission: "Pending",
      notes: form.notes.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4 sm:p-6"
    >
      <h3 className="font-display text-lg text-cream">Generate a Lead</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Customer Name" htmlFor="ld-customer" required>
          <input
            id="ld-customer"
            type="text"
            placeholder="e.g. Karan Malhotra"
            value={form.customer}
            onChange={(e) => update("customer", e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Phone" htmlFor="ld-phone" required>
          <input
            id="ld-phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Project" htmlFor="ld-project" required>
          <select
            id="ld-project"
            value={form.project}
            onChange={(e) => update("project", e.target.value)}
            className={selectClass}
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Lead Source" htmlFor="ld-source" optional>
          <select
            id="ld-source"
            value={form.source}
            onChange={(e) => update("source", e.target.value)}
            className={selectClass}
          >
            <option value="">Select</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="ld-notes" optional>
        <textarea
          id="ld-notes"
          rows={3}
          placeholder="Any context that helps qualify this lead..."
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          className={textareaClass}
        />
      </FormField>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="tracked-label border border-navy-700/60 px-6 py-3 text-xs text-cream transition hover:border-gold-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="tracked-label bg-gold-400 px-6 py-3 text-xs text-navy-950 transition hover:bg-gold-300"
        >
          Add Lead
        </button>
      </div>
    </form>
  );
}
