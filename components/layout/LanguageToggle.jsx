"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";

/**
 * LanguageToggle — Fixed bottom-left floating button.
 * Switches between English and Hindi (हिन्दी).
 * Gold accent design matching the Simnani Estate palette.
 */
export default function LanguageToggle() {
  const { lang, toggleLang, isLoading } = useLanguage();
  const isHindi = lang === "hi";
  const [hovered, setHovered] = useState(false);

  return (
    <>
      {/* Fixed bottom-left — stays on screen always */}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          left: "1.5rem",
          zIndex: 9999,
        }}
      >
        <button
          type="button"
          onClick={toggleLang}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          disabled={isLoading}
          aria-label={isHindi ? "Switch to English" : "हिन्दी में बदलें"}
          title={isHindi ? "Switch to English" : "हिन्दी में बदलें"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.5rem 0.85rem",
            background: hovered
              ? "rgba(255, 198, 51, 0.18)"
              : "rgba(10, 14, 26, 0.92)",
            border: `1.5px solid ${hovered ? "var(--color-gold-400)" : "var(--color-navy-600)"}`,
            borderRadius: "2rem",
            cursor: isLoading ? "wait" : "pointer",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: hovered
              ? "0 4px 24px rgba(255,198,51,0.22), 0 2px 8px rgba(0,0,0,0.5)"
              : "0 4px 18px rgba(0,0,0,0.45)",
            transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: hovered ? "translateY(-2px)" : "translateY(0)",
            minWidth: "80px",
            justifyContent: "center",
          }}
        >
          {/* Globe icon */}
          <span
            style={{
              fontSize: "0.95rem",
              lineHeight: 1,
              opacity: isLoading ? 0.5 : 1,
              transition: "opacity 0.2s",
            }}
          >
            🌐
          </span>

          {/* EN / हि pill */}
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.72rem",
              fontFamily: "var(--font-sans, Inter, sans-serif)",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            {/* EN label */}
            <span
              style={{
                color: !isHindi
                  ? "var(--color-gold-400)"
                  : "var(--color-muted)",
                transition: "color 0.2s",
              }}
            >
              EN
            </span>

            {/* Divider */}
            <span style={{ color: "var(--color-navy-600)", fontWeight: 300 }}>
              |
            </span>

            {/* हि label */}
            <span
              style={{
                color: isHindi
                  ? "var(--color-gold-400)"
                  : "var(--color-muted)",
                fontFamily: "system-ui, sans-serif",
                fontSize: "0.78rem",
                transition: "color 0.2s",
              }}
            >
              {isLoading ? "…" : "हि"}
            </span>
          </span>
        </button>
      </div>
    </>
  );
}
