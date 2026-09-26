"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatMobile, isMobileValid, generateAccountId } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { inputClass, selectClass, textareaClass } from "@/components/auth/inputStyles";
import FormField from "@/components/auth/FormField";
import CompleteProfileModal from "@/components/auth/CompleteProfileModal";
import ConfirmCloseModal from "@/components/property/ConfirmCloseModal";
import { PhotosUpload, VideoUpload } from "@/components/property/PropertyImageUpload";
import {
  MdContentPaste,
  MdLocationOn,
  MdApartment,
  MdCameraAlt,
  MdPerson,
  MdArrowForward,
  MdKeyboardArrowDown,
  MdDescription,
} from "react-icons/md";
import {
  CATEGORIES_BY_TYPE,
  isPgOrHostel,
  GENDER_PREFERENCE_OPTIONS,
  PG_HOSTEL_BATHROOM_OPTIONS,
  getFieldProfile,
} from "@/lib/properties";
import { uploadFileToR2, uploadFilesToR2 } from "@/lib/uploadToR2";
import { trackEvent } from "@/lib/gtag";
import { STATES, getCitiesForState } from "@/lib/cityState";
import SearchableSelect from "@/components/property/SearchableSelect";

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
  { value: "seized-property", label: "Seized Property" },
];

const PROPERTY_TYPES = ["Flat", "House", "Shop", "Plot", "Office", "Warehouse", "PG", "Hostel"];

const MAX_DESCRIPTION_WORDS = 100;

function limitToWords(text, maxWords) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ");
}

function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

