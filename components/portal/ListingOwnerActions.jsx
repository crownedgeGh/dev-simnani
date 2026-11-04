"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdEdit, MdLockOutline, MdLockOpen, MdVisibility, MdCheckCircleOutline, MdAutorenew } from "react-icons/md";
import { isListingExpired } from "@/lib/properties";

export default function ListingOwnerActions({ property }) {
  const router = useRouter();
  const [status, setStatus] = useState(property.status);
  const [busy, setBusy] = useState(false);

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

  async function renew() {
    setBusy(true);
    try {
      const res = await fetch(`/api/properties/${property.id}/renew`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to renew listing");
      toast.success("Listing renewed.");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to renew listing.");
    } finally {
      setBusy(false);
    }
  }

  const expired = isListingExpired(property) && status !== "Closed";
  const inactive = status === "Closed" || status === "Sold";
  const btn =
    "tracked-label flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-navy-700/60 py-2.5 text-xs transition hover:border-gold-500/50 hover:text-gold-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="border border-navy-700/60 bg-navy-900 p-5">
      <p className="tracked-label text-xs text-gold-400">Manage Listing</p>
      <p className="mt-2 text-sm text-muted">
        This page is only visible to you. Buyers see the public listing page.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {expired && (
          <button
            type="button"
            disabled={busy}
            onClick={renew}
            className="tracked-label flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-gold-400 py-2.5 text-xs font-bold text-navy-950 transition hover:bg-gold-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdAutorenew className="h-4 w-4" />
            Renew Listing
          </button>
        )}
        {inactive ? (
          <button
            type="button"
            disabled
            title="Reopen the listing to edit it"
            className="tracked-label flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-navy-700/60 py-2.5 text-xs text-muted opacity-50 cursor-not-allowed"
          >
            <MdEdit className="h-4 w-4" />
            Edit Listing
          </button>
        ) : (
          <Link
            href={`/post-property/edit/${property.id}`}
            className="tracked-label flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-gold-500/70 py-2.5 text-xs text-gold-400 transition hover:bg-gold-500/10 active:scale-[0.98]"
          >
            <MdEdit className="h-4 w-4" />
            Edit Listing
          </Link>
        )}

        <Link
          href={`/property/${property.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="tracked-label flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-navy-700/60 py-2.5 text-xs text-cream transition hover:border-gold-500/50 hover:text-gold-400 active:scale-[0.98]"
        >
          <MdVisibility className="h-4 w-4" />
          View Public Page
        </Link>

        {inactive ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => updateStatus("Active", "Listing reopened.")}
            className="tracked-label flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-navy-700/60 py-2.5 text-xs text-cream transition hover:border-gold-500/50 hover:text-gold-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdLockOpen className="h-4 w-4" />
            Reopen Listing
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              toast("Deactivate this listing?", {
                description: `"${property.title}" will be hidden from the public site.`,
                duration: Infinity,
                action: {
                  label: "Deactivate",
                  onClick: () => updateStatus("Closed", "Listing deactivated. Your slot is free."),
                },
                cancel: { label: "Cancel", onClick: () => {} },
              })
            }
            className="tracked-label flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-navy-700/60 py-2.5 text-xs text-muted transition hover:border-gold-500/50 hover:text-gold-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdLockOutline className="h-4 w-4" />
            Deactivate Listing
          </button>
        )}

        {!inactive && (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              toast("Mark as Sold/Rented?", {
                description: `"${property.title}" will be hidden and its slot freed.`,
                duration: Infinity,
                action: { label: "Confirm", onClick: () => updateStatus("Sold", "Marked as Sold/Rented. Your slot is free.") },
                cancel: { label: "Cancel", onClick: () => {} },
              })
            }
            className={`${btn} text-muted`}
          >
            <MdCheckCircleOutline className="h-4 w-4" />
            Mark as Sold/Rented
          </button>
        )}
      </div>
    </div>
  );
}
