"use client";

import { useEffect, useState } from "react";
import BlurredImageFrame from "@/components/property/BlurredImageFrame";

const ACCEPT = ".jpg,.jpeg,.png,.webp";
const VIDEO_ACCEPT = ".mp4,.webm,.mov";

export function CoverImageUpload({ id, label, hint, file, existingUrl, onRemoveExisting, onChange, optional }) {
  const objectUrl = useObjectUrl(file);
  const previewUrl = objectUrl || existingUrl || null;

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
          <BlurredImageFrame src={previewUrl} alt="Cover preview" className="h-48 w-full" />
          <div className="flex items-center justify-between border-t border-navy-700/60 bg-navy-950 px-4 py-2">
            <span className="truncate text-xs text-muted">
              {file ? file.name : "Current cover image"}
            </span>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                onRemoveExisting?.();
              }}
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

export function GalleryImageUpload({
  id,
  label,
  hint,
  files,
  existingUrls = [],
  onRemoveExisting,
  onChange,
  optional,
  max = 10,
}) {
  const totalCount = existingUrls.length + files.length;

  function handleSelect(event) {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;
    onChange([...files, ...selected].slice(0, Math.max(max - existingUrls.length, 0)));
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
          {totalCount ? `${totalCount} / ${max} photos selected — add more` : "Click to upload or drag and drop"}
        </span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </label>
      <input
        id={id}
        type="file"
        accept={ACCEPT}
        multiple
        disabled={totalCount >= max}
        className="hidden"
        onChange={handleSelect}
      />

      {totalCount > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {existingUrls.map((url, index) => (
            <ExistingGalleryThumb key={url} url={url} onRemove={() => onRemoveExisting?.(index)} />
          ))}
          {files.map((file, index) => (
            <GalleryThumb key={`${file.name}-${file.lastModified}-${index}`} file={file} onRemove={() => handleRemove(index)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function VideoUpload({ id, label, hint, file, existingUrl, onRemoveExisting, onChange, optional }) {
  const objectUrl = useObjectUrl(file);
  const previewUrl = objectUrl || existingUrl || null;

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
          <video src={previewUrl} controls className="h-48 w-full object-cover" />
          <div className="flex items-center justify-between border-t border-navy-700/60 bg-navy-950 px-4 py-2">
            <span className="truncate text-xs text-muted">
              {file ? file.name : "Current video"}
            </span>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                onRemoveExisting?.();
              }}
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
        accept={VIDEO_ACCEPT}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  );
}

function ExistingGalleryThumb({ url, onRemove }) {
  return (
    <div className="relative aspect-square overflow-hidden border border-navy-700/60 bg-navy-950">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center bg-navy-950/80 text-xs text-cream transition hover:bg-red-500/80"
      >
        ×
      </button>
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
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing to external blob URL lifecycle
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}
