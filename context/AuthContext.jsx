"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const STORAGE_TOKEN_KEY = "se_auth_token";
const STORAGE_PROFILE_KEY = "se_user_profile";

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null); // { fullName, mobile, email, accountType, accountId, city, ... }

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (token) {
      const profileRaw = localStorage.getItem(STORAGE_PROFILE_KEY);
      const profile = profileRaw ? JSON.parse(profileRaw) : null;
      setUser(profile);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  /**
   * login — called after OTP verify or after registration wizard submit.
   * @param {string} token   — a mock token string (e.g. mobile number or account ID)
   * @param {object} profile — user profile data to persist { fullName, mobile, email, accountType, accountId, ... }
   */
  const login = useCallback((token, profile = null) => {
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    if (profile) {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
    }
    setUser(profile);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_PROFILE_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  /**
   * updateProfile — update stored profile without re-logging in.
   * Merges the patch into the existing profile.
   */
  const updateProfile = useCallback((patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
