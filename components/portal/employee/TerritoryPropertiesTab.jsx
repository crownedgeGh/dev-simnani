"use client";

import { useState } from "react";
import { FiShare2 } from "react-icons/fi";
import PropertyCard from "@/components/property/PropertyCard";

export default function TerritoryPropertiesTab({ properties }) {
  const [copiedId, setCopiedId] = useState(null);

  async function handleShare(property) {
    const url = `${window.location.origin}/property/${property.id}`;
    const shareData = {
      title: property.title,
      text: `${property.title} — ${property.price} — ${property.location}`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled the share sheet — no action needed
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopiedId(property.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  if (properties.length === 0) {
    return (
      <div className="border border-navy-700/60 bg-navy-900 px-6 py-16 text-center">
        <p className="text-muted">No inventory available in your district right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <div key={property.id} className="flex flex-col gap-2">
          <PropertyCard property={property} />
          <button
            type="button"
            onClick={() => handleShare(property)}
            className="tracked-label flex h-11 items-center justify-center gap-2 border border-navy-700/60 text-xs text-cream transition hover:border-gold-400"
          >
            <FiShare2 className="h-4 w-4" />
            {copiedId === property.id ? "Link Copied" : "Share with Customer"}
          </button>
        </div>
      ))}
    </div>
  );
}
