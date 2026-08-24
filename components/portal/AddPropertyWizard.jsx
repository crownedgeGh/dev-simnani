"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import Stepper from "@/components/auth/Stepper";
import FormField from "@/components/auth/FormField";
import ChipGroup from "@/components/auth/ChipGroup";
import FileUpload from "@/components/auth/FileUpload";
import { inputClass, selectClass, textareaClass } from "@/components/auth/inputStyles";
import { generateAccountId } from "@/lib/auth";

const TOTAL_STEPS = 5;

const STEP_LABELS = ["Property Type", "Basic Details", "Photos", "Description", "Review & Submit"];

const PROPERTY_TYPES = [
  { value: "flat", label: "Flat", hint: "Apartment / Condo" },
  { value: "villa", label: "Villa", hint: "Independent House" },
  { value: "plot", label: "Plot", hint: "Land for Development" },
  { value: "land", label: "Land", hint: "Agricultural / Raw" },
  { value: "commercial", label: "Commercial", hint: "Office / Retail" },
  { value: "farm-house", label: "Farm House", hint: "Rural Retreat" },
];

const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5+"];
const BATHROOM_OPTIONS = ["1", "1.5", "2", "2.5", "3", "4+"];

const AMENITY_OPTIONS = [
  { value: "pool", label: "Infinity Pool" },
  { value: "wine-cellar", label: "Wine Cellar" },
  { value: "garage", label: "Private Garage" },
  { value: "tennis", label: "Tennis Court" },
  { value: "terrace", label: "Rooftop Terrace" },
  { value: "smart-home", label: "Smart Home" },
  { value: "security", label: "24/7 Security" },
  { value: "lift", label: "Private Lift" },
];

const INITIAL_FORM = {
  propertyType: "",
  title: "",
  neighborhood: "",
  city: "",
  price: "",
  area: "",
  bedrooms: "",
  bathrooms: "",
  coverPhoto: null,
  additionalPhoto: null,
  description: "",
  amenities: [],
  videoUrl: "",
  mapLocation: "",
};

