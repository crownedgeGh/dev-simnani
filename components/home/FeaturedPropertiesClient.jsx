"use client";

import { useEffect, useState } from "react";
import PropertyGrid from "@/components/property/PropertyGrid";

function readCity() {
  try {
    return localStorage.getItem("se_user_city") || "";
  } catch {
    return "";
  }
}

export default function FeaturedPropertiesClient({ properties }) {
  const [city, setCity] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a client-only external store on mount
    setCity(readCity());
    function handleLocationUpdate(e) {
      setCity(e.detail || "");
    }
    window.addEventListener("se-location-updated", handleLocationUpdate);
    return () => window.removeEventListener("se-location-updated", handleLocationUpdate);
  }, []);

  // No detected city yet — show everything rather than an empty section.
  const visible = city
    ? properties.filter((p) =>
        (p.featuredLocations || []).some(
          (loc) => loc.city?.trim().toLowerCase() === city.trim().toLowerCase()
        )
      )
    : properties;

  return (
    <PropertyGrid
      properties={visible}
      emptyTitle={city ? `No featured properties in ${city} yet` : undefined}
      emptyMessage={city ? "Check back soon, or explore listings in other cities." : undefined}
    />
  );
}
