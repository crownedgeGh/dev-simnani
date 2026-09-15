"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { MdLockOpen, MdEdit, MdDeleteOutline, MdLockOutline } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import StatCard from "@/components/portal/StatCard";

export default function MyListings() {
  const { user, isLoading: authLoading } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async (accountId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties?ownerId=${encodeURIComponent(accountId)}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load listings");
      setListings(data.data);
    } catch (err) {
      toast.error(err.message || "Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.accountId) {
      setListings([]);
      setLoading(false);
      return;
    }
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchListings(user.accountId);
    });
    return () => {
      active = false;
    };
  }, [authLoading, user, fetchListings]);

  const handleReopen = useCallback(
    async (id) => {
      try {
        const res = await fetch(`/api/properties/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Active" }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to reopen listing");
        toast.success("Listing reopened.");
        fetchListings(user.accountId);
      } catch (err) {
        toast.error(err.message || "Failed to reopen listing.");
      }
    },
    [fetchListings, user]
  );

  const handleClose = useCallback(
    async (id) => {
      try {
        const res = await fetch(`/api/properties/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Closed" }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to close listing");
        toast.success("Listing closed. It is no longer visible to the public.");
        fetchListings(user.accountId);
      } catch (err) {
        toast.error(err.message || "Failed to close listing.");
      }
    },
    [fetchListings, user]
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete listing");
        toast.success("Listing deleted successfully.");
        fetchListings(user.accountId);
      } catch (err) {
        toast.error(err.message || "Failed to delete listing.");
      }
    },
    [fetchListings, user]
  );

  const handleCloseClick = useCallback(
    (property) => {
      toast("Close this listing?", {
        description: `"${property.title}" will be hidden from the public site. You can still manage it from your portal.`,
        duration: Infinity,
        action: { label: "Close Listing", onClick: () => handleClose(property.id) },
        cancel: { label: "Cancel", onClick: () => {} },
      });
    },
    [handleClose]
  );

  const handleDeleteClick = useCallback(
    (property) => {
      toast("Remove this listing?", {
        description: `"${property.title}" will be permanently deleted. This cannot be undone.`,
        duration: Infinity,
        action: { label: "Delete", onClick: () => handleDelete(property.id) },
        cancel: { label: "Cancel", onClick: () => {} },
      });
    },
    [handleDelete]
  );

  const activeCount = listings.filter((p) => p.status === "Active").length;
  const pendingCount = listings.filter((p) => p.status === "Pending Review").length;
  const openListings = listings.filter((p) => p.status !== "Closed");
  const closedListings = listings.filter((p) => p.status === "Closed");

  if (authLoading || loading) {
    return (
      <div className="mt-10">
        <div className="border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
          <p className="text-muted">Loading your listings…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mt-10">
        <div className="border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
          <p className="text-muted">Log in to see the properties you&apos;ve listed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Listings" value={listings.length} />
        <StatCard label="Live" value={activeCount} />
        <StatCard label="Pending Review" value={pendingCount} />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">My Listings</h2>
          <Link href="/post-property" className="tracked-label text-xs text-gold-400 hover:text-gold-300">
            Post New Property
          </Link>
        </div>

        <p className="mt-2 text-xs text-muted">
          Edit, close, or delete a listing directly from here.
        </p>

        <div className="mt-4">
          {openListings.length === 0 ? (
            <div className="rounded-sm border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
              <p className="text-muted">
                You haven&apos;t listed any properties yet. Post your first property to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {openListings.map((property) => (
                <OpenListingCard
                  key={property.id}
                  property={property}
                  onClose={handleCloseClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {closedListings.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-cream">Closed Listings</h2>
          <p className="mt-2 text-xs text-muted">
            These listings are hidden from the public site.
          </p>

          <div className="mt-4 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {closedListings.map((property) => (
              <ClosedListingCard key={property.id} property={property} onReopen={handleReopen} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OpenListingCard({ property, onClose, onDelete }) {
  const { id, title, price, location, image, address, status } = property;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-sm border border-navy-700/60 bg-navy-900">
      <Link href={`/portal/listing/${id}`} className="relative block aspect-[4/3] w-full overflow-hidden">
        <Image src={image} alt={title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        {status && (
          <span className="tracked-label absolute left-3 top-3 rounded-sm bg-navy-950/80 px-2 py-1 text-[10px] font-semibold text-gold-400">
            {status}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/portal/listing/${id}`}>
          <h3 className="font-display text-lg text-cream transition hover:text-gold-400">{title}</h3>
        </Link>
        <p className="mt-1 text-sm text-muted">{address || location}</p>
        <p className="mt-3 font-sans text-xl font-semibold text-gold-400">{price}</p>

        <div className="mt-auto flex flex-col gap-3 pt-5">
          <div className="flex gap-3">
            <Link
              href={`/post-property/edit/${id}`}
              className="tracked-label flex min-h-11 flex-1 items-center justify-center gap-1.5 border border-gold-500/70 py-2.5 text-xs text-gold-400 transition hover:bg-gold-500/10"
            >
              <MdEdit className="h-4 w-4" />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => onDelete(property)}
              className="tracked-label flex min-h-11 flex-1 items-center justify-center gap-1.5 border border-navy-700/60 py-2.5 text-xs text-cream transition hover:border-red-400 hover:text-red-400"
            >
              <MdDeleteOutline className="h-4 w-4" />
              Delete
            </button>
          </div>
          <button
            type="button"
            onClick={() => onClose(property)}
            className="tracked-label flex min-h-11 items-center justify-center gap-1.5 border border-navy-700/60 py-2.5 text-xs text-muted transition hover:border-gold-500/50 hover:text-gold-400"
          >
            <MdLockOutline className="h-4 w-4" />
            Close Listing
          </button>
        </div>
      </div>
    </div>
  );
}

function ClosedListingCard({ property, onReopen }) {
  const { id, title, price, location, image, address } = property;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-sm border border-navy-700/60 bg-navy-900 opacity-80">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image src={image} alt={title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover grayscale" />
        <span className="tracked-label absolute left-3 top-3 rounded-sm bg-navy-950/80 px-2 py-1 text-[10px] font-semibold text-muted">
          Closed
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg text-cream">{title}</h3>
        <p className="mt-1 text-sm text-muted">{address || location}</p>
        <p className="mt-3 font-sans text-xl font-semibold text-gold-400">{price}</p>

        <div className="mt-auto flex gap-3 pt-5">
          <button
            type="button"
            onClick={() => onReopen(id)}
            className="tracked-label flex min-h-11 flex-1 items-center justify-center gap-1.5 border border-gold-500/70 py-2.5 text-xs text-gold-400 transition hover:bg-gold-500/10"
          >
            <MdLockOpen className="h-4 w-4" />
            Reopen
          </button>
          <Link
            href={`/post-property/edit/${id}`}
            className="tracked-label flex min-h-11 flex-1 items-center justify-center gap-1.5 border border-navy-700/60 py-2.5 text-xs text-cream transition hover:border-gold-500/50 hover:text-gold-400"
          >
            <MdEdit className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}
