"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdDashboard,
  MdApartment,
  MdPeople,
  MdBusiness,
  MdLeaderboard,
  MdSupervisedUserCircle,
  MdPhone,
  MdSettings,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { useState } from "react";

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

export default function AdminSidebar({ collapsed, onToggleCollapse }) {
  const pathname = usePathname();

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-[#e8e0d5] transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
      style={{ boxShadow: "2px 0 8px rgba(0,0,0,0.04)" }}
    >
      {/* Logo area */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[#e8e0d5] min-h-[64px]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f0b429] text-white font-bold text-sm">
          S
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold text-[#1a1a2e] leading-tight">Simnani</p>
            <p className="text-[10px] text-[#9ca3af] tracking-widest uppercase">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 group ${
                isActive
                  ? "bg-[#fff8e1] text-[#d97706] font-semibold"
                  : "text-[#6b7280] hover:bg-[#faf8f5] hover:text-[#1a1a2e]"
              }`}
            >
              <Icon
                className={`shrink-0 transition-colors ${
                  isActive ? "text-[#f0b429]" : "text-[#9ca3af] group-hover:text-[#6b7280]"
                }`}
                size={20}
              />
              {!collapsed && (
                <span className="text-sm truncate">{label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f0b429]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-[#e8e0d5] p-2">
        <button
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center gap-2 rounded-xl p-2.5 text-[#9ca3af] transition hover:bg-[#faf8f5] hover:text-[#6b7280]"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
