"use client";

import { MdMenu, MdLogout, MdPerson, MdLightMode, MdDarkMode } from "react-icons/md";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAdminTheme } from "@/context/AdminThemeContext";
import { useRouter } from "next/navigation";

export default function AdminTopbar({ onMenuClick, pageTitle }) {
  const { adminUser, adminLogout } = useAdminAuth();
  const { isDark, toggleTheme } = useAdminTheme();
  const router = useRouter();

  const handleLogout = () => {
    adminLogout();
    router.replace("/admin/login");
  };

  const initials = (adminUser?.name || "Admin")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <header
      className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[#e8e0d5] bg-white px-4 sm:px-6"
      style={{ boxShadow: "0 1px 0 rgba(26,26,46,0.02), 0 2px 10px rgba(26,26,46,0.03)" }}
    >
      {/* Mobile hamburger */}
      <button
        id="admin-mobile-menu-btn"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#faf8f5] lg:hidden"
        aria-label="Open navigation"
      >
        <MdMenu size={22} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-[#1a1a2e] truncate">{pageTitle || "Admin Panel"}</h1>
      </div>

      {/* Admin actions: theme toggle + user info + logout */}
      <div className="flex items-center gap-2">
        {/* Dark / Light mode toggle */}
        <button
          id="admin-theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e0d5] text-[#6b7280] transition hover:border-[#f0b429] hover:text-[#f0b429] hover:bg-[#faf8f5]"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <MdLightMode size={18} className="text-[#f0b429]" />
          ) : (
            <MdDarkMode size={18} />
          )}
        </button>

        <div className="hidden sm:flex items-center gap-2.5 rounded-xl border border-[#e8e0d5] px-2.5 py-1.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #f0b429 0%, #d97706 100%)",
            }}
          >
            {initials || <MdPerson size={14} />}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-[#1a1a2e] leading-tight">{adminUser?.name || "Admin"}</p>
            <p className="text-[10px] text-[#9ca3af]">{adminUser?.email || ""}</p>
          </div>
        </div>

        <button
          id="admin-logout-btn"
          onClick={handleLogout}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-[#e8e0d5] px-3 text-xs text-[#6b7280] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          title="Logout"
        >
          <MdLogout size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
