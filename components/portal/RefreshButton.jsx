"use client";

import { useState, useCallback } from "react";
import { FiRefreshCw } from "react-icons/fi";

/**
 * RefreshButton — a small icon button that triggers a section-level data refresh.
 * Shows a spinning animation for 700 ms so the user gets clear visual feedback.
 *
 * Props:
 *   onRefresh  — () => void  called when the user clicks refresh
 *   label      — string      accessible label (default "Refresh section")
 *   className  — string      extra Tailwind classes for the button
 */
export default function RefreshButton({ onRefresh, label = "Refresh section", className = "" }) {
  const [spinning, setSpinning] = useState(false);

  const handleClick = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    onRefresh?.();
    setTimeout(() => setSpinning(false), 700);
  }, [spinning, onRefresh]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={`tracked-label flex items-center gap-1.5 rounded-sm border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-[10px] text-gold-400 font-semibold transition hover:bg-gold-500/20 hover:border-gold-400 ${className}`}
    >
      <FiRefreshCw
        className={`h-3.5 w-3.5 text-gold-400 transition-transform ${spinning ? "animate-spin" : ""}`}
      />
      Refresh
    </button>
  );
}
