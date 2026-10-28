"use client";

import { useEffect, useState } from "react";

/**
 * Persists a multi-step form's step + field values to sessionStorage while
 * the tab stays open, so step navigation (back/next) doesn't lose data.
 * A page reload/close is intentionally NOT recoverable: in-memory
 * verification state (OTP-verified, submitting flags, etc.) can't be
 * serialized alongside the draft, so resuming mid-step after a reload leaves
 * the form out of sync with what's actually saved server-side. Instead, a
 * reload warns via the browser's native confirm and — if the user reloads
 * anyway — wipes the draft so they land back on step 1 with a clean form.
 * Call `clearDraft()` once the form is actually submitted to the database.
 */
export function useWizardDraft(storageKey, initialForm, initialStep = 1) {
  const [step, setStep] = useState(initialStep);
  const [form, setForm] = useState(initialForm);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    function handleBeforeUnload(e) {
      e.preventDefault();
      e.returnValue = "";
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [storageKey]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.form) {
          const restoredForm = Object.fromEntries(
            Object.entries(draft.form).map(([key, value]) => [key, value === null ? "" : value])
          );
          setForm((prev) => ({ ...prev, ...restoredForm }));
        }
        if (draft.step) setStep(draft.step);
      }
    } catch {
      // ignore corrupt/unavailable storage
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const serializableForm = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [
          key,
          value instanceof File || /password/i.test(key) ? null : value,
        ])
      );
      sessionStorage.setItem(storageKey, JSON.stringify({ step, form: serializableForm }));
    } catch {
      // ignore quota/unavailable storage
    }
  }, [storageKey, step, form, hydrated]);

  function clearDraft() {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }

  return { step, setStep, form, setForm, clearDraft };
}
