"use client";

import { getMapHref } from "@/lib/mapLink";

// `nested` = true when a parent element is already an <a>/<Link> — browsers
// mangle a real <a> nested inside another <a>, so we fall back to a
// click-handled span that opens the map in a new tab instead.
export default function LocationLink({ mapLocation, address, location, className, nested = false }) {
  const text = location || address;
  const href = getMapHref({ mapLocation, address, location });
  if (!text) return null;
  if (!href) return <span className={className}>{text}</span>;

  if (nested) {
    return (
      <span
        role="link"
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(href, "_blank", "noopener,noreferrer");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.stopPropagation();
            window.open(href, "_blank", "noopener,noreferrer");
          }
        }}
        className={className}
      >
        {text}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      {text}
    </a>
  );
}
