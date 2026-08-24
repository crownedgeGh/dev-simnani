"use client";

import { useEffect, useMemo } from "react";

const ACCEPT = ".jpg,.jpeg,.png,.webp";

export function CoverImageUpload({ id, label, hint, file, onChange, optional }) {
  const previewUrl = useObjectUrl(file);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="tracked-label text-xs text-cream/80">
        {label}
        {optional && (
          <span className="ml-1 normal-case tracking-normal text-muted">(Optional)</span>
        )}
      </label>

      {previewUrl ? (
        <div className="relative overflow-hidden border border-navy-700/60 bg-navy-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Cover preview" className="h-48 w-full object-cover" />
          <div className="flex items-center justify-between border-t border-navy-700/60 bg-navy-950 px-4 py-2">
            <span className="truncate text-xs text-muted">{file.name}</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="tracked-label ml-3 shrink-0 text-xs text-cream/80 transition hover:text-gold-400"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-navy-700/60 bg-navy-950 px-4 py-8 text-center transition hover:border-gold-400"
        >
          <span className="text-sm text-cream">Click to upload or drag and drop</span>
          {hint && <span className="text-xs text-muted">{hint}</span>}
        </label>
      )}

      <input
        id={id}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  );
}

export function GalleryImageUpload({ id, label, hint, files, onChange, optional, max = 10 }) {
  function handleSelect(event) {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;
    onChange([...files, ...selected].slice(0, max));
    event.target.value = "";
  }

  function handleRemove(index) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="tracked-label text-xs text-cream/80">
        {label}
        {optional && (
          <span className="ml-1 normal-case tracking-normal text-muted">(Optional)</span>
        )}
      </label>

      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-navy-700/60 bg-navy-950 px-4 py-6 text-center transition hover:border-gold-400"
      >
        <span className="text-sm text-cream">
          {files.length ? `${files.length} / ${max} photos selected — add more` : "Click to upload or drag and drop"}
        </span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </label>
      <input
        id={id}
        type="file"
        accept={ACCEPT}
        multiple
        disabled={files.length >= max}
        className="hidden"
        onChange={handleSelect}
      />

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {files.map((file, index) => (
            <GalleryThumb key={`${file.name}-${file.lastModified}-${index}`} file={file} onRemove={() => handleRemove(index)} />
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryThumb({ file, onRemove }) {
  const previewUrl = useObjectUrl(file);

  return (
    <div className="relative aspect-square overflow-hidden border border-navy-700/60 bg-navy-950">
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="h-full w-full object-cover" />
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center bg-navy-950/80 text-xs text-cream transition hover:bg-red-500/80"
      >
        ×
      </button>
    </div>
  );
}

function useObjectUrl(file) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return url;
}
