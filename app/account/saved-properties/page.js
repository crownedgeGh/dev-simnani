"use client";

import { useEffect, useState } from "react";
import PortalHeader from "@/components/portal/PortalHeader";
import PropertyGrid from "@/components/property/PropertyGrid";
import { useSavedPropertyIds } from "@/lib/savedProperties";

export default function SavedPropertiesPage() {
  const { savedIds } = useSavedPropertyIds();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (savedIds.length === 0) {
      setProperties([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    Promise.all(
      savedIds.map((id) =>
        fetch(`/api/properties/${id}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((json) => (json?.success ? json.data : null))
          .catch(() => null)
      )
    ).then((results) => {
      if (!cancelled) {
        setProperties(results.filter(Boolean));
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [savedIds]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PortalHeader
        eyebrow="Account"
        title="Saved Properties"
        subtitle="Your curated collection of luxury real estate and exclusive projects."
      />
      <div className="mt-8">
        {isLoading ? (
          <p className="text-sm text-muted">Loading your saved properties…</p>
        ) : (
          <PropertyGrid
            properties={properties}
            emptyMessage="Your collection is empty. Properties you save will appear here."
          />
        )}
      </div>
    </div>
  );
}
