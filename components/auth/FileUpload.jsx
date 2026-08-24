export default function FileUpload({ id, label, hint, file, onChange, optional }) {
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
          {file ? file.name : "Click to upload or drag and drop"}
        </span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </label>
      <input
        id={id}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  );
}