export default function AddPropertyWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [propertyId, setPropertyId] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function goNext() {
    if (step === 1 && !form.propertyType) {
      setError("Please select a property type.");
      return;
    }
    if (step === 2 && (!form.title.trim() || !form.city.trim() || !form.price || !form.area)) {
      setError("Please fill in all required fields.");
      return;
    }
    if (step === 3 && !form.coverPhoto) {
      setError("Please upload a cover photo.");
      return;
    }
    if (step === 4 && !form.description.trim()) {
      setError("Please add a short description.");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleSubmit() {
    setError("");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setPropertyId(generateAccountId("PROP"));
    }, 1000);
  }

  if (propertyId) {
    return (
      <AuthShell size="md">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-400 text-3xl text-gold-400">
            ✓
          </span>
          <div>
            <h1 className="font-display text-3xl text-cream sm:text-4xl">
              Property Submitted Successfully
            </h1>
            <p className="mt-2 text-sm text-muted">
              Your property is under review. Our curation team will evaluate the details within
              24 hours.
            </p>
          </div>
          <div className="w-full border border-navy-700/60 bg-navy-950 p-4">
            <p className="tracked-label text-xs text-muted">Property ID</p>
            <p className="mt-2 font-display text-lg tracking-widest text-gold-400">
              {propertyId}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3">
            <Link
              href="/portal/broker"
              className="tracked-label bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 transition hover:bg-gold-300"
            >
              Go to Dashboard
            </Link>
            <button
              type="button"
              onClick={() => {
                setForm(INITIAL_FORM);
                setStep(1);
                setPropertyId("");
              }}
              className="tracked-label border border-navy-700/60 px-6 py-4 text-xs text-cream transition hover:border-gold-400"
            >
              List Another Property
            </button>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell size="lg">
      <Stepper step={step} total={TOTAL_STEPS} label={STEP_LABELS[step - 1]} />

      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">{STEP_LABELS[step - 1]}</h1>
        <p className="mt-2 text-sm text-muted">
          {step === 1 && "Select the property type that best describes your listing."}
          {step === 2 && "Add the essential details buyers will see first."}
          {step === 3 && "High-quality imagery is critical for luxury listings."}
          {step === 4 && "Highlight the unique features and amenities."}
          {step === 5 && "Review the details before finalizing your listing."}
        </p>
      </div>

      {step === 1 && (
        <ChipGroup
          options={PROPERTY_TYPES}
          value={form.propertyType}
          onChange={(value) => update("propertyType", value)}
          layout="card"
        />
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <FormField label="Property Title" htmlFor="title" required>
            <input
              id="title"
              type="text"
              placeholder="e.g. Modern Villa in Whitefield"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Neighborhood" htmlFor="neighborhood" optional>
            <input
              id="neighborhood"
              type="text"
              placeholder="e.g. Whitefield"
              value={form.neighborhood}
              onChange={(e) => update("neighborhood", e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="City" htmlFor="city" required>
            <input
              id="city"
              type="text"
              placeholder="e.g. Bangalore"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className={inputClass}
            />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Price (₹)" htmlFor="price" required>
              <input
                id="price"
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                className={inputClass}
              />
            </FormField>
            <FormField label="Area (Sq Ft)" htmlFor="area" required>
              <input
                id="area"
                type="number"
                placeholder="e.g. 2500"
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
                className={inputClass}
              />
            </FormField>
            <FormField label="Bedrooms" htmlFor="bedrooms" optional>
              <select
                id="bedrooms"
                value={form.bedrooms}
                onChange={(e) => update("bedrooms", e.target.value)}
                className={selectClass}
              >
                <option value="">Select</option>
                {BEDROOM_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Bathrooms" htmlFor="bathrooms" optional>
              <select
                id="bathrooms"
                value={form.bathrooms}
                onChange={(e) => update("bathrooms", e.target.value)}
                className={selectClass}
              >
                <option value="">Select</option>
                {BATHROOM_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <FileUpload
            id="coverPhoto"
            label="Cover Photo"
            hint="JPEG or PNG up to 10MB · Required"
            file={form.coverPhoto}
            onChange={(file) => update("coverPhoto", file)}
          />
          <FileUpload
            id="additionalPhoto"
            label="Additional Photos"
            hint="JPEG or PNG up to 10MB"
            file={form.additionalPhoto}
            onChange={(file) => update("additionalPhoto", file)}
            optional
          />
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4">
          <FormField
            label="Short Description"
            htmlFor="description"
            required
            hint={`${form.description.length} / 500`}
          >
            <textarea
              id="description"
              rows={6}
              maxLength={500}
              placeholder="Highlight the unique architectural features, lifestyle amenities and setting..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className={textareaClass}
            />
          </FormField>

          <FormField label="Curated Amenities" optional>
            <ChipGroup
              options={AMENITY_OPTIONS}
              value={form.amenities}
              onChange={(value) => update("amenities", value)}
              multi
            />
          </FormField>

          <FormField label="Property Video URL" htmlFor="videoUrl" optional>
            <input
              id="videoUrl"
              type="url"
              placeholder="https://vimeo.com/..."
              value={form.videoUrl}
              onChange={(e) => update("videoUrl", e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField label="Google Maps Location" htmlFor="mapLocation" optional>
            <input
              id="mapLocation"
              type="text"
              placeholder="Enter coordinates or plus code"
              value={form.mapLocation}
              onChange={(e) => update("mapLocation", e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>
      )}

      {step === 5 && (
        <div className="grid grid-cols-1 gap-4 border border-navy-700/60 bg-navy-950 p-4 sm:grid-cols-2">
          <ReviewItem label="Property Type" value={form.propertyType || "Not selected"} />
          <ReviewItem label="Title" value={form.title} />
          <ReviewItem label="City" value={form.city} />
          <ReviewItem label="Price" value={form.price ? `₹${form.price}` : "Not set"} />
          <ReviewItem label="Area" value={form.area ? `${form.area} sq.ft.` : "Not set"} />
          <ReviewItem
            label="Bed / Bath"
            value={`${form.bedrooms || "-"} / ${form.bathrooms || "-"}`}
          />
          <ReviewItem label="Cover Photo" value={form.coverPhoto?.name || "Not uploaded"} />
          <ReviewItem
            label="Amenities"
            value={
              AMENITY_OPTIONS.filter((a) => form.amenities.includes(a.value))
                .map((a) => a.label)
                .join(", ") || "None selected"
            }
          />
          <div className="sm:col-span-2">
            <ReviewItem label="Description" value={form.description || "Not provided"} />
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-center text-xs text-red-400">{error}</p>}

      <div className="mt-8 flex items-center justify-between gap-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="tracked-label border border-navy-700/60 px-6 py-4 text-xs text-cream transition hover:border-gold-400"
          >
            Back
          </button>
        ) : (
          <span />
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={goNext}
            className="tracked-label bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="tracked-label bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Property"}
          </button>
        )}
      </div>
    </AuthShell>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div>
      <p className="tracked-label text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm text-cream">{value}</p>
    </div>
  );
}
