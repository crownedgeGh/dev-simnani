"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMobile, isMobileValid, generateAccountId } from "@/lib/auth";
import { inputClass, selectClass } from "@/components/auth/inputStyles";
import FormField from "@/components/auth/FormField";
import { CoverImageUpload, GalleryImageUpload } from "@/components/property/PropertyImageUpload";

const PURPOSE_OPTIONS = [
  { value: "sale", label: "Sale" },
  { value: "rent", label: "Rent" },
];

const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const PROPERTY_TYPES = ["Flat", "House", "Shop", "Plot", "Office", "Warehouse"];

const AREA_UNITS = ["sq ft", "sq m", "acres", "gaj"];

const FURNISHING_OPTIONS = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];

const FACING_OPTIONS = [
  "North",
  "South",
  "East",
  "West",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

const PREFERRED_FOR_OPTIONS = ["Family", "Bachelors", "Company", "Anyone"];

const INITIAL_FORM = {
  purpose: "sale",
  title: "",
  propertyType: "",
  city: "",
  locality: "",
  landmark: "",
  price: "",
  negotiable: "",
  areaSize: "",
  areaUnit: "sq ft",
  floorNo: "",
  totalFloors: "",
  furnishing: "",
  parking: "",
  facing: "",
  availableFrom: "",
  preferredFor: "",
  coverImage: null,
  galleryImages: [],
  fullName: "",
  mobile: "",
};

export default function PostPropertyForm() {
  const [propertyId, setPropertyId] = useState(() => generateAccountId("PROP"));
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (
      !form.title.trim() ||
      !form.propertyType ||
      !form.city.trim() ||
      !form.locality.trim() ||
      !form.price ||
      !form.areaSize ||
      !form.fullName.trim() ||
      !isMobileValid(form.mobile)
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedId(propertyId);
    }, 900);
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setPropertyId(generateAccountId("PROP"));
    setSubmittedId("");
    setError("");
  }

  if (submittedId) {
    return (
      <div className="flex flex-col items-center gap-6 border border-navy-700/60 bg-navy-900 p-8 text-center sm:p-10">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-400 text-3xl text-gold-400">
          ✓
        </span>
        <div>
          <h1 className="font-display text-2xl text-cream sm:text-3xl">
            Property Submitted Successfully
          </h1>
          <p className="mt-2 text-sm text-muted">
            Your property is under review. Our team will verify the details and get in touch
            shortly.
          </p>
        </div>
        <div className="w-full border border-navy-700/60 bg-navy-950 p-4">
          <p className="tracked-label text-xs text-muted">Property ID</p>
          <p className="mt-2 font-display text-lg tracking-widest text-gold-400">{submittedId}</p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Link
            href="/"
            className="tracked-label bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 transition hover:bg-gold-300"
          >
            Return Home
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="tracked-label border border-navy-700/60 px-6 py-4 text-xs text-cream transition hover:border-gold-400"
          >
            Post Another Property
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Section icon={<ClipboardIcon />} title="Property Identity" subtitle="Basic info about your listing">
        <FormField label="Property ID" htmlFor="propertyId">
          <div className="flex h-14 items-center justify-between border border-navy-700/60 bg-navy-950 px-4">
            <span className="font-display text-sm tracking-widest text-gold-400">
              #{propertyId}
            </span>
            <span className="text-xs text-muted">Auto-generated</span>
          </div>
        </FormField>
        <FormField label="Purpose" required>
          <ToggleTwo
            options={PURPOSE_OPTIONS}
            value={form.purpose}
            onChange={(value) => update("purpose", value)}
          />
        </FormField>
        <FormField label="Property Title" htmlFor="title" required hint={`${form.title.length}/80`}>
          <input
            id="title"
            type="text"
            maxLength={80}
            placeholder="e.g. Spacious 2BHK near City Center"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Property Type" htmlFor="propertyType" required>
          <select
            id="propertyType"
            value={form.propertyType}
            onChange={(e) => update("propertyType", e.target.value)}
            className={selectClass}
          >
            <option value="">Select type</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>
      </Section>

      <Section icon={<LocationIcon />} title="Location" subtitle="City and area — no full address required">
        <FormField label="City" htmlFor="city" required>
          <input
            id="city"
            type="text"
            placeholder="e.g. Raipur"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Area / Locality" htmlFor="locality" required>
          <input
            id="locality"
            type="text"
            placeholder="e.g. Shankar Nagar"
            value={form.locality}
            onChange={(e) => update("locality", e.target.value)}
            className={inputClass}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Nearby Landmark" htmlFor="landmark" optional>
            <input
              id="landmark"
              type="text"
              placeholder="e.g. Near City Mall"
              value={form.landmark}
              onChange={(e) => update("landmark", e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>
      </Section>

      <Section
        icon={<BuildingIcon />}
        title="Property Details & Pricing"
        subtitle="Specifications, features, and price"
      >
        <FormField label="Price (₹)" htmlFor="price" required>
          <div className="flex items-center border border-navy-700/60 bg-navy-950 px-4 transition focus-within:border-gold-400">
            <span className="text-sm text-muted">₹</span>
            <input
              id="price"
              type="number"
              min="0"
              autoComplete="off"
              placeholder="Enter total amount"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className="h-14 w-full bg-transparent px-3 text-cream placeholder:text-muted focus:outline-none"
            />
          </div>
        </FormField>
        <FormField label="Price Negotiable?" optional>
          <ToggleTwo
            options={YES_NO_OPTIONS}
            value={form.negotiable}
            onChange={(value) => update("negotiable", value)}
          />
        </FormField>
        <FormField label="Total Area" htmlFor="areaSize" required>
          <div className="flex gap-2">
            <input
              id="areaSize"
              type="number"
              min="0"
              autoComplete="off"
              placeholder="Area size"
              value={form.areaSize}
              onChange={(e) => update("areaSize", e.target.value)}
              className={`${inputClass} min-w-0 flex-1`}
            />
            <select
              value={form.areaUnit}
              onChange={(e) => update("areaUnit", e.target.value)}
              className="h-14 w-28 shrink-0 appearance-none border border-navy-700/60 bg-navy-950 px-3 text-cream outline-none transition focus:border-gold-400"
            >
              {AREA_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </FormField>
        <FormField label="Floor No." htmlFor="floorNo" optional>
          <input
            id="floorNo"
            type="text"
            placeholder="e.g. 3rd Floor"
            value={form.floorNo}
            onChange={(e) => update("floorNo", e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Total Floors in Building" htmlFor="totalFloors" optional>
          <input
            id="totalFloors"
            type="number"
            min="0"
            autoComplete="off"
            placeholder="e.g. 8"
            value={form.totalFloors}
            onChange={(e) => update("totalFloors", e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Furnishing Status" htmlFor="furnishing" optional>
          <select
            id="furnishing"
            value={form.furnishing}
            onChange={(e) => update("furnishing", e.target.value)}
            className={selectClass}
          >
            <option value="">Select</option>
            {FURNISHING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Parking Available" optional>
          <ToggleTwo
            options={YES_NO_OPTIONS}
            value={form.parking}
            onChange={(value) => update("parking", value)}
          />
        </FormField>
        <FormField label="Facing Direction" htmlFor="facing" optional>
          <select
            id="facing"
            value={form.facing}
            onChange={(e) => update("facing", e.target.value)}
            className={selectClass}
          >
            <option value="">Select</option>
            {FACING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Available From" htmlFor="availableFrom" optional>
          <input
            id="availableFrom"
            type="date"
            value={form.availableFrom}
            onChange={(e) => update("availableFrom", e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Preferred For" htmlFor="preferredFor" optional>
          <select
            id="preferredFor"
            value={form.preferredFor}
            onChange={(e) => update("preferredFor", e.target.value)}
            className={selectClass}
          >
            <option value="">Select</option>
            {PREFERRED_FOR_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </FormField>
      </Section>

      <Section icon={<CameraIcon />} title="Photos" subtitle="Optional — add images to attract more buyers">
        <div className="sm:col-span-2">
          <CoverImageUpload
            id="coverImage"
            label="Cover Image"
            hint="Main photo shown in listings · JPEG, PNG or WEBP up to 10MB"
            file={form.coverImage}
            onChange={(file) => update("coverImage", file)}
            optional
          />
        </div>
        <div className="sm:col-span-2">
          <GalleryImageUpload
            id="galleryImages"
            label="Additional Photos"
            hint="Add up to 10 more photos · JPEG, PNG or WEBP up to 10MB each"
            files={form.galleryImages}
            onChange={(files) => update("galleryImages", files)}
            optional
            max={10}
          />
        </div>
      </Section>

      <Section icon={<UserIcon />} title="Contact Details" subtitle="So our team can reach you">
        <FormField label="Full Name" htmlFor="fullName" required>
          <input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className={inputClass}
          />
        </FormField>
        <FormField label="Mobile Number" htmlFor="mobile" required>
          <div className="flex items-center border border-navy-700/60 bg-navy-950 px-4 transition focus-within:border-gold-400">
            <span className="text-sm text-muted">+91</span>
            <input
              id="mobile"
              type="tel"
              inputMode="numeric"
              placeholder="0000 000 000"
              value={form.mobile}
              onChange={(e) => update("mobile", formatMobile(e.target.value))}
              className="h-14 w-full bg-transparent px-3 text-cream placeholder:text-muted focus:outline-none"
            />
          </div>
        </FormField>
      </Section>

      {error && <p className="text-center text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="tracked-label bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Property"}
      </button>
      <p className="text-center text-xs text-muted">
        By submitting, you agree to our{" "}
        <Link href="/legal/privacy-policy" className="text-gold-400 hover:text-gold-300">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}

function Section({ icon, title, subtitle, children }) {
  return (
    <div className="border border-navy-700/60 bg-navy-900">
      <div className="flex items-center gap-4 border-b border-navy-700/60 px-5 py-4 sm:px-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-400/10 text-gold-400">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-cream sm:text-base">{title}</h2>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:gap-6 sm:p-6">{children}</div>
    </div>
  );
}

function ToggleTwo({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`tracked-label flex h-14 items-center justify-center border text-xs transition ${
            value === opt.value
              ? "border-gold-400 bg-gold-400 text-navy-950"
              : "border-navy-700/60 text-muted hover:border-gold-400 hover:text-cream"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ClipboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75h6a1 1 0 0 1 1 1V6h1.5A1.5 1.5 0 0 1 19 7.5v11.25A1.5 1.5 0 0 1 17.5 20.25h-11A1.5 1.5 0 0 1 5 18.75V7.5A1.5 1.5 0 0 1 6.5 6H8v-1.25a1 1 0 0 1 1-1Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75h6M9 16h4.5" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6.75-5.86-6.75-11A6.75 6.75 0 0 1 12 3.25 6.75 6.75 0 0 1 18.75 10c0 5.14-6.75 11-6.75 11Z" />
      <circle cx="12" cy="10" r="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 21V5.25A1.5 1.5 0 0 1 6 3.75h7.5a1.5 1.5 0 0 1 1.5 1.5V21M4.5 21h13.5M19.5 21v-9a1.5 1.5 0 0 0-1.5-1.5h-3M8 7.5h1.5M8 11h1.5M8 14.5h1.5M12 7.5h1.5M12 11h1.5M12 14.5h1.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <circle cx="12" cy="8.25" r="3.25" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 20.25a7 7 0 0 1 14 0" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8.25A1.75 1.75 0 0 1 5.75 6.5h1.94l.87-1.45A1.5 1.5 0 0 1 9.85 4.3h4.3a1.5 1.5 0 0 1 1.29.75l.87 1.45h1.94A1.75 1.75 0 0 1 20 8.25v9A1.75 1.75 0 0 1 18.25 19H5.75A1.75 1.75 0 0 1 4 17.25v-9Z" />
      <circle cx="12" cy="12.5" r="3.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
