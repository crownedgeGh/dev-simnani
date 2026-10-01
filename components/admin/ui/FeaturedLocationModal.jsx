"use client";

import { useEffect, useState } from "react";
import AdminDialog from "./AdminDialog";
import { TEST_STATES, getTestCitiesForState } from "@/lib/testCities";

export default function FeaturedLocationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Feature this listing",
  description = "Pick the state and city this featured listing should be shown for.",
  isLoading = false,
  initialState = "",
  initialCity = "",
}) {
  const [state, setState] = useState(initialState);
  const [city, setCity] = useState(initialCity);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets form fields when the dialog opens for a new row
      setState(initialState || "");
      setCity(initialCity || "");
    }
  }, [isOpen, initialState, initialCity]);

  const cityOptions = state ? getTestCitiesForState(state) : [];

  function handleStateChange(e) {
    const next = e.target.value;
    setState(next);
    setCity("");
  }

  const canConfirm = state && city && !isLoading;

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-9 rounded-xl border border-[#e8e0d5] px-4 text-sm text-[#6b7280] transition hover:bg-[#faf8f5] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ state, city })}
            disabled={!canConfirm}
            className="h-9 rounded-xl bg-[#f0b429] px-4 text-sm font-medium text-white transition hover:bg-[#d97706] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Saving…" : "Confirm & Feature"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[#6b7280]">State</span>
          <select
            value={state}
            onChange={handleStateChange}
            className="h-11 rounded-xl border border-[#e8e0d5] bg-white px-3 text-sm text-[#374151] outline-none transition focus:border-[#f0b429]"
          >
            <option value="" disabled>
              Select state
            </option>
            {TEST_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[#6b7280]">City</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={!state}
            className="h-11 rounded-xl border border-[#e8e0d5] bg-white px-3 text-sm text-[#374151] outline-none transition focus:border-[#f0b429] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              {state ? "Select city" : "Select a state first"}
            </option>
            {cityOptions.map(({ city: c }) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
    </AdminDialog>
  );
}
