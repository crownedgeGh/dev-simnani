"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdEdit, MdDeleteOutline, MdLockOutline, MdLockOpen, MdVisibility } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import { getAccountPermissions } from "@/lib/accountPermissions";

export default function ListingOwnerActions({ property }) {
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState(property.status);
  const [busy, setBusy] = useState(false);
  const portalHref = getAccountPermissions(user?.accountType)?.portalHref || "/";

  async function updateStatus(nextStatus, successMessage) {
    setBusy(true);
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update listing");
      setStatus(nextStatus);
      toast.success(successMessage);
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to update listing.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      const res = await fetch(`/api/properties/${property.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete listing");
      toast.success("Listing deleted successfully.");
      router.push(portalHref);
    } catch (err) {
      toast.error(err.message || "Failed to delete listing.");
      setBusy(false);
    }
  }

  function confirmDelete() {
    toast("Remove this listing?", {
      description: `"${property.title}" will be permanently deleted. This cannot be undone.`,
      duration: Infinity,
      action: { label: "Delete", onClick: handleDelete },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  }

  return (
    <div className="border border-navy-700/60 bg-navy-900 p-5">
      <p className="tracked-label text-xs text-gold-400">Manage Listing</p>
      <p className="mt-2 text-sm text-muted">
        This page is only visible to you. Buyers see the public listing page.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <Link
          href={`/post-property/edit/${property.id}`}
          className="tracked-label flex min-h-11 items-center justify-center gap-1.5 border border-gold-500/70 py-2.5 text-xs text-gold-400 transition hover:bg-gold-500/10"
        >
          <MdEdit className="h-4 w-4" />
          Edit Listing
        </Link>

        <Link
          href={`/property/${property.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="tracked-label flex min-h-11 items-center justify-center gap-1.5 border border-navy-700/60 py-2.5 text-xs text-cream transition hover:border-gold-500/50 hover:text-gold-400"
        >
          <MdVisibility className="h-4 w-4" />
          View Public Page
        </Link>

        {status === "Closed" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => updateStatus("Active", "Listing reopened.")}
            className="tracked-label flex min-h-11 items-center justify-center gap-1.5 border border-navy-700/60 py-2.5 text-xs text-cream transition hover:border-gold-500/50 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdLockOpen className="h-4 w-4" />
            Reopen Listing
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              toast("Close this listing?", {
                description: `"${property.title}" will be hidden from the public site.`,
                duration: Infinity,
                action: {
                  label: "Close Listing",
                  onClick: () => updateStatus("Closed", "Listing closed."),
                },
                cancel: { label: "Cancel", onClick: () => {} },
              })
            }
            className="tracked-label flex min-h-11 items-center justify-center gap-1.5 border border-navy-700/60 py-2.5 text-xs text-muted transition hover:border-gold-500/50 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdLockOutline className="h-4 w-4" />
            Close Listing
          </button>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={confirmDelete}
          className="tracked-label flex min-h-11 items-center justify-center gap-1.5 border border-navy-700/60 py-2.5 text-xs text-cream transition hover:border-red-400 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MdDeleteOutline className="h-4 w-4" />
          Delete Listing
        </button>
      </div>
    </div>
  );
}
