"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdArrowBack, MdEdit, MdDelete, MdBed, MdBathtub, MdSquareFoot, MdLocationOn } from "react-icons/md";
import AdminStatusBadge from "@/components/admin/ui/AdminStatusBadge";
import AdminConfirmModal from "@/components/admin/ui/AdminConfirmModal";
import PropertyFormDialog from "@/components/admin/properties/PropertyFormDialog";
import adminAxios from "@/lib/adminAxios";
import { ADMIN_KEYS, readCollection } from "@/lib/adminStorage";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const props = readCollection(ADMIN_KEYS.properties) || [];
    const found = props.find((p) => p.id === id);
    setProperty(found || null);
  }, [id]);

  const handleEdit = async (formData) => {
    const res = await adminAxios.put(`/admin/properties/${formData.id}`, formData);
    const updated = res.data.data.find((p) => p.id === formData.id);
    setProperty(updated);
    toast.success("Property updated successfully");
  };

  const handleDelete = async () => {
    setDeleting(true);
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

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => router.push("/admin/properties")}
        className="mb-4 flex items-center gap-1.5 text-sm text-[#9ca3af] transition hover:text-[#1a1a2e]"
      >
        <MdArrowBack size={16} /> Back to Properties
      </button>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Image */}
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-[#e8e0d5] bg-[#f0ebe3] aspect-video">
            {property.image ? (
              <img src={property.image} alt={property.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[#c9c3bc] text-sm">No image</div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="flex flex-1 items-center justify-center gap-1.5 h-10 rounded-xl border border-[#e8e0d5] bg-white text-sm text-[#374151] transition hover:bg-[#faf8f5]"
            >
              <MdEdit size={16} /> Edit
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="flex flex-1 items-center justify-center gap-1.5 h-10 rounded-xl border border-red-200 bg-white text-sm text-red-500 transition hover:bg-red-50"
            >
              <MdDelete size={16} /> Delete
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 rounded-2xl border border-[#e8e0d5] bg-white p-6">
          <div className="flex flex-wrap items-start gap-2 mb-3">
            <AdminStatusBadge status={property.type} />
            <AdminStatusBadge status={property.status} />
            {property.featured && (
              <span className="rounded-full border border-[#f0b429]/40 bg-[#fff8e1] px-2 py-0.5 text-xs font-medium text-[#d97706]">
                ⭐ Featured
              </span>
            )}
          </div>

          <h1 className="text-xl font-bold text-[#1a1a2e] mb-1">{property.title}</h1>
          <div className="flex items-center gap-1.5 text-sm text-[#9ca3af] mb-4">
            <MdLocationOn size={16} className="text-[#f0b429]" />
            {property.location}
          </div>

          <p className="text-2xl font-bold text-[#d97706] mb-5">{property.price}</p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {property.beds > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-[#e8e0d5] p-3">
                <MdBed size={18} className="text-[#9ca3af]" />
                <div>
                  <p className="text-sm font-semibold text-[#1a1a2e]">{property.beds}</p>
                  <p className="text-[10px] text-[#9ca3af] uppercase tracking-wide">Beds</p>
                </div>
              </div>
            )}
            {property.baths > 0 && (
              <div className="flex items-center gap-2 rounded-xl border border-[#e8e0d5] p-3">
                <MdBathtub size={18} className="text-[#9ca3af]" />
                <div>
                  <p className="text-sm font-semibold text-[#1a1a2e]">{property.baths}</p>
                  <p className="text-[10px] text-[#9ca3af] uppercase tracking-wide">Baths</p>
                </div>
              </div>
            )}
            {property.area && (
              <div className="flex items-center gap-2 rounded-xl border border-[#e8e0d5] p-3">
                <MdSquareFoot size={18} className="text-[#9ca3af]" />
                <div>
                  <p className="text-sm font-semibold text-[#1a1a2e]">{property.area}</p>
                  <p className="text-[10px] text-[#9ca3af] uppercase tracking-wide">Area</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#f0ebe3] pt-4">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[#f0ebe3]">
                {[
                  ["Property ID", property.id],
                  ["Badge", property.badge || "—"],
                  ["Added Date", property.addedDate || "—"],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-2 text-[#9ca3af] pr-4 w-32">{k}</td>
                    <td className="py-2 text-[#374151] font-medium">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
