"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Intercepts the browser/swipe back gesture and redirects to `href` instead of the previous page. */
export default function ForceBackRedirect({ href }) {
  const router = useRouter();

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    function handlePopState() {
      window.history.pushState(null, "", window.location.href);
      router.push(href);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [href, router]);

  return null;
}
