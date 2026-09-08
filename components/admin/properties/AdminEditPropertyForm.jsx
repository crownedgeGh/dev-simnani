/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  MdRefresh,
} from "react-icons/md";
import AdminFormField, {
  adminInputClass,
  adminSelectClass,
} from "@/components/admin/ui/AdminFormField";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection } from "@/lib/adminStorage";

const PURPOSE_OPTIONS = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
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

const PREFERRED_FOR_OPTIONS = ["Family", "Bachelors", "Company", "Anyone"];

const STATUS_OPTIONS = ["Active", "Pending Review", "Rejected"];

// Helper to parse price string to pure numeric string
function parsePriceToNumber(rawVal) {
  if (!rawVal && rawVal !== 0) return "";
  if (typeof rawVal === "number") return String(rawVal);
  const str = String(rawVal).toLowerCase();
  
  if (str.includes("cr")) {
    const match = str.match(/([0-9.]+)\s*cr/);
    if (match) return String(Math.round(parseFloat(match[1]) * 10000000));
  }
  if (str.includes("lakh") || str.includes("lac")) {
    const match = str.match(/([0-9.]+)\s*(?:lakh|lac)/);
    if (match) return String(Math.round(parseFloat(match[1]) * 100000));
  }
  const digitsOnly = str.replace(/[^0-9]/g, "");
  return digitsOnly || "";
}

// Helper to parse area
function parseArea(property) {
  if (property.areaSize) {
    return {
      size: String(property.areaSize),
      unit: property.areaUnit || "sq ft",
    };
  }
  if (property.area) {
    const areaStr = String(property.area);
    const numMatch = areaStr.replace(/,/g, "").match(/[0-9.]+/);
    const size = numMatch ? numMatch[0] : "";
    let unit = "sq ft";
    if (areaStr.includes("sq m") || areaStr.includes("sq.m")) unit = "sq m";
    else if (areaStr.includes("acre")) unit = "acres";
    else if (areaStr.includes("gaj")) unit = "gaj";
    return { size, unit };
  }
  return { size: "", unit: "sq ft" };
}

// Helper to parse location
function parseLocation(property) {
  if (property.city || property.locality) {
    return {
      city: property.city || "",
      locality: property.locality || "",
      landmark: property.landmark || "",
      address: property.address || "",
    };
  }
  if (property.location) {
    const parts = property.location.split(",").map((s) => s.trim());
    if (parts.length >= 2) {
      return {
        locality: parts[0] || "",
        city: parts.slice(1).join(", ") || "",
        landmark: "",
        address: "",
      };
    }
    return {
      locality: parts[0] || "",
      city: "",
      landmark: "",
      address: "",
    };
  }
  return { city: "", locality: "", landmark: "", address: "" };
}

