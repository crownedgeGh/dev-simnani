"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MdMyLocation } from "react-icons/md";
import { getCurrentCoords } from "@/lib/geo";

export default function LocateButton({ onLocate, label = "Use Current Location", className = "" }) {
  const [locating, setLocating] = useState(false);

  async function handleClick() {
    setLocating(true);
    try {
      const coords = await getCurrentCoords();
      await onLocate(coords);
    } catch (err) {
      toast.error(err.message || "Couldn't get your location. Please allow location access and try again.", { duration: 6000 });
    } finally {
      setLocating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={locating}
      aria-label={label}
      className={`tracked-label flex h-14 shrink-0 items-center justify-center gap-2 rounded-full border border-gold-500/70 px-4 text-xs text-gold-400 transition hover:bg-gold-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <MdMyLocation className="h-4 w-4" />
      {locating ? "Locating…" : label}
    </button>
  );
}
