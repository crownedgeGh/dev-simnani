"use client";

import { useEffect, useState } from "react";

/**
 * Polls the properties API for listings the owner has resubmitted after a
 * correction request, so admin nav/badges can nudge someone to go check
 * and clear the hold.
 */
export function useCorrectionReviewCount() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/properties", { cache: "no-store" });
        const json = await res.json();
        if (active && json.success && Array.isArray(json.data)) {
          setProperties(json.data);
        }
      } catch {
        // Non-fatal — badge just stays at its last known value
      }
    }

    load();
    const interval = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const underReview = properties.filter(
    (p) => p.correctionRequest?.underReview && !p.correctionRequest?.active
  );

  return { count: underReview.length, properties: underReview };
}
