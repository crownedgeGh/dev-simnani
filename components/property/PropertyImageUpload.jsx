"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MdCloudUpload, MdVideocam } from "react-icons/md";
import { MAX_VIDEO_BYTES } from "@/lib/videoCompress";

const ACCEPT = ".jpg,.jpeg,.png,.webp";
const VIDEO_ACCEPT = ".mp4,.webm,.mov";

// `photos` is a single ordered list mixing existing URLs and newly-picked Files.
// The item at index 0 is always the cover image — "Make Cover" reorders the list
// instead of tracking a separate cover field, so there is only one source of truth.
export function PhotosUpload({ id, label, hint, photos, onChange, optional, max = 11 }) {
  const [isDragging, setIsDragging] = useState(false);

  function addFiles(fileList) {
    const selected = Array.from(fileList || []);
    if (!selected.length) return;
    const room = Math.max(max - photos.length, 0);
    const newItems = selected.slice(0, room).map((file) => ({ type: "new", file }));
    if (newItems.length) onChange([...photos, ...newItems]);
  }

  function handleSelect(event) {
    addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function handleRemove(index) {
    onChange(photos.filter((_, i) => i !== index));
  }

  function handleSetCover(index) {
    if (index === 0) return;
    const next = [...photos];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
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
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex min-h-[7rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-4 py-8 text-center transition sm:py-10 ${
          isDragging ? "border-gold-400 bg-navy-900" : "border-navy-700/60 bg-navy-950 hover:border-gold-400"
        }`}
      >
        <MdCloudUpload className="h-7 w-7 text-gold-400" />
        <span className="text-sm text-cream">
          {photos.length
            ? `${photos.length} / ${max} photos added — click to add more`
            : "Click to upload or drag and drop"}
        </span>
        {hint && <span className="max-w-sm text-xs text-muted">{hint}</span>}
      </label>
      <input
        id={id}
        type="file"
        accept={ACCEPT}
        multiple
        disabled={photos.length >= max}
        className="hidden"
        onChange={handleSelect}
      />

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((item, index) => (
            <PhotoThumb
              key={item.type === "existing" ? item.url : `${item.file.name}-${item.file.lastModified}-${index}`}
              item={item}
              isCover={index === 0}
              onSetCover={() => handleSetCover(index)}
              onRemove={() => handleRemove(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoThumb({ item, isCover, onSetCover, onRemove }) {
  const objectUrl = useObjectUrl(item.type === "new" ? item.file : null);
  const src = item.type === "existing" ? item.url : objectUrl;

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-sm border bg-navy-950 ${
        isCover ? "border-gold-400" : "border-navy-700/60"
      }`}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      )}
      {isCover && (
        <span className="tracked-label absolute left-1.5 top-1.5 bg-gold-400 px-1.5 py-1 text-[10px] text-navy-950">
          Cover
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center bg-navy-950/80 text-sm text-cream transition hover:bg-red-500/80"
      >
        ×
      </button>
      {!isCover && (
        <button
          type="button"
          onClick={onSetCover}
          className="tracked-label absolute inset-x-0 bottom-0 min-h-[2.25rem] bg-navy-950/80 text-[10px] text-cream transition hover:bg-gold-400 hover:text-navy-950"
        >
          Make Cover
        </button>
      )}
    </div>
  );
}

export function VideoUpload({ id, label, hint, file, existingUrl, onRemoveExisting, onChange, optional }) {
  const objectUrl = useObjectUrl(file);
  const previewUrl = objectUrl || existingUrl || null;

  function handleSelect(selected) {
    if (!selected) {
      onChange(null);
      return;
    }
    if (selected.size > MAX_VIDEO_BYTES) {
      toast.error(`Video should be under ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))}MB`);
      return;
    }
    onChange(selected);
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="tracked-label text-xs text-cream/80">
        {label}
        {optional && (
          <span className="ml-1 normal-case tracking-normal text-muted">(Optional)</span>
        )}
      </label>

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-sm border border-navy-700/60 bg-navy-950">
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
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-navy-700/60 bg-navy-950 px-4 py-8 text-center transition hover:border-gold-400"
        >
          <MdVideocam className="h-7 w-7 text-gold-400" />
          <span className="text-sm text-cream">Click to upload or drag and drop</span>
          {hint && <span className="text-xs text-muted">{hint}</span>}
        </label>
      )}

      <input
        id={id}
        type="file"
        accept={VIDEO_ACCEPT}
        className="hidden"
        onChange={(e) => handleSelect(e.target.files?.[0] || null)}
      />
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
