"use client";

import { useEffect, useState } from "react";
import { MdAdd, MdClose } from "react-icons/md";
import AdminDialog from "./AdminDialog";
import StateCitySearchFields from "@/components/shared/StateCitySearchFields";

const emptyRow = () => ({ state: "", city: "" });
const EMPTY_LOCATIONS = [];

export default function FeaturedLocationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Feature this listing",
  description = "Pick the state and city this featured listing should be shown for.",
  isLoading = false,
  initialState = "",
  initialCity = "",
  multiple = false,
  initialLocations = EMPTY_LOCATIONS,
}) {
  const [locations, setLocations] = useState(
    initialLocations.length ? initialLocations : [emptyRow()]
  );

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets form fields when the dialog opens for a new row
      setLocations(
        initialLocations.length
          ? initialLocations
          : [{ state: initialState || "", city: initialCity || "" }]
      );
    }
  }, [isOpen, initialState, initialCity, initialLocations]);

  const canConfirm =
    locations.length > 0 && locations.every((l) => l.state && l.city) && !isLoading;

  function updateRow(index, patch) {
    setLocations((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function removeRow(index) {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  }

  function handleConfirm() {
    if (multiple) {
      onConfirm({ locations });
    } else {
      onConfirm({ state: locations[0].state, city: locations[0].city });
    }
  }

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
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="h-9 rounded-xl bg-[#f0b429] px-4 text-sm font-medium text-white transition hover:bg-[#d97706] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Saving…" : "Confirm & Feature"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {locations.map((loc, i) => (
          <div key={i} className="flex flex-col gap-2">
            {multiple && locations.length > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#6b7280]">City {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="rounded-lg p-1 text-[#9ca3af] transition hover:bg-[#faf8f5] hover:text-[#374151]"
                  aria-label="Remove city"
                >
                  <MdClose className="h-4 w-4" />
                </button>
              </div>
            )}
            <StateCitySearchFields
              state={loc.state}
              city={loc.city}
              onChange={({ state, city }) => updateRow(i, { state, city })}
            />
          </div>
        ))}

        {multiple && (
          <button
            type="button"
            onClick={() => setLocations((prev) => [...prev, emptyRow()])}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#e8e0d5] text-sm text-[#6b7280] transition hover:border-[#f0b429] hover:text-[#d97706]"
          >
            <MdAdd className="h-4 w-4" />
            Add another city
          </button>
        )}
      </div>
    </AdminDialog>
  );
}
