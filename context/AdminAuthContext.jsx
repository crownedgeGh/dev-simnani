"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AdminAuthContext = createContext(null);

const ADMIN_TOKEN_KEY = "se_admin_token";
const ADMIN_CREDENTIALS = { email: "admin@simnani.com", password: "admin123" };

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
      setAdminUser({ email: ADMIN_CREDENTIALS.email, name: "Super Admin" });
      setIsAdminAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const adminLogin = useCallback((email, password) => {
    if (
      email === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password
    ) {
      localStorage.setItem(ADMIN_TOKEN_KEY, `admin_token_${Date.now()}`);
      setAdminUser({ email, name: "Super Admin" });
      setIsAdminAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
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
