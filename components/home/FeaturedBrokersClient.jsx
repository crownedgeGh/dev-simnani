"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import BrokersScroller from "@/components/home/BrokersScroller";

function readCity() {
  try {
    return localStorage.getItem("se_user_city") || "";
  } catch {
    return "";
  }
}

export default function FeaturedBrokersClient({ brokers }) {
  const { user, isLoading: authLoading } = useAuth();
  // undefined = not yet read on the client — avoids a flash of brokers from
  // the wrong city before the real location is known.
  const [detectedCity, setDetectedCity] = useState(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a client-only external store on mount
    setDetectedCity(readCity());
    function handleLocationUpdate(e) {
      setDetectedCity(e.detail || "");
    }
    window.addEventListener("se-location-updated", handleLocationUpdate);
    return () => window.removeEventListener("se-location-updated", handleLocationUpdate);
  }, []);

  if (authLoading || detectedCity === undefined) return null;

  // The location badge in the navbar reflects se_user_city (set by the
  // location prompt or "Set City Manually") — always the freshest signal of
  // where the visitor currently says they are. Fall back to the logged-in
  // user's account city only if no location has been detected/set at all.
  const city = detectedCity || user?.city || "";

  // When filtered by city, show the matched *featured* city/state on the
  // card instead of the broker's home address — otherwise a broker featured
  // in Raigarh but based in Raipur looks like a mismatch on their own card.
  const visible = city
    ? brokers
        .map((b) => {
          const match = (b.featuredLocations || []).find(
            (loc) => loc.city?.trim().toLowerCase() === city.trim().toLowerCase()
          );
          return match ? { ...b, city: match.city, state: match.state } : null;
        })
        .filter(Boolean)
    : brokers;

  if (!visible.length) return null;

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-24 lg:py-28"
      style={{
        background: "linear-gradient(180deg, #05070c 0%, #0c1020 40%, #0a0e1a 70%, #05070c 100%)",
      }}
    >
      {/* Decorative background glows */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: "700px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(255,198,51,0.07) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0"
        style={{
          width: "400px",
          height: "300px",
          background: "radial-gradient(ellipse, rgba(255,198,51,0.04) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0"
        style={{
          width: "400px",
          height: "300px",
          background: "radial-gradient(ellipse, rgba(255,198,51,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center">
          <span
            className="tracked-label mb-3 inline-block text-xs text-gold-400"
            style={{ letterSpacing: "0.2em" }}
          >
            Our Top Professionals
          </span>
          <h2 className="font-display text-3xl text-cream sm:text-5xl">
            Preferred Agents
          </h2>
          {/* Gold accent underline */}
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-400/60" />
            <div
              className="h-1.5 w-1.5 rounded-full bg-gold-400"
              style={{ boxShadow: "0 0 6px rgba(255,198,51,0.8)" }}
            />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-400/60" />
          </div>
          <p className="mt-4 text-sm text-muted">
            Meet our top-rated, premium real estate partners.
          </p>
        </div>

        <BrokersScroller brokers={visible} />
      </div>
    </section>
  );
}
