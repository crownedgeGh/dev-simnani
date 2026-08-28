"use client";

import { useState } from "react";
import FormField from "@/components/auth/FormField";
import ChipGroup from "@/components/auth/ChipGroup";
import { inputClass, selectClass, textareaClass } from "@/components/auth/inputStyles";
import { generateAccountId } from "@/lib/auth";
import { REFERRED_BY_OPTIONS } from "@/lib/demoPortal";

const PROPERTY_TYPES = [
  { value: "flat", label: "Flat" },
  { value: "villa", label: "Villa" },
  { value: "plot", label: "Plot" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "farm-house", label: "Farm House" },
];

const INITIAL_FORM = {
  title: "",
  propertyType: "",
  city: "",
  price: "",
  area: "",
  bedrooms: "",
  bathrooms: "",
  description: "",
  referredBy: "",
  referredByNote: "",
};

export default function AddPropertyForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.city.trim() || !form.price || !form.propertyType) {
      setError("Please fill in property type, title, city and price.");
      return;
    }
    if (!form.referredBy) {
      setError("Please select who referred this property.");
      return;
    }
    if (form.referredBy === "other" && !form.referredByNote.trim()) {
      setError("Please specify the referral source.");
      return;
    }
    setError("");
    onSubmit({
      id: generateAccountId("PROP"),
      title: form.title.trim(),
      propertyType: form.propertyType,
      city: form.city.trim(),
      price: form.price,
      area: form.area,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      description: form.description.trim(),
      referredBy: form.referredBy,
      referredByNote: form.referredBy === "other" ? form.referredByNote.trim() : "",
      status: "Pending Review",
      date: new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border border-navy-700/60 bg-navy-900 p-4 sm:p-6"
    >
      <h3 className="font-display text-lg text-cream">Post a Property</h3>

      <FormField label="Property Title" htmlFor="fl-title" required>
        <input
          id="fl-title"
          type="text"
          placeholder="e.g. 3 BHK Apartment near Whitefield"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputClass}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Property Type" htmlFor="fl-type" required>
          <select
            id="fl-type"
            value={form.propertyType}
            onChange={(e) => update("propertyType", e.target.value)}
            className={selectClass}
          >
            <option value="">Select</option>
            {PROPERTY_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="City" htmlFor="fl-city" required>
          <input
            id="fl-city"
            type="text"
            placeholder="e.g. Bangalore"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Price (₹)" htmlFor="fl-price" required>
          <input
            id="fl-price"
            type="text"
            placeholder="e.g. 1.15 Cr"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Area (Sq Ft)" htmlFor="fl-area" optional>
          <input
            id="fl-area"
            type="number"
            placeholder="e.g. 1650"
            value={form.area}
            onChange={(e) => update("area", e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Bedrooms" htmlFor="fl-bedrooms" optional>
          <input
            id="fl-bedrooms"
            type="text"
            placeholder="e.g. 3"
            value={form.bedrooms}
            onChange={(e) => update("bedrooms", e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Bathrooms" htmlFor="fl-bathrooms" optional>
          <input
            id="fl-bathrooms"
            type="text"
            placeholder="e.g. 2.5"
            value={form.bathrooms}
            onChange={(e) => update("bathrooms", e.target.value)}
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="fl-description" optional>
        <textarea
          id="fl-description"
          rows={4}
          placeholder="Key highlights, amenities and location notes..."
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={textareaClass}
        />
      </FormField>

      <FormField label="Property Referred By" required>
        <ChipGroup
          options={REFERRED_BY_OPTIONS}
          value={form.referredBy}
          onChange={(value) => update("referredBy", value)}
        />
      </FormField>

      {form.referredBy === "other" && (
        <FormField label="Specify Referral Source" htmlFor="fl-referredByNote" required>
          <input
            id="fl-referredByNote"
            type="text"
            placeholder="e.g. Local agent, walk-in visitor..."
            value={form.referredByNote}
            onChange={(e) => update("referredByNote", e.target.value)}
            className={inputClass}
          />
        </FormField>
      )}

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
          Submit Property
        </button>
      </div>
    </form>
  );
}
