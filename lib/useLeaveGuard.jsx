"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmCloseModal from "@/components/property/ConfirmCloseModal";

/**
 * While `dirty`, asks before leaving: wrap in-app back buttons with
 * `guard(proceed)`, and any internal <a> click (navbar, Post Property…) is
 * intercepted too. Render `modal` once in the component.
 */
export function useLeaveGuard(dirty) {
  const router = useRouter();
  const [pending, setPending] = useState(null);
  const bypassRef = useRef(false);

  useEffect(() => {
    if (!dirty) return;
    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (bypassRef.current) return;
      // Navbar buttons (Post Property, account menu) opt in with data-leave-guard.
      const btn = e.target.closest?.("[data-leave-guard]");
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        setPending(() => () => {
          bypassRef.current = true;
          btn.click();
          bypassRef.current = false;
        });
        return;
      }
      const a = e.target.closest?.("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      e.preventDefault();
      e.stopPropagation(); // capture phase: keeps the Link's own onClick/navigation from running
      setPending(() => () => router.push(url.pathname + url.search + url.hash));
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty, router]);

  function guard(proceed) {
    if (dirty) setPending(() => proceed);
    else proceed();
  }

  const modal = (
    <ConfirmCloseModal
      isOpen={!!pending}
      onCancel={() => setPending(null)}
      onConfirm={() => {
        pending?.();
        setPending(null);
      }}
    />
  );

  return { guard, modal };
}
