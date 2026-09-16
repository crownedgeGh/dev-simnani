"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MdSearch, MdKeyboardArrowDown, MdClose } from "react-icons/md";
import { adminInputClass } from "@/components/admin/ui/AdminFormField";

export default function AdminSearchableSelect({
  id,
  value,
  onChange,
  options, // string[]
  placeholder = "Select…",
  searchPlaceholder = "Type to search…",
  disabled = false,
  emptyMessage = "No matches found",
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

  const openDropdown = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const selectOption = (option) => {
    onChange(option);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative">
      {!open ? (
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={openDropdown}
          className={`${adminInputClass} flex items-center justify-between text-left disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span className={value ? "truncate text-[#1a1a2e]" : "truncate text-[#9ca3af]"}>
            {value || placeholder}
          </span>
          <MdKeyboardArrowDown size={18} className="ml-2 shrink-0 text-[#9ca3af]" />
        </button>
      ) : (
        <div className="relative">
          <MdSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            ref={inputRef}
            id={id}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className={`${adminInputClass} pl-9 pr-9`}
          />
          <button
            type="button"
            onClick={() => { setOpen(false); setQuery(""); }}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#9ca3af] transition hover:bg-[#faf8f5] hover:text-[#6b7280]"
            aria-label="Close"
          >
            <MdClose size={16} />
          </button>
        </div>
      )}

      {open && (
        <div className="absolute z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-[#e8e0d5] bg-white p-1.5 shadow-lg gold-scrollbar">
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-center text-xs text-[#9ca3af]">{emptyMessage}</p>
          ) : (
            filtered.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => selectOption(option)}
                className={`flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-sm transition ${
                  option === value ? "bg-[#fff8e1] text-[#d97706] font-semibold" : "text-[#374151] hover:bg-[#faf8f5]"
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
