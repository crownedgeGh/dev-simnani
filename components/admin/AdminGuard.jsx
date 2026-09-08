"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminGuard({ children }) {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdminAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isAdminAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="admin-shell admin-theme-celestial flex min-h-screen items-center justify-center bg-[#faf8f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#f0b429] border-t-transparent" />
          <p className="text-sm text-[#6b7280]">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) return null;

  return <>{children}</>;
}
