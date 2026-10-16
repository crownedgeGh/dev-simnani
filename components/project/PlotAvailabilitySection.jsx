"use client";

import { useEffect, useRef, useState } from "react";
import PlotLayoutViewer from "@/components/project/PlotLayoutViewer";

// Hidden until #plot-availability is reached (card click or direct link),
// not rendered on page load — matches the "only show on click" ask.
export default function PlotAvailabilitySection({ plots }) {
  const [open, setOpen] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    function syncFromHash() {
      if (window.location.hash === "#plot-availability") setOpen(true);
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    if (open) sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [open]);

  if (!open) return null;

  return (
    <section ref={sectionRef} id="plot-availability" className="scroll-mt-24 pt-16 sm:pt-20 lg:pt-24">
      <span className="tracked-label text-xs text-gold-400">Live Inventory</span>
      <h2 className="mt-2 font-display text-3xl text-cream sm:text-4xl">Plot Availability</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Tap any plot to see its size, facing and price. Yellow plots are open for booking.
      </p>
      <div className="mt-8">
        <PlotLayoutViewer plots={plots} />
      </div>
    </section>
  );
}