export default function AdminEditPropertyForm({ propertyId: propIdParam }) {
  const router = useRouter();
  const params = useParams();
  const propertyId = propIdParam || params?.id;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [originalProperty, setOriginalProperty] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Cover image mode: "file" | "url"
  const [coverMode, setCoverMode] = useState("url");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  // Gallery images (array of base64 or URL strings)
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");

  const [form, setForm] = useState({
    purpose: "sale",
    type: "buy",
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

  // Populate form with existing property data
  const populateFormData = (prop) => {
    const loc = parseLocation(prop);
    const area = parseArea(prop);
    const numPrice = prop.rawPrice ? String(prop.rawPrice) : parsePriceToNumber(prop.price);

    let cleanMobile = "";
    if (prop.contact?.mobile) {
      cleanMobile = prop.contact.mobile.replace("+91", "").replace(/\s+/g, "").trim();
      if (cleanMobile.length > 5) {
        cleanMobile = `${cleanMobile.slice(0, 5)} ${cleanMobile.slice(5, 10)}`;
      }
    }

    const determinedPurpose =
      prop.purpose ||
      (prop.type === "rent" || (typeof prop.price === "string" && prop.price.includes("/mo"))
        ? "rent"
        : "sale");

    setForm({
      purpose: determinedPurpose,
      type: prop.type || (determinedPurpose === "rent" ? "rent" : "buy"),
      title: prop.title || "",
      propertyType: prop.propertyType || "Flat",
      city: loc.city,
      locality: loc.locality,
      landmark: loc.landmark,
      address: loc.address,
      price: numPrice,
      negotiable: prop.negotiable || "no",
      areaSize: area.size,
      areaUnit: area.unit,
      beds: prop.beds !== undefined && prop.beds !== null ? String(prop.beds) : "",
      baths: prop.baths !== undefined && prop.baths !== null ? String(prop.baths) : "",
      floorNo: prop.floorNo || "",
      totalFloors: prop.totalFloors ? String(prop.totalFloors) : "",
      furnishing: prop.furnishing || "",
      parking: prop.parking || "yes",
      facing: prop.facing || "",
      availableFrom: prop.availableFrom || "",
      preferredFor: prop.preferredFor || "",
      fullName: prop.contact?.fullName || "Admin Lister",
      mobile: cleanMobile,
      status: prop.status || "Active",
      featured: !!prop.featured,
      badge: prop.badge || "",
    });

    if (prop.image) {
      setCoverPreview(prop.image);
      setCoverUrl(prop.image);
      if (prop.image.startsWith("data:")) {
        setCoverMode("file");
      } else {
        setCoverMode("url");
      }
    }

    if (Array.isArray(prop.galleryImages) && prop.galleryImages.length > 0) {
      setGalleryImages(prop.galleryImages);
    } else if (prop.image) {
      setGalleryImages([prop.image]);
    }
  };

  useEffect(() => {
    if (!propertyId) return;

    const timer = setTimeout(() => {
      const props = readCollection(ADMIN_KEYS.properties) || [];
      const found = props.find((p) => String(p.id) === String(propertyId));

      if (!found) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setOriginalProperty(found);
      populateFormData(found);
      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [propertyId]);

  const update = (field, val) => {
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      if (field === "purpose") {
        if (val === "sale" && next.type === "rent") next.type = "sell";
        if (val === "rent" && next.type === "buy") next.type = "rent";
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
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addGalleryFromUrl = () => {
    if (!galleryUrlInput.trim()) return;
    if (galleryImages.length >= 10) {
      toast.error("Maximum 10 gallery photos allowed");
      return;
    }
    setGalleryImages((prev) => [...prev, galleryUrlInput.trim()]);
    setGalleryUrlInput("");
  };

  // Reset back to original property data
  const handleResetToOriginal = () => {
    if (confirm("Discard unsaved changes and reset to original property data?")) {
      if (originalProperty) {
        populateFormData(originalProperty);
        setErrors({});
        toast.info("Form reset to original values");
      }
    }
  };

  // Form validation
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Property title is required";
    if (!form.propertyType) errs.propertyType = "Property type is required";
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
      const finalImage =
        coverMode === "url"
          ? (coverUrl.trim() || coverPreview || originalProperty?.image)
          : (coverPreview || originalProperty?.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop");

      // Formatted price string for platform cards
      const numericPrice = Number(form.price);
      let formattedPrice = `₹${numericPrice.toLocaleString("en-IN")}`;
      if (numericPrice >= 10000000) {
        formattedPrice = `₹${(numericPrice / 10000000).toFixed(2)} Cr`;
      } else if (numericPrice >= 100000) {
        formattedPrice = `₹${(numericPrice / 100000).toFixed(2)} Lakh`;
      }
      if (form.purpose === "rent") {
        formattedPrice += " /mo";
      }

      const updatedPayload = {
        ...(originalProperty || {}),
        id: propertyId,
        title: form.title.trim(),
        purpose: form.purpose,
        type: form.type,
        propertyType: form.propertyType,
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
        galleryImages: galleryImages.length ? galleryImages : [finalImage],
        contact: {
          fullName: form.fullName.trim(),
          mobile: `+91 ${form.mobile.trim()}`,
        },
        status: form.status,
        featured: form.featured,
        badge: form.badge.trim() || (form.featured ? "Featured" : ""),
        updatedDate: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };

      await adminAxios.put(`/admin/properties/${propertyId}`, updatedPayload);

      toast.success("Property updated successfully!");
      router.push("/admin/properties");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update property. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#f0b429] border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-[#6b7280]">Loading property details...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-2xl border border-[#e8e0d5] bg-white p-12 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-[#d97706]">
          <MdApartment size={32} />
        </div>
        <h2 className="mt-4 text-xl font-bold text-[#1a1a2e]">Property Not Found</h2>
        <p className="mt-2 text-sm text-[#9ca3af]">
          The property ID <code className="font-mono text-[#d97706]">{propertyId}</code> could not be found or has been deleted.
        </p>
        <button
          onClick={() => router.push("/admin/properties")}
          className="mt-6 flex items-center gap-2 rounded-xl bg-[#f0b429] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d97706]"
        >
          <MdArrowBack size={18} />
          Back to Properties
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl pb-16">
      {/* Top Header Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.push(`/admin/properties`)}
            className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#9ca3af] transition hover:text-[#1a1a2e]"
          >
            <MdArrowBack size={16} /> Back to Properties
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1a1a2e] sm:text-3xl">Edit Property</h1>
            <span className="rounded-full border border-[#f0b429]/40 bg-[#fff8e1] px-2.5 py-0.5 text-xs font-semibold text-[#d97706]">
              {propertyId}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                form.status === "Active"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : form.status === "Pending Review"
                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {form.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#9ca3af]">
            Update and manage all details, pricing, photos, and visibility for this listing.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToOriginal}
            disabled={saving}
            className="flex items-center gap-1.5 h-10 rounded-xl border border-[#e8e0d5] bg-white px-4 text-xs font-semibold text-[#6b7280] transition hover:bg-[#faf8f5] disabled:opacity-50"
          >
            <MdRefresh size={16} /> Reset Changes
          </button>
          <button
            type="submit"
            form="admin-edit-property-form"
            disabled={saving}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#f0b429] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d97706] disabled:opacity-60"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving Changes...
              </span>
            ) : (
              <>
                <MdCheckCircle size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <form id="admin-edit-property-form" onSubmit={handleSubmit} className="space-y-6">
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
                    {propertyId}
                  </span>
                  <span className="text-[10px] text-[#9ca3af] uppercase tracking-wider">
                    Read-only ID
                  </span>
                </div>
              </AdminFormField>
            </div>

            {/* Purpose: Sale vs Rent */}
            <div>
              <AdminFormField label="Listing Purpose" required>
                <div className="grid grid-cols-2 gap-2">
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
                label="Platform Category"
                required
                hint="Route where property appears"
              >
                <select
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                  className={adminSelectClass}
                >
                  {PLATFORM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.toUpperCase()}
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>

            {/* Property Title */}
            <div className="sm:col-span-2">
              <AdminFormField
                label="Property Title"
                required
                error={errors.title}
                hint={`${form.title.length}/80 characters`}
              >
                <input
                  type="text"
                  maxLength={80}
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Luxury 3 BHK Sea View Apartment in Bandra"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            {/* Property Type */}
            <div>
              <AdminFormField label="Property Type" required error={errors.propertyType}>
                <select
                  value={form.propertyType}
                  onChange={(e) => update("propertyType", e.target.value)}
                  className={adminSelectClass}
                >
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>
          </div>
        </FormSection>

        {/* Section 2: Location Details */}
        <FormSection
          icon={<MdLocationOn size={20} className="text-[#f0b429]" />}
          title="Location Details"
          subtitle="Accurate city, area, landmark and complete street address"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <AdminFormField label="City" required error={errors.city}>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="e.g. Mumbai, Bangalore, Pune"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            <div>
              <AdminFormField label="Locality / Area" required error={errors.locality}>
                <input
                  type="text"
                  value={form.locality}
                  onChange={(e) => update("locality", e.target.value)}
                  placeholder="e.g. Bandra West, Indiranagar"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            <div>
              <AdminFormField label="Nearby Landmark" hint="Optional">
                <input
                  type="text"
                  value={form.landmark}
                  onChange={(e) => update("landmark", e.target.value)}
                  placeholder="e.g. Near Metro Station / Park"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <AdminFormField label="Full Street Address" hint="Complete postal or building address">
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="e.g. Flat 402, Sunshine Heights, 14th Road"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>
          </div>
        </FormSection>

        {/* Section 3: Property Details & Pricing */}
        <FormSection
          icon={<MdApartment size={20} className="text-[#f0b429]" />}
          title="Pricing & Property Specifications"
          subtitle="Pricing structure, dimensions, layout, and amenities"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Price Input */}
            <div>
              <AdminFormField
                label={`Price (₹) ${form.purpose === "rent" ? "/ month" : ""}`}
                required
                error={errors.price}
                hint={
                  form.price && Number(form.price) > 0
                    ? Number(form.price) >= 10000000
                      ? `≈ ₹${(Number(form.price) / 10000000).toFixed(2)} Crore`
                      : Number(form.price) >= 100000
                      ? `≈ ₹${(Number(form.price) / 100000).toFixed(2)} Lakh`
                      : `₹${Number(form.price).toLocaleString("en-IN")}`
                    : "Enter total numeric amount"
                }
              >
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#9ca3af]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    placeholder={form.purpose === "rent" ? "35000" : "12500000"}
                    className={`${adminInputClass} pl-8`}
                  />
                </div>
              </AdminFormField>
            </div>

            {/* Price Negotiable */}
            <div>
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

            {/* Area & Unit */}
            <div>
              <AdminFormField label="Total Area" required error={errors.areaSize}>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={form.areaSize}
                    onChange={(e) => update("areaSize", e.target.value)}
                    placeholder="1850"
                    className="h-11 min-w-0 flex-1 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-3 text-sm text-[#1a1a2e] placeholder-[#9ca3af] outline-none transition focus:border-[#f0b429] focus:ring-2 focus:ring-[#f0b429]/20"
                  />
                  <select
                    value={form.areaUnit}
                    onChange={(e) => update("areaUnit", e.target.value)}
                    className="h-11 w-24 sm:w-28 shrink-0 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-2.5 sm:px-3 text-sm text-[#1a1a2e] outline-none transition focus:border-[#f0b429] focus:ring-2 focus:ring-[#f0b429]/20 cursor-pointer"
                  >
                    {AREA_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </AdminFormField>
            </div>

            {/* Bedrooms */}
            <div>
              <AdminFormField label="Bedrooms (Beds)">
                <select
                  value={form.beds}
                  onChange={(e) => update("beds", e.target.value)}
                  className={adminSelectClass}
                >
                  <option value="">Select Bedrooms</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} BHK / {n} Beds
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>

            {/* Bathrooms */}
            <div>
              <AdminFormField label="Bathrooms (Baths)">
                <select
                  value={form.baths}
                  onChange={(e) => update("baths", e.target.value)}
                  className={adminSelectClass}
                >
                  <option value="">Select Bathrooms</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} Bathrooms
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>

            {/* Floor Details */}
            <div>
              <AdminFormField label="Floor Info">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.floorNo}
                    onChange={(e) => update("floorNo", e.target.value)}
                    placeholder="Floor (e.g. 4)"
                    className="h-11 min-w-0 flex-1 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-3 text-sm text-[#1a1a2e] placeholder-[#9ca3af] outline-none transition focus:border-[#f0b429] focus:ring-2 focus:ring-[#f0b429]/20"
                  />
                  <span className="text-xs text-[#9ca3af] shrink-0">of</span>
                  <input
                    type="number"
                    min="1"
                    value={form.totalFloors}
                    onChange={(e) => update("totalFloors", e.target.value)}
                    placeholder="Total Floors"
                    className="h-11 min-w-0 flex-1 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-3 text-sm text-[#1a1a2e] placeholder-[#9ca3af] outline-none transition focus:border-[#f0b429] focus:ring-2 focus:ring-[#f0b429]/20"
                  />
                </div>
              </AdminFormField>
            </div>

            {/* Furnishing */}
            <div>
              <AdminFormField label="Furnishing Status">
                <select
                  value={form.furnishing}
                  onChange={(e) => update("furnishing", e.target.value)}
                  className={adminSelectClass}
                >
                  <option value="">Select Furnishing</option>
                  {FURNISHING_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>

            {/* Parking */}
            <div>
              <AdminFormField label="Parking Available?">
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

            {/* Facing */}
            <div>
              <AdminFormField label="Facing Direction">
                <select
                  value={form.facing}
                  onChange={(e) => update("facing", e.target.value)}
                  className={adminSelectClass}
                >
                  <option value="">Select Facing</option>
                  {FACING_OPTIONS.map((fc) => (
                    <option key={fc} value={fc}>
                      {fc}
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>

            {/* Available From */}
            <div>
              <AdminFormField label="Available From" hint="Possession or move-in date">
                <input
                  type="date"
                  value={form.availableFrom}
                  onChange={(e) => update("availableFrom", e.target.value)}
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            {/* Preferred For (Rent) */}
            <div>
              <AdminFormField label="Preferred Tenant / Buyer">
                <select
                  value={form.preferredFor}
                  onChange={(e) => update("preferredFor", e.target.value)}
                  className={adminSelectClass}
                >
                  <option value="">Select Preference</option>
                  {PREFERRED_FOR_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
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
          subtitle="Cover display image and gallery photos (supports upload and URLs)"
        >
          <div className="space-y-6">
            {/* Primary Cover Image Box */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold text-[#1a1a2e]">
                  Primary Cover Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1 rounded-lg border border-[#e8e0d5] bg-[#faf8f5] p-0.5">
                  <button
                    type="button"
                    onClick={() => setCoverMode("url")}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      coverMode === "url"
                        ? "bg-white text-[#d97706] shadow-xs"
                        : "text-[#6b7280] hover:text-[#1a1a2e]"
                    }`}
                  >
                    <MdLink size={14} /> Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverMode("file")}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      coverMode === "file"
                        ? "bg-white text-[#d97706] shadow-xs"
                        : "text-[#6b7280] hover:text-[#1a1a2e]"
                    }`}
                  >
                    <MdCloudUpload size={14} /> Upload File
                  </button>
                </div>
              </div>

              {coverMode === "url" ? (
                <div className="space-y-3">
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => {
                      setCoverUrl(e.target.value);
                      setCoverPreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/... or public image link"
                    className={adminInputClass}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#9ca3af]">Quick presets:</span>
                    {[
                      {
                        name: "Modern Villa",
                        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop",
                      },
                      {
                        name: "Luxury Apt",
                        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop",
                      },
                      {
                        name: "High Rise",
                        url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80&auto=format&fit=crop",
                      },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setCoverUrl(preset.url);
                          setCoverPreview(preset.url);
                        }}
                        className="rounded-md border border-[#e8e0d5] bg-white px-2 py-1 text-[11px] font-medium text-[#6b7280] hover:border-[#f0b429] hover:text-[#d97706]"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e8e0d5] bg-[#faf8f5] p-6 text-center cursor-pointer transition hover:border-[#f0b429]">
                  <MdCloudUpload size={36} className="text-[#d97706]" />
                  <span className="mt-2 text-sm font-semibold text-[#1a1a2e]">
                    Click to upload a new cover image
                  </span>
                  <span className="text-xs text-[#9ca3af]">PNG, JPG, WebP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFile}
                    className="hidden"
                  />
                </label>
              )}

              {/* Cover Image Preview */}
              {coverPreview && (
                <div className="mt-3 flex items-center gap-4 rounded-xl border border-[#e8e0d5] bg-[#faf8f5] p-3">
                  <div className="h-16 w-24 overflow-hidden rounded-lg bg-gray-100 shrink-0">
                    <img
                      src={coverPreview}
                      alt="Cover Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-semibold text-[#1a1a2e]">Active Cover Image</p>
                    <p className="truncate text-xs text-[#9ca3af]">{coverPreview}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverPreview("");
                      setCoverUrl("");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              )}
            </div>

            <hr className="border-[#e8e0d5]" />

            {/* Gallery Images Section */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-[#1a1a2e]">
                    Property Gallery Photos
                  </label>
                  <p className="text-[11px] text-[#9ca3af]">
                    Upload up to 10 additional photos for detailed preview ({galleryImages.length}/10)
                  </p>
                </div>

                <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#e8e0d5] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] shadow-xs hover:bg-[#faf8f5]">
                  <MdCloudUpload size={16} className="text-[#f0b429]" />
                  Upload Photos
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryFiles}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Add by URL input */}
              <div className="mb-4 flex gap-2">
                <input
                  type="url"
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  placeholder="Paste image link to add to gallery..."
                  className={`${adminInputClass} flex-1`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGalleryFromUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addGalleryFromUrl}
                  className="rounded-xl border border-[#e8e0d5] bg-white px-4 text-xs font-semibold text-[#374151] hover:bg-[#faf8f5]"
                >
                  Add Link
                </button>
              </div>

              {/* Gallery Thumbnails Grid */}
              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative h-24 overflow-hidden rounded-xl border border-[#e8e0d5] bg-gray-100"
                    >
                      <img
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="rounded-lg bg-red-600 p-1.5 text-white hover:bg-red-700"
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[9px] font-semibold text-white">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e8e0d5] bg-[#faf8f5] py-8 text-center">
                  <MdImage size={32} className="text-[#c9c3bc]" />
                  <p className="mt-1 text-xs text-[#9ca3af]">No gallery photos added yet</p>
                </div>
              )}
            </div>
          </div>
        </FormSection>

        {/* Section 5: Contact Details */}
        <FormSection
          icon={<MdPerson size={20} className="text-[#f0b429]" />}
          title="Contact & Lister Information"
          subtitle="Point of contact shown to buyers, renters, and agents"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <AdminFormField label="Full Name" required error={errors.fullName}>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            <div>
              <AdminFormField
                label="Mobile Number"
                required
                error={errors.mobile}
                hint="10-digit Indian mobile number"
              >
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#9ca3af]">
                    +91
                  </span>
                  <input
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

        {/* Section 6: Admin Status & Visibility */}
        <FormSection
          icon={<MdAdminPanelSettings size={20} className="text-[#f0b429]" />}
          title="Admin Status & Platform Visibility"
          subtitle="Moderation status, featured display, and custom promotional badge"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <AdminFormField label="Listing Status" required>
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                  className={adminSelectClass}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>

            <div>
              <AdminFormField label="Promotional Badge" hint="e.g. Featured, Hot Deal, Verified">
                <input
                  type="text"
                  value={form.badge}
                  onChange={(e) => update("badge", e.target.value)}
                  placeholder="Leave empty or enter custom badge"
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            <div>
              <AdminFormField label="Featured Listing" hint="Showcase on platform homepage banner">
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
                Saving Changes...
              </span>
            ) : (
              <>
                <MdCheckCircle size={18} />
                Save & Update Property
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
