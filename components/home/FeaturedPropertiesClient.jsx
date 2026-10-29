"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PropertyGrid from "@/components/property/PropertyGrid";

function readCity() {
  try {
    return localStorage.getItem("se_user_city") || "";
  } catch {
    return "";
  }
}

export default function FeaturedPropertiesClient({ properties }) {
  const { user } = useAuth();
  const [detectedCity, setDetectedCity] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a client-only external store on mount
    setDetectedCity(readCity());
    function handleLocationUpdate(e) {
      setDetectedCity(e.detail || "");
    }
    window.addEventListener("se-location-updated", handleLocationUpdate);
    return () => window.removeEventListener("se-location-updated", handleLocationUpdate);
  }, []);

  // se_user_city (set by the location prompt or "Set City Manually") is the
  // freshest signal of where the visitor currently says they are. Fall back
  // to the logged-in user's account city only if none has been set at all.
  const city = detectedCity || user?.city || "";

  // No detected city yet — show everything rather than an empty section.
  const visible = (
    city
      ? properties.filter((p) =>
          (p.featuredLocations || []).some(
            (loc) => loc.city?.trim().toLowerCase() === city.trim().toLowerCase()
          )
        )
      : properties
  ).slice(0, 6);

  return (
    <PropertyGrid
      properties={visible}
      emptyTitle={city ? `No featured properties in ${city} yet` : undefined}
      emptyMessage={city ? "Check back soon, or explore listings in other cities." : undefined}
    />
  );
}
