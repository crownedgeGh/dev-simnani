"use client";

import { MdContentCopy } from "react-icons/md";
import { toast } from "sonner";

// Shared "phone number + copy icon" renderer — used everywhere a mobile
// number is displayed across the admin panel (tables, detail dialogs, cards).
export default function AdminPhoneCell({ value, className = "" }) {
  if (!value) return <span className="text-sm text-[#9ca3af]">—</span>;

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Phone number copied");
    } catch {
      toast.error("Couldn't copy — please copy manually");
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} onClick={(e) => e.stopPropagation()}>
      <span className="text-sm text-[#374151]">{value}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#9ca3af] transition hover:bg-[#fff8e1] hover:text-[#d97706]"
        aria-label={`Copy ${value}`}
        title="Copy number"
      >
        <MdContentCopy size={13} />
      </button>
    </span>
  );
}
