"use client";

import { useState } from "react";
import { MdClose } from "react-icons/md";

export default function FileUpload({ id, label, hint, file, onChange, optional, required, maxSizeMB = 10 }) {
  const [error, setError] = useState("");
  const fileName = typeof file === "string" ? file.split("/").pop() : file?.name;

  function handleChange(e) {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    if (picked.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB`);
      return;
    }
    setError("");
    onChange(picked);
  }

  function handleRemove(e) {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="tracked-label flex items-center gap-1 text-xs text-cream/80">
        {label}
        {required && <span className="text-gold-400">*</span>}
        {optional && (
          <span className="ml-1 normal-case tracking-normal text-muted">(Optional)</span>
        )}
      </label>
      <label
        htmlFor={id}
        className="relative flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-navy-700/60 bg-navy-950 px-4 py-6 text-center transition hover:border-gold-400"
      >
        {fileName && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove ${label}`}
            className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-red-500/10 hover:text-red-400"
          >
            <MdClose size={18} />
          </button>
        )}
        <span className="text-sm text-cream">
          {fileName || "Click to upload or drag and drop"}
        </span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </label>
      {error && <span className="text-xs text-red-400">{error}</span>}
      <input
        id={id}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
