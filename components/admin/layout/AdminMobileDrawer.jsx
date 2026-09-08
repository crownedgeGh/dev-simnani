"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdClose, MdDashboard, MdApartment, MdPeople, MdBusiness, MdLeaderboard, MdSupervisedUserCircle, MdPhone, MdSettings, MdLightMode, MdDarkMode } from "react-icons/md";
import { useAdminTheme } from "@/context/AdminThemeContext";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: MdDashboard },
  { href: "/admin/properties", label: "Properties", icon: MdApartment },
  { href: "/admin/users", label: "Users", icon: MdPeople },
  { href: "/admin/projects", label: "Projects", icon: MdBusiness },
  { href: "/admin/leads", label: "Leads", icon: MdLeaderboard },
  { href: "/admin/freelancer-cp", label: "Freelancer & CP", icon: MdSupervisedUserCircle },
  { href: "/admin/callbacks", label: "Callbacks", icon: MdPhone },
  { href: "/admin/settings", label: "Settings", icon: MdSettings },
];

export default function AdminMobileDrawer({ isOpen, onClose }) {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useAdminTheme();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ boxShadow: "4px 0 20px rgba(0,0,0,0.12)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8e0d5] px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0b429] text-white font-bold text-sm">
              S
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a1a2e]">Simnani</p>
              <p className="text-[10px] text-[#9ca3af] tracking-widest uppercase">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#faf8f5]"
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <MdLightMode size={18} className="text-[#f0b429]" /> : <MdDarkMode size={18} />}
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9ca3af] hover:bg-[#faf8f5]"
              aria-label="Close menu"
            >
              <MdClose size={20} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 transition-all ${
                  isActive
                    ? "bg-[#fff8e1] text-[#d97706] font-semibold"
                    : "text-[#6b7280] hover:bg-[#faf8f5] hover:text-[#1a1a2e]"
                }`}
              >
                <Icon size={20} className={isActive ? "text-[#f0b429]" : "text-[#9ca3af]"} />
                <span className="text-sm">{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
