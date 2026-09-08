"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AdminThemeContext = createContext(null);
const THEME_STORAGE_KEY = "admin_theme";

export function AdminThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
      }
    } catch {
      // ignore localStorage errors
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    if (theme === "dark") {
      document.documentElement.classList.add("admin-dark");
    } else {
      document.documentElement.classList.remove("admin-dark");
    }
    return () => {
      document.documentElement.classList.remove("admin-dark");
    };
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const isDark = theme === "dark";

  return (
    <AdminThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    return { theme: "light", isDark: false, toggleTheme: () => {} };
  }
  return ctx;
}
