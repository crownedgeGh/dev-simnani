"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "se_saved_property_ids";
const EVENT_NAME = "se-saved-properties-change";

function readIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getSavedPropertyIds() {
  return readIds();
}

export function toggleSavedProperty(id) {
  const ids = getSavedPropertyIds();
  const next = ids.includes(id) ? ids.filter((savedId) => savedId !== id) : [...ids, id];
  writeIds(next);
  return next;
}

export function useSavedPropertyIds() {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    setIds(getSavedPropertyIds());
    function handleChange() {
      setIds(getSavedPropertyIds());
    }
    window.addEventListener(EVENT_NAME, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener(EVENT_NAME, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  const toggle = useCallback((id) => {
    setIds(toggleSavedProperty(id));
  }, []);

  return { savedIds: ids, isSaved: (id) => ids.includes(id), toggle };
}
