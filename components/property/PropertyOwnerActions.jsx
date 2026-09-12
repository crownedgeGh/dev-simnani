"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { MdEdit, MdDeleteOutline } from "react-icons/md";
import PropertyActionCard from "@/components/property/PropertyActionCard";

export default function PropertyOwnerActions({ propertyId, propertyTitle, contactName, contactMobile }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  if (!isAuthenticated) {
    return (
      <PropertyActionCard propertyId={propertyId} contactName={contactName} contactMobile={contactMobile} />
    );
  }

  async function performDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete listing");
      toast.success("Listing deleted successfully.");
      router.push("/portal/common-person");
    } catch (err) {
      toast.error(err.message || "Failed to delete listing.");
      setDeleting(false);
    }
  }

  function handleDeleteClick() {
    toast("Remove this listing?", {
      description: `"${propertyTitle}" will be permanently deleted. This cannot be undone.`,
      duration: Infinity,
      action: {
        label: "Delete",
        onClick: performDelete,
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  }

  return (
    <div className="mb-4 flex gap-3 border border-navy-700/60 bg-navy-900 p-4">
      <button
        type="button"
        onClick={() => router.push(`/post-property/edit/${propertyId}`)}
        className="tracked-label flex flex-1 items-center justify-center gap-2 border border-gold-500/70 py-3 text-xs text-gold-400 transition hover:bg-gold-500/10"
      >
        <MdEdit className="h-4 w-4" />
        Edit Listing
      </button>
      <button
        type="button"
        onClick={handleDeleteClick}
        disabled={deleting}
        className="tracked-label flex flex-1 items-center justify-center gap-2 border border-navy-700/60 py-3 text-xs text-cream transition hover:border-red-400 hover:text-red-400 disabled:opacity-50"
      >
        <MdDeleteOutline className="h-4 w-4" />
        {deleting ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
