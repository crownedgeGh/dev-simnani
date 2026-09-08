export default function AdminFormField({
  label,
  id,
  error,
  required,
  hint,
  children,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-[#374151] uppercase tracking-wide"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-[11px] text-[#9ca3af]">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-red-500">{error}</p>
      )}
    </div>
  );
}

// Shared input class
export const adminInputClass =
  "h-11 w-full rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-3 text-sm text-[#1a1a2e] placeholder-[#9ca3af] outline-none transition focus:border-[#f0b429] focus:ring-2 focus:ring-[#f0b429]/20";

export const adminSelectClass =
  "h-11 w-full rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-3 text-sm text-[#1a1a2e] outline-none transition focus:border-[#f0b429] focus:ring-2 focus:ring-[#f0b429]/20 cursor-pointer";

export const adminTextareaClass =
  "w-full rounded-xl border border-[#e8e0d5] bg-[#faf8f5] px-3 py-2.5 text-sm text-[#1a1a2e] placeholder-[#9ca3af] outline-none transition focus:border-[#f0b429] focus:ring-2 focus:ring-[#f0b429]/20 resize-none";
