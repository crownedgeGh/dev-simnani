"use client";

import { useEffect, useState } from "react";
import PortalHeader from "@/components/portal/PortalHeader";
import PropertyGrid from "@/components/property/PropertyGrid";
import { useSavedPropertyIds } from "@/lib/savedProperties";

export default function SavedPropertiesPage() {
  const { savedIds } = useSavedPropertyIds();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [interestedProperties, setInterestedProperties] = useState([]);
  const [isLoadingInterested, setIsLoadingInterested] = useState(true);

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

  useEffect(() => {
    let cancelled = false;
    setIsLoadingInterested(true);
    fetch("/api/leads?scope=buyer", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then(async (json) => {
        if (!json?.success || !json.data?.length) {
          if (!cancelled) {
            setInterestedProperties([]);
            setIsLoadingInterested(false);
          }
          return;
        }
        const results = await Promise.all(
          json.data.map((lead) =>
            fetch(`/api/properties/${lead.propertyId}`)
              .then((res) => (res.ok ? res.json() : null))
              .then((propJson) => (propJson?.success ? propJson.data : null))
              .catch(() => null)
          )
        );
        if (!cancelled) {
          setInterestedProperties(results.filter(Boolean));
          setIsLoadingInterested(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInterestedProperties([]);
          setIsLoadingInterested(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

      <div className="mt-16">
        <h2 className="font-display text-2xl text-cream sm:text-3xl">I&apos;m Interested</h2>
        <p className="mt-2 text-sm text-muted">
          Properties where you have expressed interest and requested a callback.
        </p>
        <div className="mt-6">
          {isLoadingInterested ? (
            <p className="text-sm text-muted">Loading your interested properties…</p>
          ) : (
            <PropertyGrid
              properties={interestedProperties}
              emptyMessage="You haven't marked interest on any property yet."
            />
          )}
        </div>
      </div>
    </div>
  );
}
