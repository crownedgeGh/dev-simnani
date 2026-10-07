"use client";

import { MdContentCopy } from "react-icons/md";
import { toast } from "sonner";

// Bare copy-icon button for any value shown inline in admin tables/dialogs.
export default function AdminCopyCell({ value, label = "Value" }) {
  if (!value) return null;

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Couldn't copy — please copy manually");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#9ca3af] transition hover:bg-[#fff8e1] hover:text-[#d97706]"
      aria-label={`Copy ${value}`}
      title={`Copy ${label.toLowerCase()}`}
    >
      <MdContentCopy size={13} />
    </button>
  );
}
