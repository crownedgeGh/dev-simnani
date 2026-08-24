"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Properties", href: "/buy" },
  { label: "Invest", href: "/invest" },
  { label: "Services", href: "/" },
  { label: "Concierge", href: "/" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-700/60 bg-navy-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="tracked-label font-display text-lg font-semibold text-gold-400 sm:text-xl"
        >
          Simnani Estate
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="tracked-label text-xs text-cream/80 transition hover:text-gold-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="#"
            className="tracked-label text-xs text-gold-400 transition hover:text-gold-300"
          >
            Login
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center text-cream md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="h-6 w-6"
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-navy-700/60 bg-navy-950 px-4 pb-6 pt-2 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="tracked-label text-sm text-cream/80 transition hover:text-gold-400"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#"
              onClick={() => setOpen(false)}
              className="tracked-label text-sm text-gold-400"
            >
              Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
