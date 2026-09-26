"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

/**
 * Pass `href` to always redirect to a fixed route (e.g. navbar top-level pages go to "/"); omit it to go to the previous page in history.
 * Pass `onClick` to fully override the navigation (e.g. to intercept with a confirmation modal first).
 */
export default function BackButton({ href, className = "", onClick }) {
  const router = useRouter();

  function handleClick() {
    if (onClick) {
      onClick();
      return;
    }
    href ? router.push(href) : router.back();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Go back"
      className={`flex h-11 w-11 shrink-0 items-center justify-center border border-navy-700/60 bg-navy-900 text-cream transition hover:border-gold-400 hover:text-gold-400 ${className}`}
    >
      <FiArrowLeft className="h-5 w-5" />
    </button>
  );
}
