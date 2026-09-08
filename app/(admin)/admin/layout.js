"use client";

import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import AdminGuard from "@/components/admin/AdminGuard";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminTopbar from "@/components/admin/layout/AdminTopbar";
import AdminMobileDrawer from "@/components/admin/layout/AdminMobileDrawer";
import { seedAdminData } from "@/lib/adminStorage";
import { usePathname } from "next/navigation";
import { AdminThemeProvider, useAdminTheme } from "@/context/AdminThemeContext";

function AdminShell({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { isDark } = useAdminTheme();

  // Derive page title from pathname
  const PAGE_TITLES = {
    "/admin/dashboard": "Dashboard",
    "/admin/properties/add": "Add Property",
    "/admin/properties/add-property": "Add Property",
    "/admin/properties": "Properties",
    "/admin/users": "Users",
    "/admin/projects": "Projects",
    "/admin/leads": "Leads",
    "/admin/freelancer-cp": "Freelancer & CP Management",
    "/admin/callbacks": "Callback Requests",
    "/admin/settings": "Settings",
  };
  const pageTitle =
    pathname.includes("/edit")
      ? "Edit Property"
      : PAGE_TITLES[pathname] ||
        Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ||
        "Admin Panel";

  return (
    <div className={`admin-shell admin-theme-celestial flex h-screen overflow-hidden ${isDark ? "admin-dark dark" : "light"}`}>
      {/* Desktop Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Mobile Drawer */}
      <AdminMobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main content column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar
          onMenuClick={() => setDrawerOpen(true)}
          pageTitle={pageTitle}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // Seed data on first load (client-side only)
  useEffect(() => {
    seedAdminData();
  }, []);

  return (
    <AdminAuthProvider>
      <AdminThemeProvider>
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: "var(--font-inter, Inter, sans-serif)",
              borderRadius: "12px",
              fontSize: "13px",
            },
          }}
        />
        {isLoginPage ? (
          children
        ) : (
          <AdminGuard>
            <AdminShell>{children}</AdminShell>
          </AdminGuard>
        )}
      </AdminThemeProvider>
    </AdminAuthProvider>
  );
}
