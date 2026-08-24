export default function FormField({ label, htmlFor, required, optional, hint, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="tracked-label flex items-center gap-1 text-xs text-cream/80">
        {label}
        {required && <span className="text-gold-400">*</span>}
        {optional && (
          <span className="normal-case tracking-normal text-muted">(Optional)</span>
        )}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
