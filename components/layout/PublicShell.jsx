"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicShell({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    // iOS Safari only fires the :active pseudo-class on elements once a
    // touch listener exists somewhere in the document — without this, tap
    // states (active:* utility classes) never appear on mobile.
    document.addEventListener("touchstart", () => {}, true);
  }, []);

  if (isAdminRoute) {
    // Admin has its own shell — render children directly, no Navbar/Footer
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
