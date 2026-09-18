"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MdSearch, MdKeyboardArrowDown } from "react-icons/md";
import { inputClass } from "@/components/auth/inputStyles";

export default function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Type to search…",
  disabled = false,
  emptyMessage = "No matches found",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  function openDropdown() {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function selectOption(option) {
    onChange(option);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative">
      {!open ? (
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={openDropdown}
          className={`${className || inputClass} flex items-center justify-between text-left disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span className={value ? "truncate text-cream" : "truncate text-muted"}>
            {value || placeholder}
          </span>
          <MdKeyboardArrowDown className="ml-2 h-5 w-5 shrink-0 text-muted" />
        </button>
      ) : (
        <div className="relative">
          <MdSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            ref={inputRef}
            id={id}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className={`${className || inputClass} pl-10`}
          />
        </div>
      )}

      {open && (
        <div className="absolute z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-sm border border-navy-700/60 bg-navy-900 p-1.5 shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-center text-xs text-muted">{emptyMessage}</p>
          ) : (
            filtered.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => selectOption(option)}
                className={`flex min-h-[44px] w-full items-center rounded-sm px-3 text-left text-sm transition ${
                  option === value ? "bg-gold-400/10 text-gold-400" : "text-cream hover:bg-navy-800"
                }`}
              >
                {option}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
