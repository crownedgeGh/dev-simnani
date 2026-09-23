"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { trackEvent } from "@/lib/gtag";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null); // { fullName, mobile, email, accountType, accountId, city, ... }

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = res.ok ? await res.json() : null;
      if (data?.success && data.data) {
        setUser(data.data);
        setIsAuthenticated(true);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("se_auth_user", JSON.stringify(data.data));
          } catch {}
        }
        return data.data;
      } else if (res?.status === 401 || data?.success === false) {
        setUser(null);
        setIsAuthenticated(false);
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("se_auth_user");
          } catch {}
        }
      }
    } catch {
      // network/server error — keep cached session if present
    }
    return null;
  }, []);

  useEffect(() => {
    // 1. Immediately hydrate from cached localStorage on client mount (safe from SSR mismatch)
    try {
      const saved = localStorage.getItem("se_auth_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.accountId) {
          setUser(parsed);
          setIsAuthenticated(true);
        }
      }
    } catch {}

    // 2. Validate against server session in background
    let active = true;
    Promise.resolve()
      .then(() => fetchMe())
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchMe]);

  /**
   * refreshUser — re-fetches the current session's user record from the DB.
   * Used where server-side state can change without a client action, e.g. an
   * admin approving a channel partner while they're waiting on their portal.
   */
  const refreshUser = useCallback(() => fetchMe(), [fetchMe]);

  /**
   * login — called after registration wizard submit, or tester login.
   * Creates a DB-backed session for the given profile's accountId (the user
   * record itself must already exist, or is created on first use for the
   * tester account). The first argument is a legacy token placeholder kept
   * for call-site compatibility — the server is the source of truth now.
   */
  const login = useCallback(async (_token, profile) => {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Login failed");
    setUser(data.data);
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("se_auth_user", JSON.stringify(data.data));
      } catch {}
    }
    trackEvent("login", { method: "session", account_type: data.data?.accountType });
    return data.data;
  }, []);

  /**
   * loginWithMobile — OTP login path. Looks the user up by mobile number in
   * the database (creating a minimal Common Person profile on first login).
   */
  const loginWithMobile = useCallback(async (mobile) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Login failed");
    setUser(data.data);
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("se_auth_user", JSON.stringify(data.data));
      } catch {}
    }
    trackEvent("login", { method: "otp_mobile", account_type: data.data?.accountType });
    return data.data;
  }, []);

  /**
   * loginWithPassword — mobile + password login path, the alternative to
   * the OTP flow above. Fails if the account has no password set (e.g. it
   * was only ever used via OTP login).
   */
  const loginWithPassword = useCallback(async (mobile, password) => {
    const res = await fetch("/api/auth/login-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Login failed");
    setUser(data.data);
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("se_auth_user", JSON.stringify(data.data));
      } catch {}
    }
    trackEvent("login", { method: "password", account_type: data.data?.accountType });
    return data.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // best-effort — clear local state regardless
    }
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("se_auth_user");
      } catch {}
    }
  }, []);

  /**
   * updateProfile — persists a patch to the user's DB record and refreshes
   * local state from the server's response.
   */
  const updateProfile = useCallback(
    async (patch) => {
      if (!user?.accountId) return { success: false, error: "Not authenticated" };
      try {
        const res = await fetch(`/api/users/${user.accountId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("se_auth_user", JSON.stringify(data.data));
            } catch {}
          }
        }
        return data;
      } catch (err) {
        return { success: false, error: err.message || "Failed to update profile" };
      }
    },
    [user]
  );

  /**
   * resetPassword — updates the user's password in MongoDB and sets up
   * an authenticated session.
   */
  const resetPassword = useCallback(async (mobile, password, confirmPassword) => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, password, confirmPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to reset password");
    setUser(data.data);
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("se_auth_user", JSON.stringify(data.data));
      } catch {}
    }
    return data.data;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        loginWithMobile,
        loginWithPassword,
        resetPassword,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
