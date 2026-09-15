"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null); // { fullName, mobile, email, accountType, accountId, city, ... }

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.success) return;
        setUser(data.data);
        setIsAuthenticated(true);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

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
        if (data.success) setUser(data.data);
        return data;
      } catch (err) {
        return { success: false, error: err.message || "Failed to update profile" };
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, loginWithMobile, logout, updateProfile }}
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
