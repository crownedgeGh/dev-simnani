"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const STORAGE_KEY = "se_saved_property_ids";
const EVENT_NAME = "se-saved-properties-change";

function readLocalIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getSavedPropertyIds() {
  return readLocalIds();
}

// Saved properties persist to the user's DB record when signed in (so the
// admin panel can see them), and fall back to localStorage for guests.
export function useSavedPropertyIds() {
  const { isAuthenticated, user, updateProfile } = useAuth();
  const [ids, setIds] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setIds(Array.isArray(user.savedProperties) ? user.savedProperties : []);
      return;
    }

    setIds(readLocalIds());
    function handleChange() {
      setIds(readLocalIds());
    }
    window.addEventListener(EVENT_NAME, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener(EVENT_NAME, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, [isAuthenticated, user]);

  const toggle = useCallback(
    (id) => {
      const next = ids.includes(id) ? ids.filter((savedId) => savedId !== id) : [...ids, id];
      setIds(next);
      if (isAuthenticated && user?.accountId) {
        updateProfile({ savedProperties: next });
      } else {
        writeLocalIds(next);
      }
    },
    [ids, isAuthenticated, user, updateProfile]
  );

  return { savedIds: ids, isSaved: (id) => ids.includes(id), toggle };
}
