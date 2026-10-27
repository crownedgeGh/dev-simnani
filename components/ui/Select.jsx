"use client";

import { useEffect, useRef, useState } from "react";
import { MdCheck } from "react-icons/md";
import { FiChevronDown } from "react-icons/fi";

/**
 * Theme-styled drop-in replacement for a native <select>.
 * Pass `options` as an array of strings or { value, label } objects.
 * `onChange` receives a native-select-shaped event (`{ target: { value } }`)
 * so existing `(e) => setX(e.target.value)` handlers keep working unchanged.
 */
export default function Select({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  const selected = normalized.find((o) => String(o.value) === String(value));

  function selectOption(option) {
    onChange?.({ target: { name, value: option.value } });
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`${className} flex items-center justify-between text-left disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className={`truncate ${selected ? "text-cream" : "text-muted"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown
          aria-hidden="true"
          className={`ml-2 h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="gold-scrollbar absolute left-0 right-0 z-30 mt-1.5 max-h-64 overflow-y-auto rounded-2xl border border-navy-700/60 bg-navy-900 p-1.5 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.9)]"
        >
          {normalized.map((option) => {
            const isSelected = String(option.value) === String(value);
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectOption(option)}
                className={`flex min-h-[40px] w-full items-center gap-2 rounded-xl px-3 text-left text-sm transition active:scale-[0.98] ${
                  isSelected ? "bg-gold-400/10 text-gold-400" : "text-cream hover:bg-gold-400/10 hover:text-gold-400"
                }`}
              >
                <MdCheck className={`h-4 w-4 shrink-0 ${isSelected ? "opacity-100" : "opacity-0"}`} />
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
