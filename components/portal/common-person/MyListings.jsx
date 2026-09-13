"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { MdLockOpen, MdEdit } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import PropertyGrid from "@/components/property/PropertyGrid";
import StatCard from "@/components/portal/StatCard";

export default function MyListings() {
  const { user, isLoading: authLoading } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/properties");
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
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchListings();
    });
    return () => {
      active = false;
    };
  }, [authLoading, fetchListings]);

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
        fetchListings();
      } catch (err) {
        toast.error(err.message || "Failed to reopen listing.");
      }
    },
    [fetchListings]
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
          Open a listing to edit its details or delete it.
        </p>

        <div className="mt-4">
          <PropertyGrid
            properties={openListings}
            hideContactButton
            emptyMessage="You haven't listed any properties yet. Post your first property to get started."
          />
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
        <p className="mt-3 font-display text-xl text-gold-400">{price}</p>

        <div className="mt-auto flex gap-3 pt-5">
          <button
            type="button"
            onClick={() => onReopen(id)}
            className="tracked-label flex flex-1 items-center justify-center gap-1.5 border border-gold-500/70 py-2.5 text-xs text-gold-400 transition hover:bg-gold-500/10"
          >
            <MdLockOpen className="h-4 w-4" />
            Reopen
          </button>
          <Link
            href={`/post-property/edit/${id}`}
            className="tracked-label flex flex-1 items-center justify-center gap-1.5 border border-navy-700/60 py-2.5 text-xs text-cream transition hover:border-gold-500/50 hover:text-gold-400"
          >
            <MdEdit className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}
