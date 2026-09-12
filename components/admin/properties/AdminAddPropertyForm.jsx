/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MdArrowBack,
  MdContentPaste,
  MdLocationOn,
  MdApartment,
  MdCameraAlt,
  MdPerson,
  MdAdminPanelSettings,
  MdCloudUpload,
  MdDelete,
  MdCheckCircle,
  MdLink,
  MdImage,
} from "react-icons/md";
import AdminFormField, {
  adminInputClass,
  adminSelectClass,
} from "@/components/admin/ui/AdminFormField";
import adminAxios from "@/lib/adminAxios";
import { CATEGORIES_BY_TYPE } from "@/lib/properties";
import { uploadFileToR2 } from "@/lib/uploadToR2";

const PURPOSE_OPTIONS = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
  { value: "lease", label: "For Lease" },
];

const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const PROPERTY_TYPES = [
  "Flat",
  "House",
  "Villa",
  "Shop",
  "Plot",
  "Office",
  "Warehouse",
  "Commercial Space",
  "Penthouse",
  "Agricultural Land",
];

const PLATFORM_TYPES = [
  "buy",
  "sell",
  "rent",
  "invest",
  "commercial",
  "farming",
  "industrial",
  "lease",
  "seized-property",
];

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

const STATUS_OPTIONS = ["Active", "Pending Review", "Rejected"];

