"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { formatMobile, isMobileValid, generateAccountId } from "@/lib/auth";
import { inputClass, selectClass } from "@/components/auth/inputStyles";
import FormField from "@/components/auth/FormField";
import { CoverImageUpload, GalleryImageUpload, VideoUpload } from "@/components/property/PropertyImageUpload";
import { MdContentPaste, MdLocationOn, MdApartment, MdCameraAlt, MdPerson } from "react-icons/md";
import { CATEGORIES_BY_TYPE } from "@/lib/properties";
import { uploadFileToR2, uploadFilesToR2 } from "@/lib/uploadToR2";

const PURPOSE_OPTIONS = [
  { value: "sale", label: "Sale" },
  { value: "rent", label: "Rent" },
  { value: "lease", label: "Lease" },
];

const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const SECTION_OPTIONS = [
  { value: "residential", label: "Residential (Buy/Sell/Rent)" },
  { value: "commercial", label: "Commercial" },
  { value: "farming", label: "Farming Land" },
  { value: "industrial", label: "Industrial" },
  { value: "invest", label: "Investment Property" },
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

const PREFERRED_FOR_OPTIONS = [
  "Family",
  "Bachelors",
  "Working Professionals",
  "Students",
  "Live-in Relationship / Couples",
  "Government Employee",
  "Corporate / Company",
  "Newly Married Couple",
  "Single Woman",
  "Single Man",
  "Senior Citizens",
  "NRI",
  "Anyone",
];

const INITIAL_FORM = {
  section: "residential",
  purpose: "sale",
  title: "",
  propertyType: "",
  category: "",
  city: "",
  locality: "",
  landmark: "",
  address: "",
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
  video: null,
  existingCoverUrl: "",
  existingGalleryUrls: [],
  existingVideoUrl: "",
  fullName: "",
  mobile: "",
};

export default function PostPropertyForm({ editId }) {
  const [propertyId, setPropertyId] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const [loadingProperty, setLoadingProperty] = useState(!!editId);
  const [originalAddedDate, setOriginalAddedDate] = useState("");

  useEffect(() => {
    if (editId) return;
    const timer = setTimeout(() => {
      setPropertyId(generateAccountId("PROP"));
    }, 0);
    return () => clearTimeout(timer);
  }, [editId]);

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    fetch(`/api/properties/${editId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.success) throw new Error(data.error || "Failed to load property");
        const p = data.data;
        const isResidentialType = ["rent", "lease", "sell"].includes(p.type);
        setPropertyId(p.id);
        setOriginalAddedDate(p.addedDate || "");
        setForm({
          section: isResidentialType ? "residential" : p.type || "residential",
          purpose: p.type === "sell" ? "sale" : p.type === "rent" ? "rent" : p.type === "lease" ? "lease" : "sale",
          title: p.title || "",
          propertyType: isResidentialType ? p.propertyType || "" : "",
          category: p.category || "",
          city: p.city || "",
          locality: p.locality || "",
          landmark: p.landmark || "",
          address: p.address || "",
          price: p.rawPrice ? String(p.rawPrice) : "",
          negotiable: p.negotiable || "",
          areaSize: p.areaSize ? String(p.areaSize) : "",
          areaUnit: p.areaUnit || "sq ft",
          floorNo: p.floorNo || "",
          totalFloors: p.totalFloors ? String(p.totalFloors) : "",
          furnishing: p.furnishing || "",
          parking: p.parking || "",
          facing: p.facing || "",
          availableFrom: p.availableFrom || "",
          preferredFor: p.preferredFor || "",
          coverImage: null,
          galleryImages: [],
          video: null,
          existingCoverUrl: p.image || "",
          existingGalleryUrls: p.galleryImages || [],
          existingVideoUrl: p.video || "",
          fullName: p.contact?.fullName || "",
          mobile: (p.contact?.mobile || "").replace(/^\+91\s*/, "").trim(),
        });
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(err.message || "Failed to load property for editing.");
      })
      .finally(() => {
        if (!cancelled) setLoadingProperty(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editId]);

  function update(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "section") {
        next.category = "";
        next.propertyType = "";
      }
      return next;
    });
  }

  const isResidential = form.section === "residential";

  async function handleSubmit(event) {
    event.preventDefault();
    if (
      !form.title.trim() ||
      (isResidential ? !form.propertyType : !form.category) ||
      !form.city.trim() ||
      !form.locality.trim() ||
      !form.price ||
      !form.areaSize ||
      !form.fullName.trim() ||
      !isMobileValid(form.mobile)
    ) {
      setError("Please fill in all required fields.");
      toast.error("Please fill in all required fields.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      let coverImageUrl = form.existingCoverUrl || "/defaultImage.webp";
      let galleryImageUrls = [...form.existingGalleryUrls];
      let videoUrl = form.existingVideoUrl || "";

      if (form.coverImage || form.galleryImages.length || form.video) {
        setUploadStatus("Optimising & uploading photos and video… this can take a minute.");
        const [uploadedCover, uploadedGallery, uploadedVideo] = await Promise.all([
          form.coverImage ? uploadFileToR2(form.coverImage, "properties/cover") : Promise.resolve(null),
          form.galleryImages.length ? uploadFilesToR2(form.galleryImages, "properties/gallery") : Promise.resolve([]),
          form.video ? uploadFileToR2(form.video, "properties/video", setUploadStatus) : Promise.resolve(null),
        ]);
        if (uploadedCover) coverImageUrl = uploadedCover;
        galleryImageUrls = [...galleryImageUrls, ...uploadedGallery];
        if (uploadedVideo) videoUrl = uploadedVideo;
        setUploadStatus("");
      }

      const numericPrice = Number(form.price) || 0;
      let formattedPrice = `₹${numericPrice.toLocaleString("en-IN")}`;
      if (numericPrice >= 10000000) {
        formattedPrice = `₹${(numericPrice / 10000000).toFixed(2)} Cr`;
      } else if (numericPrice >= 100000) {
        formattedPrice = `₹${(numericPrice / 100000).toFixed(2)} Lakh`;
      }
      if (form.purpose === "rent" || form.purpose === "lease") {
        formattedPrice += " /mo";
      }

      const localityStr = (form.locality || "").trim();
      const cityStr = (form.city || "").trim();
      const locationStr = localityStr && cityStr ? `${localityStr}, ${cityStr}` : localityStr || cityStr;

      const categoryLabel = !isResidential
        ? CATEGORIES_BY_TYPE[form.section]?.find((c) => c.key === form.category)?.label || ""
        : "";

      const payload = {
        id: propertyId || `PROP-${Date.now()}`,
        title: (form.title || "").trim(),
        purpose: form.purpose,
        type: isResidential
          ? form.purpose === "rent"
            ? "rent"
            : form.purpose === "lease"
              ? "lease"
              : "sell"
          : form.section,
        propertyType: isResidential ? form.propertyType : categoryLabel,
        category: isResidential ? "" : form.category,
        price: formattedPrice,
        rawPrice: numericPrice,
        location: locationStr,
        city: cityStr,
        locality: localityStr,
        landmark: (form.landmark || "").trim(),
        address: (form.address || "").trim(),
        area: `${form.areaSize || 0} ${form.areaUnit || "sq ft"}`,
        areaSize: Number(form.areaSize) || 0,
        areaUnit: form.areaUnit || "sq ft",
        beds: Number(form.beds) || 0,
        baths: Number(form.baths) || 0,
        floorNo: form.floorNo || "",
        totalFloors: form.totalFloors ? Number(form.totalFloors) : null,
        furnishing: form.furnishing || "",
        parking: form.parking || "",
        facing: form.facing || "",
        availableFrom: form.availableFrom || "",
        preferredFor: form.preferredFor || "",
        contact: {
          fullName: (form.fullName || "").trim(),
          mobile: `+91 ${(form.mobile || "").trim()}`,
        },
        status: "Pending Review",
        featured: false,
        image: coverImageUrl,
        galleryImages: galleryImageUrls,
        video: videoUrl,
        addedDate:
          editId && originalAddedDate
            ? originalAddedDate
            : new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
      };

      const res = await fetch(editId ? `/api/properties/${editId}` : "/api/properties", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Submission failed");
      }
      setSubmitting(false);
      toast.success(editId ? "Property updated successfully." : "Property submitted successfully.");
      setSubmittedId(propertyId);
    } catch (err) {
      console.error("PostPropertyForm submit error:", err);
      setSubmitting(false);
      setUploadStatus("");
      setError(err.message || "Failed to submit property. Please try again.");
      toast.error(err.message || "Failed to submit property. Please try again.");
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setPropertyId(generateAccountId("PROP"));
    setSubmittedId("");
    setError("");
  }

  if (loadingProperty) {
    return (
      <div className="border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
        <p className="text-muted">Loading property details…</p>
      </div>
    );
  }

  if (submittedId) {
    return (
      <div className="flex flex-col items-center gap-6 border border-navy-700/60 bg-navy-900 p-8 text-center sm:p-10">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-400 text-3xl text-gold-400">
          ✓
        </span>
        <div>
          <h1 className="font-display text-2xl text-cream sm:text-3xl">
            {editId ? "Property Updated Successfully" : "Property Submitted Successfully"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {editId
              ? "Your changes have been saved and the listing has been sent back for review."
              : "Your property is under review. Our team will verify the details and get in touch shortly."}
          </p>
        </div>
        <div className="w-full border border-navy-700/60 bg-navy-950 p-4">
          <p className="tracked-label text-xs text-muted">Property ID</p>
          <p className="mt-2 font-display text-lg tracking-widest text-gold-400">{submittedId}</p>
        </div>
        <div className="flex w-full flex-col gap-3">
          {editId ? (
            <Link
              href={`/property/${submittedId}`}
              className="tracked-label bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 transition hover:bg-gold-300"
            >
              View Listing
            </Link>
          ) : (
            <Link
              href="/"
              className="tracked-label bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 transition hover:bg-gold-300"
            >
              Return Home
            </Link>
          )}
          {editId ? (
            <Link
              href="/portal/common-person"
              className="tracked-label border border-navy-700/60 px-6 py-4 text-center text-xs text-cream transition hover:border-gold-400"
            >
              Back to My Listings
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="tracked-label border border-navy-700/60 px-6 py-4 text-xs text-cream transition hover:border-gold-400"
            >
              Post Another Property
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Section icon={<MdContentPaste className="h-5 w-5" />} title="Property Identity" subtitle="Basic info about your listing">
        <FormField label="Property ID" htmlFor="propertyId">
          <div className="flex h-14 items-center justify-between border border-navy-700/60 bg-navy-950 px-4">
            <span className="font-display text-sm tracking-widest text-gold-400">
              {propertyId ? `#${propertyId}` : "#SG-PROP-......"}
            </span>
            <span className="text-xs text-muted">Auto-generated</span>
          </div>
        </FormField>
        <FormField label="Listing Section" htmlFor="section" required hint="Where this property will be listed">
          <select
            id="section"
            value={form.section}
            onChange={(e) => update("section", e.target.value)}
            className={selectClass}
          >
            {SECTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>
        {isResidential && (
          <FormField label="Purpose" required>
            <ToggleTwo
              options={PURPOSE_OPTIONS}
              value={form.purpose}
              onChange={(value) => update("purpose", value)}
            />
          </FormField>
        )}
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
        {isResidential ? (
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
        ) : (
          <FormField label="Category" htmlFor="category" required>
            <select
              id="category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className={selectClass}
            >
              <option value="">Select category</option>
              {(CATEGORIES_BY_TYPE[form.section] || []).map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </FormField>
        )}
      </Section>

      <Section icon={<MdLocationOn className="h-5 w-5" />} title="Location" subtitle="City and area — no full address required">
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
        icon={<MdApartment className="h-5 w-5" />}
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

      <Section icon={<MdCameraAlt className="h-5 w-5" />} title="Photos & Video" subtitle="Optional — add images and a video to attract more buyers">
        <div className="sm:col-span-2">
          <CoverImageUpload
            id="coverImage"
            label="Cover Image"
            hint="Main photo shown in listings · JPEG, PNG or WEBP up to 10MB"
            file={form.coverImage}
            existingUrl={form.existingCoverUrl}
            onRemoveExisting={() => update("existingCoverUrl", "")}
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
            existingUrls={form.existingGalleryUrls}
            onRemoveExisting={(index) =>
              update(
                "existingGalleryUrls",
                form.existingGalleryUrls.filter((_, i) => i !== index)
              )
            }
            onChange={(files) => update("galleryImages", files)}
            optional
            max={10}
          />
        </div>
        <div className="sm:col-span-2">
          <VideoUpload
            id="video"
            label="Property Video"
            hint="MP4, WEBM or MOV up to 100MB"
            file={form.video}
            existingUrl={form.existingVideoUrl}
            onRemoveExisting={() => update("existingVideoUrl", "")}
            onChange={(file) => update("video", file)}
            optional
          />
        </div>
        {uploadStatus && (
          <div className="sm:col-span-2">
            <p className="tracked-label text-xs text-gold-400">{uploadStatus}</p>
          </div>
        )}
      </Section>

      <Section icon={<MdPerson className="h-5 w-5" />} title="Contact Details" subtitle="So our team can reach you">
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
        {submitting ? "Saving..." : editId ? "Save Changes" : "Submit Property"}
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
  const colClass = options.length === 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <div className={`grid ${colClass} gap-2`}>
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
