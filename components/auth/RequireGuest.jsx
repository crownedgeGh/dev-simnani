"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAccountPermissions } from "@/lib/accountPermissions";

// Blocks rendering of guest-only pages (login, registration) once a session
// exists — e.g. a signed-in user hitting Back into /auth/register/* gets
// redirected to their own portal instead of being able to re-register as a
// different account type while already logged in.
//
// Only guards against a session that already existed when the page loaded
// (the back-button case). If the user becomes authenticated *during* this
// page's lifetime — i.e. they just submitted this very registration form —
// isAuthenticated flips true while still mounted, but that's the wizard's
// own submit handler navigating them (e.g. to "/" or "/buy"); this guard
// must not race it with its own redirect to the portal.
export default function RequireGuest({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const redirectTo = getAccountPermissions(user?.accountType).portalHref;

  // Snapshot isAuthenticated the first time auth is known to be resolved.
  // AuthProvider lives in the root layout and never remounts on client-side
  // navigation, so isLoading is often already false the instant this page
  // mounts (e.g. every SPA navigation after the first) — there is no
  // loading-to-loaded *transition* to watch for. Render-time "adjusting
  // state" pattern per react.dev/learn/you-might-not-need-an-effect.
  const [wasAuthedOnLoad, setWasAuthedOnLoad] = useState(null);
  if (!isLoading && wasAuthedOnLoad === null) {
    setWasAuthedOnLoad(isAuthenticated);
  }

  const shouldRedirect = wasAuthedOnLoad === true;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(redirectTo);
    }
  }, [shouldRedirect, redirectTo, router]);

  if (isLoading || shouldRedirect) return null;

  return children;
}