const BHK_OPTIONS = [
  { value: "1", label: "1 BHK" },
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4 BHK" },
  { value: "5", label: "5 BHK" },
  { value: "5+", label: "5 BHK+" },
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

const INITIAL_FORM = {
  section: "residential",
  purpose: "",
  title: "",
  propertyType: "",
  category: "",
  state: "",
  city: "",
  locality: "",
  landmark: "",
  address: "",
  price: "",
  negotiable: "",
  areaSize: "",
  areaUnit: "sq ft",
  beds: "",
  halls: "",
  baths: "",
  floorNo: "",
  totalFloors: "",
  furnishing: "",
  parking: "",
  facing: "",
  availableFrom: "",
  preferredFor: "",
  genderPreference: "",
  bathroomType: "",
  description: "",
  photos: [],
  video: null,
  existingVideoUrl: "",
  fullName: "",
  mobile: "",
};

const PostPropertyForm = forwardRef(function PostPropertyForm({ editId }, ref) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const profileIncomplete = user?.profileComplete === false;
  const [propertyId, setPropertyId] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [loadingProperty, setLoadingProperty] = useState(!!editId);
  const [originalAddedDate, setOriginalAddedDate] = useState("");
  const [originalCorrectionRequest, setOriginalCorrectionRequest] = useState(null);
  const [invalidFields, setInvalidFields] = useState(new Set());
  const [pendingLeave, setPendingLeave] = useState(null);
  const submittedRef = useRef(false);
  const initialSnapshotRef = useRef(INITIAL_FORM);

  function isFormDirty() {
    if (submittedRef.current) return false;
    const snapshot = initialSnapshotRef.current;
    return Object.keys(INITIAL_FORM).some((key) => {
      if (key === "photos") return form.photos.length !== (snapshot.photos || []).length;
      if (key === "video") return !!form.video !== !!snapshot.video;
      return form[key] !== snapshot[key];
    });
  }

  useImperativeHandle(ref, () => ({
    guardClose(proceed) {
      if (isFormDirty()) {
        setPendingLeave(() => proceed);
      } else {
        proceed();
      }
    },
  }));

  // Browsers can't show a custom popup for a refresh/tab-close — this is
  // the only hook they give us, and it always renders the browser's own
  // native confirmation text, not ours.
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (!isFormDirty()) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form]);

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
        if (p.ownerId && user?.accountId && p.ownerId !== user.accountId) {
          throw new Error("You can only edit your own listings.");
        }
        const isResidentialType = ["rent", "lease", "sell"].includes(p.type);
        setPropertyId(p.id);
        setOriginalAddedDate(p.addedDate || "");
        setOriginalCorrectionRequest(p.correctionRequest || null);
        const loadedForm = {
          section: isResidentialType ? "residential" : p.type || "residential",
          purpose: p.type === "sell" ? "sale" : p.type === "rent" ? "rent" : p.type === "lease" ? "lease" : "sale",
          title: p.title || "",
          propertyType: isResidentialType ? p.propertyType || "" : "",
          category: p.category || "",
          state: p.state || "",
          city: p.city || "",
          locality: p.locality || "",
          landmark: p.landmark || "",
          address: p.address || "",
          price: p.rawPrice ? String(p.rawPrice) : "",
          negotiable: p.negotiable || "",
          areaSize: p.areaSize ? String(p.areaSize) : "",
          areaUnit: p.areaUnit || "sq ft",
          beds:
            p.beds !== undefined && p.beds !== null && p.beds !== ""
              ? p.bedsPlus
                ? "5+"
                : String(p.beds)
              : "",
          halls: p.halls !== undefined && p.halls !== null && p.halls !== "" ? String(p.halls) : "",
          baths: p.baths !== undefined && p.baths !== null ? String(p.baths) : "",
          floorNo: p.floorNo || "",
          totalFloors: p.totalFloors ? String(p.totalFloors) : "",
          furnishing: p.furnishing || "",
          parking: p.parking || "",
          facing: p.facing || "",
          availableFrom: p.availableFrom || "",
          preferredFor: p.preferredFor || "",
          genderPreference: p.genderPreference || "",
          bathroomType: p.bathroomType || "",
          description: p.description || "",
          photos: [
            ...(p.image ? [{ type: "existing", url: p.image }] : []),
            ...(p.galleryImages || []).map((url) => ({ type: "existing", url })),
          ],
          video: null,
          existingVideoUrl: p.video || "",
          fullName: p.contact?.fullName || "",
          mobile: (p.contact?.mobile || "").replace(/^\+91\s*/, "").trim(),
        };
        setForm(loadedForm);
        initialSnapshotRef.current = loadedForm;
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(err.message || "Failed to load property for editing.");
        router.push("/portal/common-person");
      })
      .finally(() => {
        if (!cancelled) setLoadingProperty(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editId, user, router]);

  function update(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "section") {
        next.category = "";
        next.propertyType = "";
        next.beds = "";
        next.halls = "";
      }
      if (field === "category" || field === "propertyType") {
        const profile =
          field === "propertyType"
            ? getFieldProfile(next.section, next.category, value)
            : getFieldProfile(next.section, value, next.propertyType);
        if (!profile.beds) {
          next.beds = "";
          next.halls = "";
        }
        if (!profile.baths) next.baths = "";
        if (!profile.floors) {
          next.floorNo = "";
          next.totalFloors = "";
        }
        if (!profile.furnishing) next.furnishing = "";
        if (!profile.parking) next.parking = "";
        if (!profile.facing) next.facing = "";
        if (!profile.preferredFor) next.preferredFor = "";
      }
      if (field === "propertyType") {
        if (!isPgOrHostel(value)) {
          next.genderPreference = "";
          next.bathroomType = "";
        }
      }
      if (field === "state") {
        next.city = "";
      }
      return next;
    });
    setInvalidFields((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }

  function errClass(base, field) {
    if (!invalidFields.has(field)) return base;
    return base.replace(/border-navy-700\/60/g, "border-red-500").replace(/gold-400/g, "red-400");
  }

  const isResidential = form.section === "residential";
  const isPgHostelType = isResidential && isPgOrHostel(form.propertyType);
  // Real-world spec sheets differ by what's actually selected — a warehouse
  // has no bedrooms/bathrooms/furnishing, a bare plot has no structure
  // fields at all, an office has washrooms but no bedrooms, etc. This one
  // profile lookup (keyed by propertyType for Residential, or by category
  // for every other section) decides which fields below are shown.
  const hasSelection = isResidential ? !!form.propertyType : !!form.category;
  const fieldProfile = hasSelection
    ? getFieldProfile(form.section, form.category, form.propertyType)
    : null;
  const showBhkSelect = !!fieldProfile?.bhk;
  const showBedsHallsFields = !!fieldProfile?.beds;
  const showBathsField = !!fieldProfile?.baths;
  const showFloorsField = !!fieldProfile?.floors;
  const showFurnishingField = !!fieldProfile?.furnishing;
  const showParkingField = !!fieldProfile?.parking;
  const showFacingField = !!fieldProfile?.facing;
  const showPreferredForField = isResidential && !!fieldProfile?.preferredFor;
  // Every listing (any section) must pick a Purpose (Sale/Rent/Lease) before
  // anything else in the form becomes usable.
  const purposeSelected = !!form.purpose;

  async function handleSubmit(event) {
    event.preventDefault();

    const fieldChecks = [
      { id: "purpose", invalid: !form.purpose },
      { id: "title", invalid: !form.title.trim() },
      isResidential
        ? { id: "propertyType", invalid: !form.propertyType }
        : { id: "category", invalid: !form.category },
      { id: "state", invalid: !form.state.trim() },
      { id: "city", invalid: !form.city.trim() },
      { id: "locality", invalid: !form.locality.trim() },
      { id: "price", invalid: !form.price },
      { id: "areaSize", invalid: !form.areaSize },
      { id: "photos", invalid: !form.photos.length },
      ...(isPgHostelType ? [{ id: "genderPreference", invalid: !form.genderPreference }] : []),
      ...(isPgHostelType ? [{ id: "bathroomType", invalid: !form.bathroomType }] : []),
      ...(showBedsHallsFields ? [{ id: "beds", invalid: !form.beds || Number(form.beds) < 1 }] : []),
      ...(showBedsHallsFields ? [{ id: "halls", invalid: !form.halls || Number(form.halls) < 1 }] : []),
      ...(showBathsField ? [{ id: "baths", invalid: !form.baths || Number(form.baths) < 1 }] : []),
      { id: "fullName", invalid: !form.fullName.trim() },
      { id: "mobile", invalid: !isMobileValid(form.mobile) },
    ];
    const missing = fieldChecks.filter((f) => f.invalid);

    if (missing.length) {
      setInvalidFields(new Set(missing.map((f) => f.id)));
      setError("Please fill in all required fields.");
      toast.error("Please fill in all required fields.");
      const target = document.getElementById(missing[0].id);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.focus({ preventScroll: true });
      return;
    }
    setInvalidFields(new Set());
    setError("");
    setSubmitting(true);

    try {
      const newFiles = form.photos.filter((p) => p.type === "new").map((p) => p.file);
      let videoUrl = form.existingVideoUrl || "";

      let orderedPhotoUrls = [];
      if (newFiles.length || form.video) {
        setUploadStatus("Optimising & uploading photos and video… this can take a minute.");
        const [uploadedFiles, uploadedVideo] = await Promise.all([
          newFiles.length ? uploadFilesToR2(newFiles, "properties/gallery") : Promise.resolve([]),
          form.video ? uploadFileToR2(form.video, "properties/video", setUploadStatus) : Promise.resolve(null),
        ]);
        let uploadedIndex = 0;
        orderedPhotoUrls = form.photos.map((p) => (p.type === "existing" ? p.url : uploadedFiles[uploadedIndex++]));
        if (uploadedVideo) videoUrl = uploadedVideo;
        setUploadStatus("");
      } else {
        orderedPhotoUrls = form.photos.map((p) => p.url);
      }

      const coverImageUrl = orderedPhotoUrls[0] || "/defaultImage.webp";
      const galleryImageUrls = orderedPhotoUrls.slice(1);

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

      const isBedsPlus = form.beds === "5+";
      const numericBeds = isBedsPlus ? 5 : Number(form.beds) || 0;

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
        state: (form.state || "").trim(),
        city: cityStr,
        locality: localityStr,
        landmark: (form.landmark || "").trim(),
        address: (form.address || "").trim(),
        area: `${form.areaSize || 0} ${form.areaUnit || "sq ft"}`,
        areaSize: Number(form.areaSize) || 0,
        areaUnit: form.areaUnit || "sq ft",
        beds: showBedsHallsFields ? numericBeds : 0,
        bedsPlus: showBedsHallsFields ? isBedsPlus : false,
        halls: showBedsHallsFields ? Number(form.halls) || 0 : 0,
        baths: showBathsField ? Number(form.baths) || 0 : 0,
        floorNo: showFloorsField ? form.floorNo || "" : "",
        totalFloors: showFloorsField && form.totalFloors ? Number(form.totalFloors) : null,
        furnishing: showFurnishingField ? form.furnishing || "" : "",
        parking: showParkingField ? form.parking || "" : "",
        facing: showFacingField ? form.facing || "" : "",
        availableFrom: form.availableFrom || "",
        preferredFor: showPreferredForField ? form.preferredFor || "" : "",
        genderPreference: isPgHostelType ? form.genderPreference || "" : "",
        bathroomType: isPgHostelType ? form.bathroomType || "" : "",
        description: (form.description || "").trim(),
        contact: {
          fullName: (form.fullName || "").trim(),
          mobile: `+91 ${(form.mobile || "").trim()}`,
        },
        ownerId: user?.accountId || "",
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
        ...(editId && originalCorrectionRequest?.active
          ? {
              correctionRequest: {
                ...originalCorrectionRequest,
                active: false,
                underReview: true,
                submittedAt: new Date().toISOString(),
              },
            }
          : {}),
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
      submittedRef.current = true;
      toast.success(editId ? "Property updated successfully." : "Property submitted successfully.");
      trackEvent(editId ? "post_property_update" : "post_property_submit", {
        property_type: payload.type,
        city: payload.city,
      });
      router.push("/portal/common-person");
    } catch (err) {
      console.error("PostPropertyForm submit error:", err);
      setSubmitting(false);
      setUploadStatus("");
      setError(err.message || "Failed to submit property. Please try again.");
      toast.error(err.message || "Failed to submit property. Please try again.");
    }
  }

  if (loadingProperty) {
    return (
      <div className="border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
        <p className="text-muted">Loading property details…</p>
      </div>
    );
  }

  if (!isLoading && profileIncomplete) {
    return (
      <>
        <div className="border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
          <p className="text-muted">Complete your profile to post a property.</p>
        </div>
        <CompleteProfileModal
          isOpen
          onClose={() => router.push("/")}
          resumeHref={`/auth/register/${user.accountType}?step=${user.registrationStep || 1}`}
        />
      </>
    );
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Section icon={<MdContentPaste className="h-5 w-5" />} title="Property Identity" subtitle="Basic info about your listing">
        <FormField
          label="Purpose"
          required
          hint={!purposeSelected ? "Select a purpose to unlock the rest of the form" : undefined}
        >
          <div id="purpose">
            <ToggleTwo
              options={PURPOSE_OPTIONS}
              value={form.purpose}
              onChange={(value) => update("purpose", value)}
            />
          </div>
        </FormField>
        <fieldset disabled={!purposeSelected} className="contents">
        <FormField label="Listing Section" htmlFor="section" required hint="Where this property will be listed">
          <SelectWrap>
            <select
              id="section"
              value={form.section}
              onChange={(e) => update("section", e.target.value)}
              className={`${selectClass} rounded-sm pr-10`}
            >
              {SECTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </SelectWrap>
        </FormField>
        {isResidential ? (
          <>
            <FormField label="Property Type" htmlFor="propertyType" required>
              <SelectWrap>
                <select
                  id="propertyType"
                  value={form.propertyType}
                  onChange={(e) => update("propertyType", e.target.value)}
                  className={errClass(`${selectClass} rounded-sm pr-10`, "propertyType")}
                >
                  <option value="">Select type</option>
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </SelectWrap>
            </FormField>
            {showBhkSelect && (
              <FormField label="BHK" htmlFor="beds" required>
                <SelectWrap>
                  <select
                    id="beds"
                    value={form.beds}
                    onChange={(e) => update("beds", e.target.value)}
                    className={errClass(`${selectClass} rounded-sm pr-10`, "beds")}
                  >
                    <option value="">Select BHK</option>
                    {BHK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </SelectWrap>
              </FormField>
            )}
            {isPgHostelType && (
              <FormField label="Suitable For" htmlFor="genderPreference" required>
                <SelectWrap>
                  <select
                    id="genderPreference"
                    value={form.genderPreference}
                    onChange={(e) => update("genderPreference", e.target.value)}
                    className={errClass(`${selectClass} rounded-sm pr-10`, "genderPreference")}
                  >
                    <option value="">Select</option>
                    {GENDER_PREFERENCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </SelectWrap>
              </FormField>
            )}
          </>
        ) : (
          <FormField label="Category" htmlFor="category" required>
            <SelectWrap>
              <select
                id="category"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={errClass(`${selectClass} rounded-sm pr-10`, "category")}
              >
                <option value="">Select category</option>
                {(CATEGORIES_BY_TYPE[form.section] || []).map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </FormField>
        )}
        <FormField label="Property Title" htmlFor="title" required hint={`${form.title.length}/80`}>
          <input
            id="title"
            type="text"
            maxLength={80}
            placeholder="Spacious 2BHK near City Center"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className={errClass(`${inputClass} rounded-sm`, "title")}
          />
        </FormField>
        </fieldset>
      </Section>

      <fieldset
        disabled={!purposeSelected}
        className={`flex flex-col gap-6 transition ${!purposeSelected ? "pointer-events-none opacity-40" : ""}`}
      >
      <Section icon={<MdLocationOn className="h-5 w-5" />} title="Location" subtitle="City and area — no full address required">
        <FormField label="State" htmlFor="state" required>
          <SearchableSelect
            id="state"
            value={form.state}
            onChange={(state) => update("state", state)}
            options={STATES}
            placeholder="Select state"
            searchPlaceholder="Search state…"
            className={errClass(`${selectClass} rounded-sm`, "state")}
          />
        </FormField>
        <FormField label="City" htmlFor="city" required>
          <SearchableSelect
            id="city"
            value={form.city}
            onChange={(city) => update("city", city)}
            options={getCitiesForState(form.state)}
            disabled={!form.state}
            placeholder={form.state ? "Select city" : "Select state first"}
            searchPlaceholder="Search city…"
            className={errClass(`${selectClass} rounded-sm`, "city")}
          />
        </FormField>
        <FormField label="Area / Locality" htmlFor="locality" required>
          <input
            id="locality"
            type="text"
            placeholder="Shankar Nagar"
            value={form.locality}
            onChange={(e) => update("locality", e.target.value)}
            className={errClass(`${inputClass} rounded-sm`, "locality")}
          />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Nearby Landmark" htmlFor="landmark" optional>
            <input
              id="landmark"
              type="text"
              placeholder="Near City Mall"
              value={form.landmark}
              onChange={(e) => update("landmark", e.target.value)}
              className={`${inputClass} rounded-sm`}
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
          <div
            className={errClass(
              "flex items-center rounded-sm border border-navy-700/60 bg-navy-950 pl-4 transition focus-within:border-gold-400",
              "price"
            )}
          >
            <span className="text-sm text-muted">₹</span>
            <input
              id="price"
              type="number"
              min="0"
              autoComplete="off"
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
              value={form.areaSize}
              onChange={(e) => update("areaSize", e.target.value)}
              className={errClass(`${inputClass} min-w-0 flex-1 rounded-sm`, "areaSize")}
            />
            <SelectWrap className="w-28 shrink-0">
              <select
                value={form.areaUnit}
                onChange={(e) => update("areaUnit", e.target.value)}
                className="h-14 w-full appearance-none rounded-sm border border-navy-700/60 bg-navy-950 px-3 text-cream outline-none transition focus:border-gold-400"
              >
                {AREA_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </div>
        </FormField>
        {showBedsHallsFields && !showBhkSelect && (
          <FormField label="No. of Bedrooms " htmlFor="beds" required>
            <input
              id="beds"
              type="number"
              min="1"
              autoComplete="off"
              value={form.beds}
              onChange={(e) => update("beds", e.target.value)}
              className={errClass(`${inputClass} rounded-sm`, "beds")}
            />
          </FormField>
        )}
        {showBedsHallsFields && (
          <FormField label="No. of Halls" htmlFor="halls" required>
            <input
              id="halls"
              type="number"
              min="1"
              autoComplete="off"
              value={form.halls}
              onChange={(e) => update("halls", e.target.value)}
              className={errClass(`${inputClass} rounded-sm`, "halls")}
            />
          </FormField>
        )}
        {showBathsField && (
          <FormField label="No. of Bathrooms" htmlFor="baths" required>
            <input
              id="baths"
              type="number"
              min="1"
              autoComplete="off"
              value={form.baths}
              onChange={(e) => update("baths", e.target.value)}
              className={errClass(`${inputClass} rounded-sm`, "baths")}
            />
          </FormField>
        )}
        {isPgHostelType && (
          <FormField label="Bathroom" htmlFor="bathroomType" required>
            <SelectWrap>
              <select
                id="bathroomType"
                value={form.bathroomType}
                onChange={(e) => update("bathroomType", e.target.value)}
                className={errClass(`${selectClass} rounded-sm pr-10`, "bathroomType")}
              >
                <option value="">Select Bathroom</option>
                {PG_HOSTEL_BATHROOM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </FormField>
        )}
        {showFloorsField && (
          <>
            <FormField label="Floor No." htmlFor="floorNo" optional>
              <input
                id="floorNo"
                type="text"
                placeholder="e.g. 3rd, Ground"
                value={form.floorNo}
                onChange={(e) => update("floorNo", e.target.value)}
                className={`${inputClass} rounded-sm`}
              />
            </FormField>
            <FormField label="Total Floors in Building" htmlFor="totalFloors" optional>
              <input
                id="totalFloors"
                type="number"
                min="0"
                autoComplete="off"
                value={form.totalFloors}
                onChange={(e) => update("totalFloors", e.target.value)}
                className={`${inputClass} rounded-sm`}
              />
            </FormField>
          </>
        )}
        {showFurnishingField && (
          <FormField label="Furnishing Status" htmlFor="furnishing" optional>
            <SelectWrap>
              <select
                id="furnishing"
                value={form.furnishing}
                onChange={(e) => update("furnishing", e.target.value)}
                className={`${selectClass} rounded-sm pr-10`}
              >
                <option value="">Select</option>
                {FURNISHING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </FormField>
        )}
        {showParkingField && (
          <FormField label="Parking Available" optional>
            <ToggleTwo
              options={YES_NO_OPTIONS}
              value={form.parking}
              onChange={(value) => update("parking", value)}
            />
          </FormField>
        )}
        {showFacingField && (
          <FormField label="Facing Direction" htmlFor="facing" optional>
            <SelectWrap>
              <select
                id="facing"
                value={form.facing}
                onChange={(e) => update("facing", e.target.value)}
                className={`${selectClass} rounded-sm pr-10`}
              >
                <option value="">Select</option>
                {FACING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </FormField>
        )}
        <FormField label="Available From" htmlFor="availableFrom" optional>
          <input
            id="availableFrom"
            type="date"
            value={form.availableFrom}
            onChange={(e) => update("availableFrom", e.target.value)}
            className={`${inputClass} rounded-sm`}
          />
        </FormField>
        {showPreferredForField && (
        <FormField label="Preferred For" htmlFor="preferredFor" optional>
          <SelectWrap>
            <select
              id="preferredFor"
              value={form.preferredFor}
              onChange={(e) => update("preferredFor", e.target.value)}
              className={`${selectClass} rounded-sm pr-10`}
            >
              <option value="">Select</option>
              {PREFERRED_FOR_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </SelectWrap>
        </FormField>
        )}
      </Section>

      <Section icon={<MdCameraAlt className="h-5 w-5" />} title="Photos & Video" subtitle="Add photos to attract more buyers — video is optional">
        <div id="photos" className={`sm:col-span-2 ${invalidFields.has("photos") ? "outline outline-1 outline-offset-4 outline-red-500" : ""}`}>
          <PhotosUpload
            id="photosInput"
            label="Add Photos"
            hint="First photo is the cover shown in listings · use “Make Cover” to change it · JPEG, PNG or WEBP up to 10MB each"
            photos={form.photos}
            onChange={(photos) => update("photos", photos)}
            max={11}
          />
          {invalidFields.has("photos") && (
            <p className="mt-2 text-xs text-red-400">Please add at least one photo.</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <VideoUpload
            id="video"
            label="Property Video"
            hint="MP4, WEBM or MOV up to 50MB"
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
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className={errClass(`${inputClass} rounded-sm`, "fullName")}
          />
        </FormField>
        <FormField label="Mobile Number" htmlFor="mobile" required>
          <div
            className={errClass(
              "flex items-center rounded-sm border border-navy-700/60 bg-navy-950 pl-4 transition focus-within:border-gold-400",
              "mobile"
            )}
          >
            <span className="text-sm text-muted">+91</span>
            <input
              id="mobile"
              type="tel"
              inputMode="numeric"
              value={form.mobile}
              onChange={(e) => update("mobile", formatMobile(e.target.value))}
              className="h-14 w-full bg-transparent px-3 text-cream placeholder:text-muted focus:outline-none"
            />
          </div>
        </FormField>
      </Section>

      <Section
        icon={<MdDescription className="h-5 w-5" />}
        title="Description"
        subtitle="Tell buyers more about the property — optional"
      >
        <div className="sm:col-span-2">
          <FormField
            label="Property Description"
            htmlFor="description"
            optional
            hint={`${countWords(form.description)}/${MAX_DESCRIPTION_WORDS} words`}
          >
            <textarea
              id="description"
              rows={4}
              placeholder="Share key highlights — layout, nearby landmarks, amenities, condition…"
              value={form.description}
              onChange={(e) => update("description", limitToWords(e.target.value, MAX_DESCRIPTION_WORDS))}
              className={`${textareaClass} rounded-sm`}
            />
          </FormField>
        </div>
      </Section>
      </fieldset>

      {error && (
        <p className="rounded-sm border border-red-500/30 bg-red-500/5 px-4 py-3 text-center text-xs text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="tracked-label flex items-center justify-center gap-2 rounded-sm bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Saving..." : editId ? "Save Changes" : "Submit Property"}
        {!submitting && <MdArrowForward className="h-4 w-4" />}
      </button>
      <p className="text-center text-xs text-muted">
        By submitting, you agree to our{" "}
        <Link href="/legal/privacy-policy" className="text-gold-400 hover:text-gold-300">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
    <ConfirmCloseModal
      isOpen={!!pendingLeave}
      onCancel={() => setPendingLeave(null)}
      onConfirm={() => {
        pendingLeave?.();
        setPendingLeave(null);
      }}
    />
    </>
  );
});

PostPropertyForm.displayName = "PostPropertyForm";

export default PostPropertyForm;

function Section({ icon, title, subtitle, children }) {
  return (
    <div className="overflow-hidden rounded-sm border border-navy-700/60 bg-navy-900 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)]">
      <div className="h-[3px] bg-gold-400" />
      <div className="flex items-center gap-3 border-b border-navy-700/60 bg-navy-950/40 px-5 py-4 sm:gap-4 sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400/10 text-gold-400 sm:h-11 sm:w-11">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-cream sm:text-base">{title}</h2>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:gap-6 sm:p-6">{children}</div>
    </div>
  );
}

function SelectWrap({ children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <MdKeyboardArrowDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
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
          className={`tracked-label flex h-14 items-center justify-center rounded-sm border text-xs transition disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-navy-700/60 disabled:hover:text-muted ${
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
