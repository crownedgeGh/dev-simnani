"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { ALL_STATES, getCitiesForState } from "@/lib/indianCities";

const DEFAULT_INPUT_CLASS =
  "h-11 w-full rounded-xl border border-[#e8e0d5] bg-white px-3 text-sm text-[#374151] outline-none transition focus:border-[#f0b429] disabled:cursor-not-allowed disabled:opacity-50";
const DEFAULT_LABEL_CLASS = "text-xs font-medium text-[#6b7280]";
const DEFAULT_MENU_CLASS = "border border-[#e8e0d5] bg-white text-[#374151]";
const DEFAULT_OPTION_CLASS = "text-[#374151] hover:bg-[#faf8f5] hover:text-[#1a1a2e]";

// Click-to-open searchable dropdown — plain controlled input + filtered
// option list, since native <datalist> doesn't reliably open on click/tap
// across browsers (notably mobile Safari). No picker dependency.
function Combobox({
  value,
  onInputChange,
  onSelect,
  options,
  placeholder,
  disabled,
  inputClassName,
  menuClassName,
  optionClassName,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filtered = options.filter((o) => o.toLowerCase().includes((value || "").trim().toLowerCase())).slice(0, 200);

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => {
            onInputChange(e.target.value);
            setOpen(true);
          }}
          className={`${inputClassName} pr-9`}
        />
        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
      </div>
      {open && !disabled && (
        <div className={`absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl ${menuClassName}`}>
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm opacity-60">No match</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-sm transition ${optionClassName}`}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function StateCitySearchFields({
  state,
  city,
  onChange,
  inputClassName = DEFAULT_INPUT_CLASS,
  labelClassName = DEFAULT_LABEL_CLASS,
  menuClassName = DEFAULT_MENU_CLASS,
  optionClassName = DEFAULT_OPTION_CLASS,
}) {
  const cityOptions = getCitiesForState(state);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className={labelClassName}>State</span>
        <Combobox
          value={state}
          options={ALL_STATES}
          placeholder="Search state…"
          onInputChange={(text) => onChange({ state: text, city: "" })}
          onSelect={(s) => onChange({ state: s, city: "" })}
          inputClassName={inputClassName}
          menuClassName={menuClassName}
          optionClassName={optionClassName}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClassName}>City</span>
        <Combobox
          value={city}
          options={cityOptions}
          disabled={!state}
          placeholder={state ? "Search city…" : "Select a state first"}
          onInputChange={(text) => onChange({ state, city: text })}
          onSelect={(c) => onChange({ state, city: c })}
          inputClassName={inputClassName}
          menuClassName={menuClassName}
          optionClassName={optionClassName}
        />
      </label>
    </div>
  );
}
