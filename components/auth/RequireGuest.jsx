"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
//
// Exception 1: a signed-in user with an unfinished registration
// (profileComplete === false) must be allowed through — that's the "Complete
// Your Profile" link from the account page resuming this very wizard.
// Redirecting them to the portal would make that link a dead end.
//
// Exception 2: ?edit=1 — the account page's Edit Profile button links back
// into this same wizard even for an already-complete profile, so the user
// can revise any step. Must be allowed through regardless of profileComplete.
export default function RequireGuest({ children }) {
  return (
    <Suspense fallback={null}>
      <RequireGuestInner>{children}</RequireGuestInner>
    </Suspense>
  );
}

function RequireGuestInner({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = searchParams.get("edit") === "1";
  const redirectTo = getAccountPermissions(user?.accountType, user?.cpType).portalHref;

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

  const shouldRedirect = wasAuthedOnLoad === true && user?.profileComplete !== false && !isEditing;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(redirectTo);
    }
  }, [shouldRedirect, redirectTo, router]);

  if (isLoading || shouldRedirect) return null;

  return children;
}
