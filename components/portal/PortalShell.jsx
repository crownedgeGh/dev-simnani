"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PortalShell({ roleLabel, tier, navItems, ctaLabel, ctaHref, children }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-navy-700/60 bg-navy-900 p-5">
            <p className="tracked-label text-xs text-gold-400">{roleLabel}</p>
            <p className="mt-1 text-xs text-muted">{tier}</p>

            <nav className="mt-6 flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`tracked-label px-3 py-2 text-xs transition ${
                    pathname === item.href
                      ? "bg-gold-400 text-navy-950"
                      : "text-muted hover:text-cream"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {ctaLabel && (
              <Link
                href={ctaHref}
                className="tracked-label mt-6 block w-full bg-gold-400 px-4 py-3 text-center text-xs text-navy-950 transition hover:bg-gold-300"
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
