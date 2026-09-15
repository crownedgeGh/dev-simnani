"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAccountPermissions } from "@/lib/accountPermissions";

// Blocks rendering of guest-only pages (login, registration) once a session
// exists — e.g. a signed-in user hitting Back into /auth/register/* gets
// redirected to their own portal instead of being able to re-register as a
// different account type while already logged in.
export default function RequireGuest({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const redirectTo = getAccountPermissions(user?.accountType).portalHref;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, router]);

  if (isLoading || isAuthenticated) return null;

  return children;
}
