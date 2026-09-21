"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import en from "@/lib/i18n/en.json";

// Lazy-load the DOM translator (client-only) and hi.json together
let hiCache = null;
async function loadHiAndInit() {
  if (hiCache) return hiCache;
  try {
    const [hiMod, { initTranslator }] = await Promise.all([
      import("@/lib/i18n/hi.json"),
      import("@/lib/domTranslator"),
    ]);
    hiCache = hiMod.default ?? hiMod;
    // Pre-warm the translator with our full translation map
    initTranslator(en, hiCache);
    return hiCache;
  } catch (err) {
    console.warn("Hindi translation load failed:", err);
    return {};
  }
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");
  const [hiDict, setHiDict] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const translatorRef = useRef(null); // holds { activateHindi, deactivateHindi }

  // ── Restore saved preference on first mount ─────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("se_lang");
    if (saved === "hi") {
      switchToHindi();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Switch to Hindi ────────────────────────────────────────────────────
  async function switchToHindi() {
    setIsLoading(true);

    // Load hi.json + translator module (cached after first load)
    const dict = await loadHiAndInit();

    // Import translator functions
    const mod = await import("@/lib/domTranslator");
    translatorRef.current = mod;

    setHiDict(dict);
    setIsLoading(false);
    applyLang("hi");

    // Activate DOM-level translation AFTER React has committed the new state
    // so we don't translate our own newly-rendered Hindi text from t() calls twice
    requestAnimationFrame(() => {
      mod.activateHindi();
    });
  }

  // ── Switch back to English ─────────────────────────────────────────────
  function switchToEnglish() {
    if (translatorRef.current) {
      translatorRef.current.deactivateHindi();
      translatorRef.current = null;
    }
    applyLang("en");
  }

  function applyLang(newLang) {
    setLangState(newLang);
    localStorage.setItem("se_lang", newLang);
    // <html lang="hi"> activates :lang(hi) CSS overrides + tells Google the language
    document.documentElement.lang = newLang;
  }

  // ── Toggle ─────────────────────────────────────────────────────────────
  const toggleLang = useCallback(() => {
    if (lang === "en") {
      switchToHindi();
    } else {
      switchToEnglish();
    }
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * t(key) — returns translated string for the active language.
   * Used by Navbar, Footer, and any component that wants to opt-in.
   * The DOM translator handles everything else automatically.
   */
  const t = useCallback(
    (key) => {
      if (lang === "hi" && hiDict) {
        return hiDict[key] ?? en[key] ?? key;
      }
      return en[key] ?? key;
    },
    [lang, hiDict]
  );

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Hook — throws a clear error if used outside <LanguageProvider> */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
