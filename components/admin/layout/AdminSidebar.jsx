"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdDashboard,
  MdApartment,
  MdPeople,
  MdLeaderboard,
  MdSupervisedUserCircle,
  MdPhone,
  MdSettings,
  MdChevronLeft,
  MdChevronRight,
  MdWorkspacePremium,
  MdInsights,
  MdAdminPanelSettings,
  MdCategory,
  MdThumbUp,
  MdRestoreFromTrash,
} from "react-icons/md";
import { BiBuildingHouse } from "react-icons/bi";
import { useState } from "react";
import { useCorrectionReviewCount } from "@/lib/useCorrectionReviewCount";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: MdDashboard },
  {
    href: "/admin/properties",
    label: "Properties",
    icon: MdApartment,
    children: [
      { href: "/admin/properties", label: "All Properties" },
      { href: "/admin/properties/closed", label: "Closed Listings" },
    ],
  },
  { href: "/admin/users", label: "Users", icon: MdPeople },
  {
    href: "/admin/sg-properties",
    label: "SG Internals",
    icon: MdAdminPanelSettings,
    children: [
      { href: "/admin/sg-properties", label: "SG Properties" },
      { href: "/admin/sg-users", label: "SG Users" },
    ],
  },
  { href: "/admin/leads", label: "Non User Leads", icon: MdLeaderboard },
  { href: "/admin/interested", label: "Interested", icon: MdThumbUp },
  { href: "/admin/analytics", label: "Analytics", icon: MdInsights },
  { href: "/admin/plans", label: "Plans", icon: MdWorkspacePremium },
  {
    href: "/admin/brokers",
    label: "Brokers",
    icon: BiBuildingHouse,
    children: [
      { href: "/admin/brokers/featured", label: "Featured Brokers" },
    ],
  },
  {
    href: "/admin/freelancer-cp",
    label: "Freelancer & CP",
    icon: MdSupervisedUserCircle,
    children: [
      { href: "/admin/freelancer-cp", label: "Overview" },
      { href: "/admin/freelancer-cp/company", label: "Company CP" },
      { href: "/admin/freelancer-cp/head-cp", label: "Head CP" },
      { href: "/admin/freelancer-cp/digital", label: "Digital CP" },
      { href: "/admin/freelancer-cp/field", label: "Field CP" },
    ],
  },
    { href: "/admin/deleted-accounts", label: "Deleted Accounts", icon: MdRestoreFromTrash },

  // { href: "/admin/callbacks", label: "Callbacks", icon: MdPhone },
  // { href: "/admin/skills", label: "Skills", icon: MdCategory },
  // { href: "/admin/settings", label: "Settings", icon: MdSettings },
];

export default function AdminSidebar({ collapsed, onToggleCollapse }) {
  const pathname = usePathname();
  const { count: reviewCount } = useCorrectionReviewCount();

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-[#e8e0d5] transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
      style={{ boxShadow: "1px 0 0 rgba(0,0,0,0.02), 4px 0 16px rgba(26,26,46,0.03)" }}
    >
      {/* Logo area */}
      <div className={`flex items-center gap-2.5 px-4 py-4 border-b border-[#e8e0d5] min-h-[64px] ${collapsed ? "justify-center px-2" : ""}`}>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white font-bold text-base"
          style={{
            background: "linear-gradient(135deg, #f0b429 0%, #d97706 100%)",
            boxShadow: "0 3px 8px rgba(240,180,41,0.35)",
          }}
        >
          S
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#1a1a2e] leading-tight truncate">Simnani Estate</p>
            <p className="text-[10px] font-medium text-[#9ca3af] tracking-widest uppercase">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 [scrollbar-width:thin]">
        {NAV_ITEMS.map(({ href, label, icon: Icon, children }) => {
          const isActive =
            pathname === href ||
            pathname.startsWith(href + "/") ||
            (children ? children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/")) : false);
          return (
            <div key={href}>
              <Link
                href={href}
                title={collapsed ? label : undefined}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 group ${
                  isActive
                    ? "bg-[#fff8e1] text-[#d97706] font-semibold"
                    : "text-[#6b7280] hover:bg-[#faf8f5] hover:text-[#1a1a2e]"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#f0b429]" />
                )}
                <Icon
                  className={`shrink-0 transition-colors ${
                    isActive ? "text-[#f0b429]" : "text-[#9ca3af] group-hover:text-[#6b7280]"
                  }`}
                  size={19}
                />
                {!collapsed && (
                  <span className="text-sm truncate">{label}</span>
                )}
                {href === "/admin/properties" && reviewCount > 0 && (
                  <span
                    className={`flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#f0b429] px-1 text-[10px] font-semibold text-white ${
                      collapsed ? "absolute right-1 top-1" : "ml-auto"
                    }`}
                    title={`${reviewCount} listing${reviewCount === 1 ? "" : "s"} awaiting review`}
                  >
                    {reviewCount}
                  </span>
                )}
              </Link>
              {children && isActive && !collapsed && (
                <div className="mb-1 ml-5 flex flex-col gap-0.5 border-l border-[#e8e0d5] pl-3">
                  {children.map((child) => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`rounded-lg px-3 py-1.5 text-xs transition ${
                          isChildActive
                            ? "font-semibold text-[#d97706]"
                            : "text-[#9ca3af] hover:text-[#1a1a2e]"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
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
          {!collapsed && <span className="text-xs font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
