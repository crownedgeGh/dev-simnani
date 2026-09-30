"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        setIsAdminAuthenticated(!!data.authenticated);
        setAdminUser(data.authenticated ? { name: "Super Admin" } : null);
      })
      .catch(() => setIsAdminAuthenticated(false))
      .finally(() => setIsLoading(false));
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminUser({ email, name: "Super Admin" });
        setIsAdminAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: data.error || "Invalid credentials" };
    } catch {
      return { success: false, error: "Login failed. Please try again." };
    }
  }, []);

  const adminLogout = useCallback(() => {
    fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setAdminUser(null);
    setIsAdminAuthenticated(false);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ isAdminAuthenticated, isLoading, adminUser, adminLogin, adminLogout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
  return ctx;
}
