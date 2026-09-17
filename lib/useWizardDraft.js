"use client";

import { useEffect, useState } from "react";

/**
 * Persists a multi-step form's step + field values to sessionStorage so a
 * page refresh resumes on the same step instead of resetting to step 1.
 * File objects can't be serialized, so they're dropped from the draft and
 * must be re-uploaded after a refresh. Call `clearDraft()` once the form is
 * actually submitted to the database.
 */
export function useWizardDraft(storageKey, initialForm, initialStep = 1) {
  const [step, setStep] = useState(initialStep);
  const [form, setForm] = useState(initialForm);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.form) setForm((prev) => ({ ...prev, ...draft.form }));
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
