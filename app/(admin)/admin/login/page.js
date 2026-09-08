"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdLock, MdEmail, MdVisibility, MdVisibilityOff, MdLightMode, MdDarkMode } from "react-icons/md";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAdminTheme } from "@/context/AdminThemeContext";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const { adminLogin, isAdminAuthenticated, isLoading } = useAdminAuth();
  const { isDark, toggleTheme } = useAdminTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAdminAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isAdminAuthenticated, isLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }
    setSubmitting(true);
    // Small delay for UX feel
    await new Promise((r) => setTimeout(r, 400));
    const result = adminLogin(email, password);
    setSubmitting(false);
    if (result.success) {
      toast.success("Welcome back, Admin!");
      router.replace("/admin/dashboard");
    } else {
      toast.error("Invalid credentials. Hint: admin@simnani.com / admin123");
    }
  };

  if (isLoading) {
    return (
      <div className="admin-shell admin-theme-celestial flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#f0b429] border-t-transparent" />
          <p className="text-sm text-[#6b7280]">Loading…</p>
        </div>
      </div>
    );
  }

  if (isAdminAuthenticated) return null;

  return (
    <div className={`admin-shell admin-theme-celestial relative flex min-h-screen items-center justify-center ${isDark ? "admin-dark dark" : "light"} px-4`}>
      {/* Dark / Light mode toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          id="admin-login-theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8e0d5] bg-white text-[#6b7280] shadow-sm transition hover:border-[#f0b429] hover:text-[#f0b429]"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <MdLightMode size={20} className="text-[#f0b429]" /> : <MdDarkMode size={20} />}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-[#e8e0d5] bg-white p-8 shadow-sm">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0b429] shadow-md">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-[#1a1a2e]">Simnani Admin</h1>
              <p className="text-sm text-[#9ca3af]">Sign in to your admin account</p>
            </div>
          </div>

          {/* Hint box */}
          <div className="mb-6 rounded-xl border border-[#f0b429]/30 bg-[#fff8e1] px-4 py-3">
            <p className="text-xs font-medium text-[#d97706]">Demo credentials</p>
            <p className="text-xs text-[#92400e] mt-0.5">admin@simnani.com / admin123</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold text-[#374151] uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <MdEmail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@simnani.com"
                  autoComplete="email"
                  className="h-11 w-full rounded-xl border border-[#e8e0d5] bg-[#faf8f5] pl-9 pr-4 text-sm text-[#1a1a2e] placeholder-[#9ca3af] outline-none transition focus:border-[#f0b429] focus:ring-2 focus:ring-[#f0b429]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold text-[#374151] uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <MdLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  id="admin-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="h-11 w-full rounded-xl border border-[#e8e0d5] bg-[#faf8f5] pl-9 pr-11 text-sm text-[#1a1a2e] placeholder-[#9ca3af] outline-none transition focus:border-[#f0b429] focus:ring-2 focus:ring-[#f0b429]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
                  tabIndex={-1}
                >
                  {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="admin-login-submit"
              type="submit"
              disabled={submitting}
              className="mt-2 h-11 w-full rounded-xl bg-[#f0b429] text-sm font-semibold text-white transition hover:bg-[#d97706] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ boxShadow: "0 4px 12px rgba(240,180,41,0.3)" }}
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-[#9ca3af]">
          Simnani Estate Admin Panel · For authorized personnel only
        </p>
      </div>
    </div>
  );
}
