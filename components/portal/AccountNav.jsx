"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Profile", href: "/account" },
  { label: "Saved Properties", href: "/account/saved-properties" },
  { label: "Site Visits", href: "/account/site-visits" },
  { label: "Notifications", href: "/account/notifications" },
  { label: "Support", href: "/account/support" },
  { label: "Privacy & Security", href: "/account/privacy" },
];

export default function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-navy-700/60 pb-6">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`tracked-label px-4 py-2 text-xs transition ${
            pathname === link.href
              ? "bg-gold-400 text-navy-950"
              : "border border-navy-700/60 text-muted hover:text-cream"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
