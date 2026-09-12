"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
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

  const activeCount = listings.filter((p) => p.status === "Active").length;
  const pendingCount = listings.filter((p) => p.status === "Pending Review").length;

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
            properties={listings}
            hideContactButton
            emptyMessage="You haven't listed any properties yet. Post your first property to get started."
          />
        </div>
      </div>
    </div>
  );
}
