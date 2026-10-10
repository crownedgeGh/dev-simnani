"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { AdminLoadingState, AdminSessionExpiredState } from "@/components/admin/ui/AdminStateScreen";

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
      <div className="admin-shell admin-theme-celestial flex min-h-screen items-center justify-center bg-[#faf8f5] p-6">
        <AdminLoadingState compact />
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="admin-shell admin-theme-celestial flex min-h-screen items-center justify-center bg-[#faf8f5] p-6">
        <AdminSessionExpiredState compact />
      </div>
    );
  }

  return <>{children}</>;
}