export default function AdminAddPropertyForm() {
  const router = useRouter();

  const [propertyId, setPropertyId] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [errors, setErrors] = useState({});

  // Cover image mode: "file" | "url"
  const [coverMode, setCoverMode] = useState("file");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [coverFile, setCoverFile] = useState(null);

  // Gallery images (array of base64 preview or URL strings)
  const [galleryImages, setGalleryImages] = useState([]);
  // Parallel array: File object if the entry at the same index is a pending upload, null if it's already a URL
  const [galleryMeta, setGalleryMeta] = useState([]);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");

  // Property video
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");

  const [form, setForm] = useState({
    purpose: "sale",
    type: "buy",
    category: "",
    title: "",
    propertyType: "Flat",
    city: "",
    locality: "",
    landmark: "",
    address: "",
    price: "",
    negotiable: "no",
    areaSize: "",
    areaUnit: "sq ft",
    beds: "",
    baths: "",
    floorNo: "",
    totalFloors: "",
    furnishing: "",
    parking: "yes",
    facing: "",
    availableFrom: "",
    preferredFor: "",
    fullName: "",
    mobile: "",
    status: "Active",
    featured: false,
    badge: "",
  });

  // Client-side auto ID generation avoids hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      setPropertyId(`PROP-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const update = (field, val) => {
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      // Auto-suggest platform category when purpose changes
      if (field === "purpose") {
        if (val === "sale") next.type = "sell";
        if (val === "rent") next.type = "rent";
        if (val === "lease") next.type = "lease";
      }
      if (field === "type") {
        next.category = "";
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Format mobile number
  const handleMobileChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    let formatted = raw;
    if (raw.length > 5) {
      formatted = `${raw.slice(0, 5)} ${raw.slice(5)}`;
    }
    update("mobile", formatted);
  };

  // Cover Image File selection
  const handleCoverFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover image should be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCoverPreview(reader.result);
      setCoverFile(file);
      setCoverUrl("");
    };
    reader.readAsDataURL(file);
  };

  // Gallery File selection
  const handleGalleryFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (galleryImages.length + files.length > 10) {
      toast.error("Maximum 10 gallery photos allowed");
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 5MB limit`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setGalleryImages((prev) => [...prev, reader.result]);
        setGalleryMeta((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryMeta((prev) => prev.filter((_, i) => i !== index));
  };

  const addGalleryFromUrl = () => {
    if (!galleryUrlInput.trim()) return;
    if (galleryImages.length >= 10) {
      toast.error("Maximum 10 gallery photos allowed");
      return;
    }
    setGalleryImages((prev) => [...prev, galleryUrlInput.trim()]);
    setGalleryMeta((prev) => [...prev, null]);
    setGalleryUrlInput("");
  };

  // Video File selection
  const handleVideoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video should be under 100MB");
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview("");
  };

  // Form validation
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Property title is required";
    if (!form.propertyType) errs.propertyType = "Property type is required";
    if (CATEGORIES_BY_TYPE[form.type] && !form.category) errs.category = "Category is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.locality.trim()) errs.locality = "Area / Locality is required";
    if (!form.price || Number(form.price) <= 0) errs.price = "Valid price is required";
    if (!form.areaSize || Number(form.areaSize) <= 0) errs.areaSize = "Area size is required";
    if (!form.fullName.trim()) errs.fullName = "Contact name is required";
    const cleanMobile = form.mobile.replace(/\s+/g, "");
    if (!cleanMobile || cleanMobile.length !== 10) {
      errs.mobile = "Enter a valid 10-digit mobile number";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Please fill in all required fields marked with *");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    try {
      let finalImage = coverMode === "url" ? coverUrl.trim() : "";

      if (coverMode === "file" || coverFile || galleryMeta.some(Boolean) || videoFile) {
        setUploadStatus("Uploading photos & video…");
      }

      if (coverMode === "file" && coverFile) {
        finalImage = await uploadFileToR2(coverFile, "properties/cover");
      }
      if (!finalImage) {
        finalImage =
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop";
      }

      const finalGalleryImages = await Promise.all(
        galleryImages.map((img, idx) =>
          galleryMeta[idx] ? uploadFileToR2(galleryMeta[idx], "properties/gallery") : Promise.resolve(img)
        )
      );

      const finalVideo = videoFile ? await uploadFileToR2(videoFile, "properties/video") : "";

      setUploadStatus("");

      // Formatted price string for platform cards
      const numericPrice = Number(form.price);
      let formattedPrice = `₹${numericPrice.toLocaleString("en-IN")}`;
      if (numericPrice >= 10000000) {
        formattedPrice = `₹${(numericPrice / 10000000).toFixed(2)} Cr`;
      } else if (numericPrice >= 100000) {
        formattedPrice = `₹${(numericPrice / 100000).toFixed(2)} Lakh`;
      }
      if (form.purpose === "rent" || form.purpose === "lease") {
        formattedPrice += " /mo";
      }

      const propertyPayload = {
        id: propertyId || `PROP-${Date.now()}`,
        title: form.title.trim(),
        purpose: form.purpose,
        type: form.type,
        propertyType: form.propertyType,
        category: form.category || "",
        price: formattedPrice,
        rawPrice: numericPrice,
        negotiable: form.negotiable,
        location: `${form.locality.trim()}, ${form.city.trim()}`,
        city: form.city.trim(),
        locality: form.locality.trim(),
        landmark: form.landmark.trim(),
        address: form.address.trim(),
        area: `${form.areaSize} ${form.areaUnit}`,
        areaSize: Number(form.areaSize),
        areaUnit: form.areaUnit,
        beds: Number(form.beds) || 0,
        baths: Number(form.baths) || 0,
        floorNo: form.floorNo,
        totalFloors: form.totalFloors ? Number(form.totalFloors) : null,
        furnishing: form.furnishing,
        parking: form.parking,
        facing: form.facing,
        availableFrom: form.availableFrom,
        preferredFor: form.preferredFor,
        image: finalImage,
        galleryImages: finalGalleryImages.length ? finalGalleryImages : [finalImage],
        video: finalVideo,
        contact: {
          fullName: form.fullName.trim(),
          mobile: `+91 ${form.mobile.trim()}`,
        },
        status: form.status,
        featured: form.featured,
        badge: form.badge.trim() || (form.featured ? "Featured" : ""),
        addedDate: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };

      // 1. Post directly to MongoDB via Next.js API
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyPayload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save property to database");
      }

      // 2. Also record in adminAxios for activity log and local cache
      try {
        await adminAxios.post("/admin/properties", propertyPayload);
      } catch {
        // non-fatal
      }

      toast.success("Property added successfully to database!");
      router.push("/admin/properties");
    } catch (err) {
      console.error("Add property error:", err);
      toast.error(err.message || "Failed to save property. Please try again.");
      setUploadStatus("");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all fields in this form?")) {
      setForm({
        purpose: "sale",
        type: "buy",
        category: "",
        title: "",
        propertyType: "Flat",
        city: "",
        locality: "",
        landmark: "",
        address: "",
        price: "",
        negotiable: "no",
        areaSize: "",
        areaUnit: "sq ft",
        beds: "",
        baths: "",
        floorNo: "",
        totalFloors: "",
        furnishing: "",
        parking: "yes",
        facing: "",
        availableFrom: "",
        preferredFor: "",
        fullName: "",
        mobile: "",
        status: "Active",
        featured: false,
        badge: "",
      });
      setCoverPreview("");
      setCoverUrl("");
      setCoverFile(null);
      setGalleryImages([]);
      setGalleryMeta([]);
      setVideoFile(null);
      setVideoPreview("");
      setErrors({});
      toast.info("Form reset to default values");
    }
  };

  return (
    <div className="mx-auto max-w-5xl pb-16">
      {/* Top Header Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.push("/admin/properties")}
            className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#9ca3af] transition hover:text-[#1a1a2e]"
          >
            <MdArrowBack size={16} /> Back to Properties
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1a1a2e] sm:text-3xl">Add Property</h1>
            <span className="rounded-full border border-[#f0b429]/40 bg-[#fff8e1] px-2.5 py-0.5 text-xs font-semibold text-[#d97706]">
              {propertyId || "PROP-..."}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#9ca3af]">
            Create and publish a new property listing with complete details, media, and contact information.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="h-10 rounded-xl border border-[#e8e0d5] bg-white px-4 text-xs font-semibold text-[#6b7280] transition hover:bg-[#faf8f5] disabled:opacity-50"
          >
            Reset Form
          </button>
          <button
            type="submit"
            form="admin-add-property-form"
            disabled={saving}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#f0b429] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d97706] disabled:opacity-60"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving Property...
              </span>
            ) : (
              <>
                <MdCheckCircle size={18} />
                Save Property
              </>
            )}
          </button>
        </div>
      </div>

      <form id="admin-add-property-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Property Identity */}
        <FormSection
          icon={<MdContentPaste size={20} className="text-[#f0b429]" />}
          title="Property Identity & Purpose"
          subtitle="Basic listing categorization, purpose, and title"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Auto ID Display */}
            <div>
              <AdminFormField label="Property ID">
                <div className="flex h-11 items-center justify-between rounded-xl border border-[#e8e0d5] bg-[#f0ebe3]/40 px-3">
                  <span className="font-mono text-xs font-bold text-[#d97706]">
                    {propertyId || "PROP-..."}
                  </span>
                  <span className="text-[10px] text-[#9ca3af] uppercase tracking-wider">
                    Auto-generated
                  </span>
                </div>
              </AdminFormField>
            </div>

            {/* Purpose: Sale vs Rent */}
            <div>
              <AdminFormField label="Listing Purpose" required>
                <div className="grid grid-cols-3 gap-2">
                  {PURPOSE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("purpose", opt.value)}
                      className={`h-11 rounded-xl border text-xs font-semibold transition ${
                        form.purpose === opt.value
                          ? "border-[#f0b429] bg-[#fff8e1] text-[#d97706]"
                          : "border-[#e8e0d5] bg-[#faf8f5] text-[#6b7280] hover:bg-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </AdminFormField>
            </div>

            {/* Platform Route/Category */}
            <div>
              <AdminFormField
                label="Listing Category"
                id="prop-type"
                hint="Used for filtering on portal"
                required
              >
                <select
                  id="prop-type"
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                  className={adminSelectClass}
                >
                  {PLATFORM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>

            {/* Category (commercial / farming / industrial / invest sub-category) */}
            {CATEGORIES_BY_TYPE[form.type] && (
              <div>
                <AdminFormField
                  label="Category"
                  id="prop-category"
                  hint="Sub-category shown on the /invest, /commercial, /farming, /industrial pages"
                  required
                  error={errors.category}
                >
                  <select
                    id="prop-category"
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className={adminSelectClass}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES_BY_TYPE[form.type].map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </AdminFormField>
              </div>
            )}

            {/* Property Title */}
            <div className="sm:col-span-2 lg:col-span-2">
              <AdminFormField
                label="Property Title"
                id="prop-title"
                required
                error={errors.title}
                hint={`${form.title.length}/80 characters`}
              >
                <input
                  id="prop-title"
                  type="text"
                  maxLength={80}
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Spacious 3 BHK Luxury Apartment with Garden View"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            {/* Property Type (Flat, Villa, etc.) */}
            <div>
              <AdminFormField
                label="Property Sub-Type"
                id="prop-property-type"
                required
                error={errors.propertyType}
              >
                <select
                  id="prop-property-type"
                  value={form.propertyType}
                  onChange={(e) => update("propertyType", e.target.value)}
                  className={adminSelectClass}
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>
          </div>
        </FormSection>

        {/* Section 2: Location */}
        <FormSection
          icon={<MdLocationOn size={20} className="text-[#f0b429]" />}
          title="Location Details"
          subtitle="City, area locality, and landmark"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <AdminFormField label="City" id="prop-city" required error={errors.city}>
                <input
                  id="prop-city"
                  type="text"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="e.g. Bangalore"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            <div>
              <AdminFormField
                label="Area / Locality"
                id="prop-locality"
                required
                error={errors.locality}
              >
                <input
                  id="prop-locality"
                  type="text"
                  value={form.locality}
                  onChange={(e) => update("locality", e.target.value)}
                  placeholder="e.g. Indiranagar, 100ft Road"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            <div>
              <AdminFormField label="Nearby Landmark" id="prop-landmark" hint="Optional reference point">
                <input
                  id="prop-landmark"
                  type="text"
                  value={form.landmark}
                  onChange={(e) => update("landmark", e.target.value)}
                  placeholder="e.g. Near Metro Station / Forum Mall"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <AdminFormField label="Full Address / Street Note" id="prop-address" hint="Optional full address details">
                <input
                  id="prop-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="e.g. Flat 402, Oakwood Heights, 12th Main Road"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>
          </div>
        </FormSection>

        {/* Section 3: Property Details & Pricing */}
        <FormSection
          icon={<MdApartment size={20} className="text-[#f0b429]" />}
          title="Property Specifications & Pricing"
          subtitle="Area, layout, rooms, floor, and pricing"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Price */}
            <div className="sm:col-span-2">
              <AdminFormField
                label={`Price (₹) ${form.purpose === "rent" || form.purpose === "lease" ? "- Monthly Rent" : "- Total"}`}
                id="prop-price"
                required
                error={errors.price}
                hint={
                  form.price && Number(form.price) > 0
                    ? `Formatted: ₹${Number(form.price).toLocaleString("en-IN")}`
                    : "Enter total amount in rupees"
                }
              >
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm font-semibold text-[#9ca3af]">₹</span>
                  <input
                    id="prop-price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    placeholder="e.g. 12500000"
                    className={`${adminInputClass} pl-8`}
                  />
                </div>
              </AdminFormField>
            </div>

            {/* Price Negotiable */}
            <div className="sm:col-span-2">
              <AdminFormField label="Price Negotiable?">
                <div className="grid grid-cols-2 gap-2">
                  {YES_NO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("negotiable", opt.value)}
                      className={`h-11 rounded-xl border text-xs font-semibold transition ${
                        form.negotiable === opt.value
                          ? "border-[#f0b429] bg-[#fff8e1] text-[#d97706]"
                          : "border-[#e8e0d5] bg-[#faf8f5] text-[#6b7280] hover:bg-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </AdminFormField>
            </div>

            {/* Total Area + Unit - matching public portal design */}
            <div className="sm:col-span-2">
              <AdminFormField label="Total Area" id="prop-area" required error={errors.areaSize}>
                <div className="flex items-center gap-2">
                  <input
                    id="prop-area"
                    type="number"
                    min="0"
                    value={form.areaSize}
                    onChange={(e) => update("areaSize", e.target.value)}
                    placeholder="Area size"
                    className="h-11 min-w-0 flex-1 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-3 text-sm text-[#1a1a2e] placeholder-[#9ca3af] outline-none transition focus:border-[#f0b429] focus:ring-2 focus:ring-[#f0b429]/20"
                  />
                  <select
                    value={form.areaUnit}
                    onChange={(e) => update("areaUnit", e.target.value)}
                    className="h-11 w-28 sm:w-32 shrink-0 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-3 text-sm text-[#1a1a2e] outline-none transition focus:border-[#f0b429] focus:ring-2 focus:ring-[#f0b429]/20 cursor-pointer"
                  >
                    {AREA_UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </AdminFormField>
            </div>

            {/* Bedrooms */}
            <div>
              <AdminFormField label="Bedrooms (BHK)" id="prop-beds">
                <input
                  id="prop-beds"
                  type="number"
                  min="0"
                  value={form.beds}
                  onChange={(e) => update("beds", e.target.value)}
                  placeholder="e.g. 3"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            {/* Bathrooms */}
            <div>
              <AdminFormField label="Bathrooms" id="prop-baths">
                <input
                  id="prop-baths"
                  type="number"
                  min="0"
                  value={form.baths}
                  onChange={(e) => update("baths", e.target.value)}
                  placeholder="e.g. 2"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            {/* Floor No */}
            <div>
              <AdminFormField label="Floor No." id="prop-floor">
                <input
                  id="prop-floor"
                  type="text"
                  value={form.floorNo}
                  onChange={(e) => update("floorNo", e.target.value)}
                  placeholder="e.g. 4th Floor"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            {/* Total Floors */}
            <div>
              <AdminFormField label="Total Floors in Building" id="prop-total-floors">
                <input
                  id="prop-total-floors"
                  type="number"
                  min="0"
                  value={form.totalFloors}
                  onChange={(e) => update("totalFloors", e.target.value)}
                  placeholder="e.g. 12"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            {/* Furnishing */}
            <div>
              <AdminFormField label="Furnishing Status" id="prop-furnishing">
                <select
                  id="prop-furnishing"
                  value={form.furnishing}
                  onChange={(e) => update("furnishing", e.target.value)}
                  className={adminSelectClass}
                >
                  <option value="">Select Furnishing</option>
                  {FURNISHING_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>

            {/* Parking Available */}
            <div>
              <AdminFormField label="Parking Available">
                <div className="grid grid-cols-2 gap-2">
                  {YES_NO_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("parking", opt.value)}
                      className={`h-11 rounded-xl border text-xs font-semibold transition ${
                        form.parking === opt.value
                          ? "border-[#f0b429] bg-[#fff8e1] text-[#d97706]"
                          : "border-[#e8e0d5] bg-[#faf8f5] text-[#6b7280] hover:bg-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </AdminFormField>
            </div>

            {/* Facing Direction */}
            <div>
              <AdminFormField label="Facing Direction" id="prop-facing">
                <select
                  id="prop-facing"
                  value={form.facing}
                  onChange={(e) => update("facing", e.target.value)}
                  className={adminSelectClass}
                >
                  <option value="">Select Facing</option>
                  {FACING_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>

            {/* Available From */}
            <div>
              <AdminFormField label="Available From" id="prop-avail">
                <input
                  id="prop-avail"
                  type="date"
                  value={form.availableFrom}
                  onChange={(e) => update("availableFrom", e.target.value)}
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            {/* Preferred For */}
            <div className="sm:col-span-2">
              <AdminFormField label="Preferred Tenants / Buyers" id="prop-preferred">
                <select
                  id="prop-preferred"
                  value={form.preferredFor}
                  onChange={(e) => update("preferredFor", e.target.value)}
                  className={adminSelectClass}
                >
                  <option value="">Any Buyer / Tenant</option>
                  {PREFERRED_FOR_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>
          </div>
        </FormSection>

        {/* Section 4: Photos & Media */}
        <FormSection
          icon={<MdCameraAlt size={20} className="text-[#f0b429]" />}
          title="Photos & Visual Media"
          subtitle="Cover image and property photo gallery"
        >
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="rounded-xl border border-[#e8e0d5] bg-[#faf8f5]/60 p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#1a1a2e]">Main Cover Image</h3>
                  <p className="text-xs text-[#9ca3af]">
                    Shown as the primary picture on cards and listing details
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-[#e8e0d5] bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setCoverMode("file")}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      coverMode === "file"
                        ? "bg-[#f0b429] text-white"
                        : "text-[#6b7280] hover:text-[#1a1a2e]"
                    }`}
                  >
                    <MdCloudUpload size={14} /> Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverMode("url")}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      coverMode === "url"
                        ? "bg-[#f0b429] text-white"
                        : "text-[#6b7280] hover:text-[#1a1a2e]"
                    }`}
                  >
                    <MdLink size={14} /> Direct URL
                  </button>
                </div>
              </div>

              {coverMode === "url" ? (
                <div className="space-y-3">
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className={adminInputClass}
                  />
                  {coverUrl && (
                    <div className="relative aspect-video max-w-sm overflow-hidden rounded-xl border border-[#e8e0d5]">
                      <img
                        src={coverUrl}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {coverPreview ? (
                    <div className="relative aspect-video max-w-sm overflow-hidden rounded-xl border border-[#e8e0d5]">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setCoverPreview("")}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600/90 text-white transition hover:bg-red-700"
                        title="Remove cover"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e8e0d5] bg-white px-4 py-8 text-center transition hover:border-[#f0b429]">
                      <MdCloudUpload size={32} className="text-[#f0b429] mb-2" />
                      <span className="text-sm font-semibold text-[#1a1a2e]">
                        Click to upload cover photo
                      </span>
                      <span className="mt-1 text-xs text-[#9ca3af]">
                        JPEG, PNG, or WEBP up to 5MB
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleCoverFile}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* Gallery Images */}
            <div className="rounded-xl border border-[#e8e0d5] bg-[#faf8f5]/60 p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#1a1a2e]">Gallery Photos</h3>
                  <p className="text-xs text-[#9ca3af]">
                    Upload up to 10 additional photos (interior, exterior, amenities)
                  </p>
                </div>
                <span className="rounded-full bg-[#f0ebe3] px-2.5 py-0.5 text-xs font-medium text-[#6b7280]">
                  {galleryImages.length} / 10 photos
                </span>
              </div>

              {/* URL add bar */}
              <div className="mb-4 flex gap-2">
                <input
                  type="url"
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  placeholder="Or paste image URL and click Add"
                  className={`${adminInputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={addGalleryFromUrl}
                  disabled={!galleryUrlInput.trim() || galleryImages.length >= 10}
                  className="rounded-xl border border-[#e8e0d5] bg-white px-4 text-xs font-semibold text-[#374151] transition hover:bg-[#faf8f5] disabled:opacity-50"
                >
                  Add URL
                </button>
              </div>

              {/* Upload Drop area */}
              {galleryImages.length < 10 && (
                <label className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#e8e0d5] bg-white px-4 py-5 text-center transition hover:border-[#f0b429]">
                  <MdImage size={24} className="text-[#9ca3af] mb-1" />
                  <span className="text-xs font-semibold text-[#1a1a2e]">
                    Click to add photos from device
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleGalleryFiles}
                  />
                </label>
              )}

              {/* Thumbnails grid */}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {galleryImages.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-[#e8e0d5] bg-white"
                    >
                      <img
                        src={imgSrc}
                        alt={`Gallery ${idx + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-600/90 text-white opacity-90 transition hover:bg-red-700"
                        title="Remove image"
                      >
                        <MdDelete size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Property Video */}
            <div className="rounded-xl border border-[#e8e0d5] bg-[#faf8f5]/60 p-4 sm:p-5">
              <h3 className="mb-3 text-sm font-semibold text-[#1a1a2e]">Property Video</h3>
              {videoPreview ? (
                <div className="relative overflow-hidden rounded-xl border border-[#e8e0d5] bg-white">
                  <video src={videoPreview} controls className="h-48 w-full object-cover" />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600/90 text-white transition hover:bg-red-700"
                    title="Remove video"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e8e0d5] bg-white px-4 py-8 text-center transition hover:border-[#f0b429]">
                  <MdCloudUpload size={32} className="text-[#f0b429] mb-2" />
                  <span className="text-sm font-semibold text-[#1a1a2e]">Click to upload property video</span>
                  <span className="mt-1 text-xs text-[#9ca3af]">MP4, WEBM, or MOV up to 100MB</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={handleVideoFile}
                  />
                </label>
              )}
            </div>

            {uploadStatus && (
              <p className="text-xs font-semibold text-[#d97706]">{uploadStatus}</p>
            )}
          </div>
        </FormSection>

        {/* Section 5: Contact Details */}
        <FormSection
          icon={<MdPerson size={20} className="text-[#f0b429]" />}
          title="Owner / Lister Contact Details"
          subtitle="Person to contact for inquiries and verification"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <AdminFormField
                label="Full Name / Contact Person"
                id="prop-fullname"
                required
                error={errors.fullName}
              >
                <input
                  id="prop-fullname"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="e.g. John Doe / Simnani Realty"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            <div>
              <AdminFormField
                label="Mobile Number"
                id="prop-mobile"
                required
                error={errors.mobile}
                hint="10-digit Indian mobile number"
              >
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-semibold text-[#9ca3af]">
                    +91
                  </span>
                  <input
                    id="prop-mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={handleMobileChange}
                    placeholder="98765 43210"
                    className={`${adminInputClass} pl-11`}
                  />
                </div>
              </AdminFormField>
            </div>
          </div>
        </FormSection>

        {/* Section 6: Admin Status & Platform Controls */}
        <FormSection
          icon={<MdAdminPanelSettings size={20} className="text-[#f0b429]" />}
          title="Admin Status & Listing Controls"
          subtitle="Publishing status, featured placement, and badges"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <AdminFormField label="Listing Status" id="prop-status">
                <select
                  id="prop-status"
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                  className={adminSelectClass}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>

            <div>
              <AdminFormField
                label="Listing Badge"
                id="prop-badge"
                hint="e.g. Featured, Hot Deal, Verified, Owner Listed"
              >
                <input
                  id="prop-badge"
                  type="text"
                  value={form.badge}
                  onChange={(e) => update("badge", e.target.value)}
                  placeholder="e.g. Verified"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            <div>
              <AdminFormField label="Featured Property?">
                <div className="flex h-11 items-center gap-3 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.featured}
                    onClick={() => update("featured", !form.featured)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                      form.featured ? "bg-[#f0b429]" : "bg-[#e8e0d5]"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                        form.featured ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <span className="text-xs font-semibold text-[#374151]">
                    {form.featured ? "⭐ Yes, show in Featured" : "Standard listing"}
                  </span>
                </div>
              </AdminFormField>
            </div>
          </div>
        </FormSection>

        {/* Bottom Submit Action Bar */}
        <div className="flex flex-col-reverse gap-3 rounded-2xl border border-[#e8e0d5] bg-white p-5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => router.push("/admin/properties")}
            disabled={saving}
            className="h-11 rounded-xl border border-[#e8e0d5] bg-white px-6 text-sm font-semibold text-[#6b7280] transition hover:bg-[#faf8f5] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#f0b429] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d97706] disabled:opacity-60"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving Property...
              </span>
            ) : (
              <>
                <MdCheckCircle size={18} />
                Publish Property Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormSection({ icon, title, subtitle, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8e0d5] bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-[#e8e0d5] px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff8e1]">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-[#1a1a2e]">{title}</h2>
          <p className="text-xs text-[#9ca3af]">{subtitle}</p>
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}
