"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MdArrowBack,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdCancel,
  MdBed,
  MdBathtub,
  MdSquareFoot,
  MdCategory,
  MdTrendingUp,
  MdChevronLeft,
  MdChevronRight,
  MdPlayCircle,
} from "react-icons/md";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";
import PropertyFormDialog from "@/components/admin/properties/PropertyFormDialog";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection } from "@/lib/adminStorage";
import { AMENITIES, NEARBY_PLACES, getPropertyDescription } from "@/lib/propertyContent";
import BlurredImageFrame from "@/components/property/BlurredImageFrame";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      try {
        const res = await fetch(`/api/properties/${id}`);
        const json = await res.json();
        if (json.success && json.data && active) {
          setProperty(json.data);
          return;
        }
      } catch {
        // Fallback
      }

      if (!active) return;
      const props = readCollection(ADMIN_KEYS.properties) || [];
      const found = props.find((p) => p.id === id);
      setProperty(found || null);
    }

    loadProperty();

    return () => {
      active = false;
    };
  }, [id]);

  const handleEdit = async (formData) => {
    try {
      const res = await fetch(`/api/properties/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setProperty(json.data);
        toast.success("Property updated successfully");
        return;
      }
    } catch {
      // Fallback
    }
    const res = await adminAxios.put(`/admin/properties/${formData.id}`, formData);
    const updated = res.data.data.find((p) => p.id === formData.id);
    setProperty(updated);
    toast.success("Property updated successfully");
  };

  const handleStatusChange = async (status) => {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setProperty(json.data);
        toast.success(status === "Active" ? "Property approved" : "Property rejected");
        setStatusUpdating(false);
        return;
      }
    } catch {
      // Fallback
    }
    try {
      const res = await adminAxios.patch(`/admin/properties/${id}`, { status });
      const updated = res.data.data.find((p) => p.id === id);
      setProperty(updated);
      toast.success(status === "Active" ? "Property approved" : "Property rejected");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Property deleted successfully from database");
        router.push("/admin/properties");
        return;
      }
    } catch {
      // Fallback
    }
    try {
      await adminAxios.delete(`/admin/properties/${id}`);
      toast.success("Property deleted successfully");
      router.push("/admin/properties");
    } catch {
      toast.error("Failed to delete");
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (!property) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <p className="text-[#9ca3af]">Property not found</p>
        <button onClick={() => router.push("/admin/properties")} className="text-sm text-[#f0b429] hover:underline">
          ← Back to Properties
        </button>
      </div>
    );
  }

  const isInvest = property.type === "invest";

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => router.push("/admin/properties")}
        className="mb-4 flex items-center gap-1.5 text-sm text-[#9ca3af] transition hover:text-[#1a1a2e]"
      >
        <MdArrowBack size={16} /> Back to Properties
      </button>

      <AdminMediaCarousel
        image={property.image}
        galleryImages={property.galleryImages}
        video={property.video}
        title={property.title}
        badge={property.badge}
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <AdminStatusBadge status={property.type} />
            <AdminStatusBadge status={property.status} />
            {property.featured && (
              <span className="rounded-full border border-[#f0b429]/40 bg-[#fff8e1] px-2 py-0.5 text-xs font-medium text-[#d97706]">
                ⭐ Featured
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-bold text-[#1a1a2e] sm:text-4xl">{property.title}</h1>
          <p className="mt-2 text-sm text-[#9ca3af]">{property.location}</p>
          <p className="mt-4 text-2xl font-bold text-[#d97706]">{property.price}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-y border-[#e8e0d5] py-6 sm:grid-cols-4">
            {isInvest ? (
              <Stat icon={<MdTrendingUp />} label="Est. Return" value={property.roi} />
            ) : (
              <>
                {property.beds > 0 && <Stat icon={<MdBed />} label="Bedrooms" value={property.beds} />}
                {property.baths > 0 && <Stat icon={<MdBathtub />} label="Bathrooms" value={property.baths} />}
                {property.area && <Stat icon={<MdSquareFoot />} label="Area" value={property.area} />}
                <Stat icon={<MdCategory />} label="Type" value={property.type} />
              </>
            )}
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-[#1a1a2e]">About This Property</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6b7280]">
              {getPropertyDescription(property)}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-[#1a1a2e]">Property Features</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full border border-[#e8e0d5] bg-white px-3 py-2 text-xs text-[#374151]"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-[#1a1a2e]">Location & Surroundings</h2>
            <p className="mt-2 text-sm text-[#9ca3af]">{property.location}</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {NEARBY_PLACES.map((place) => (
                <div
                  key={place.label}
                  className="flex items-center justify-between rounded-xl border border-[#e8e0d5] bg-white px-4 py-3 text-sm"
                >
                  <span className="text-[#374151]">{place.label}</span>
                  <span className="text-[#9ca3af]">{place.distance}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-bold text-[#1a1a2e]">Property Information</h2>
            <div className="mt-4 rounded-2xl border border-[#e8e0d5] bg-white p-4">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-[#f0ebe3]">
                  {[
                    ["Property ID", property.id],
                    ["Badge", property.badge || "—"],
                    ["Added Date", property.addedDate || "—"],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td className="w-32 py-2 pr-4 text-[#9ca3af]">{k}</td>
                      <td className="py-2 font-medium text-[#374151]">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-[#e8e0d5] bg-white p-6 lg:sticky lg:top-24">
            <h3 className="text-lg font-bold text-[#1a1a2e]">Manage Property</h3>
            <p className="mt-2 text-sm text-[#9ca3af]">
              Edit the listing details or remove this property from the database.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusChange("Active")}
                  disabled={statusUpdating || property.status === "Active"}
                  className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MdCheckCircle size={16} /> Approve
                </button>
                <button
                  onClick={() => handleStatusChange("Rejected")}
                  disabled={statusUpdating || property.status === "Rejected"}
                  className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MdCancel size={16} /> Reject
                </button>
              </div>
              <button
                onClick={() => router.push(`/admin/properties/${id}/edit`)}
                className="flex h-12 items-center justify-center gap-1.5 rounded-xl border border-[#e8e0d5] bg-white text-sm font-medium text-[#374151] transition hover:bg-[#faf8f5]"
              >
                <MdEdit size={16} /> Edit Property
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="flex h-12 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                <MdDelete size={16} /> Delete Property
              </button>
            </div>
          </div>
        </div>
      </div>

      <PropertyFormDialog isOpen={editOpen} onClose={() => setEditOpen(false)} property={property} onSave={handleEdit} />
      <AdminConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Property"
        message={`Delete "${property.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={deleting}
      />
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div>
      <span className="mb-1.5 flex items-center gap-1.5 text-[#d97706]">
        <span className="text-lg">{icon}</span>
      </span>
      <p className="text-lg font-bold text-[#1a1a2e]">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-[#9ca3af]">{label}</p>
    </div>
  );
}

function AdminMediaCarousel({ image, galleryImages, video, title, badge }) {
  const slides = useMemo(() => {
    const images = [image, ...(galleryImages || [])].filter(Boolean);
    const uniqueImages = [...new Set(images)].map((src) => ({ type: "image", src }));
    const videoSlide = video ? [{ type: "video", src: video }] : [];
    return [...uniqueImages, ...videoSlide];
  }, [image, galleryImages, video]);

  const [index, setIndex] = useState(0);
  const active = slides[index];
  const hasMultiple = slides.length > 1;

  function goTo(next) {
    setIndex((next + slides.length) % slides.length);
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#e8e0d5] bg-[#f0ebe3] sm:aspect-[16/10] lg:aspect-[16/9]">
        {!active ? (
          <div className="flex h-full items-center justify-center text-sm text-[#c9c3bc]">No image</div>
        ) : active.type === "video" ? (
          <video key={active.src} src={active.src} controls playsInline className="h-full w-full bg-black object-contain" />
        ) : (
          <BlurredImageFrame key={active.src} src={active.src} alt={title} className="h-full w-full" />
        )}

        {badge && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-[#f0b429] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#1a1a2e]">
            {badge}
          </span>
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous media"
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1a1a2e] shadow transition hover:bg-white sm:left-4"
            >
              <MdChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next media"
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1a1a2e] shadow transition hover:bg-white sm:right-4"
            >
              <MdChevronRight size={22} />
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden">
              {slides.map((slide, i) => (
                <span
                  key={`${slide.type}-${slide.src}`}
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    i === index ? "bg-[#f0b429]" : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="mt-3 hidden grid-cols-6 gap-2 sm:grid lg:grid-cols-8">
          {slides.map((slide, i) => (
            <button
              key={`${slide.type}-${slide.src}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show media ${i + 1}`}
              className={`relative aspect-square overflow-hidden rounded-lg border transition ${
                i === index ? "border-[#f0b429]" : "border-[#e8e0d5] hover:border-[#d97706]/50"
              }`}
            >
              {slide.type === "video" ? (
                <div className="flex h-full w-full items-center justify-center bg-[#f0ebe3] text-[#9ca3af]">
                  <MdPlayCircle size={18} />
                </div>
              ) : (
                <img src={slide.src} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
