"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

/** Pass `href` to always redirect to a fixed route (e.g. navbar top-level pages go to "/"); omit it to go to the previous page in history. */
export default function BackButton({ href, className = "" }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => (href ? router.push(href) : router.back())}
      aria-label="Go back"
      className={`flex h-11 w-11 shrink-0 items-center justify-center border border-navy-700/60 bg-navy-900 text-cream transition hover:border-gold-400 hover:text-gold-400 ${className}`}
    >
      <FiArrowLeft className="h-5 w-5" />
    </button>
  );
}
