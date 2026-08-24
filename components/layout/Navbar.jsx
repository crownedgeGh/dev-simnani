"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Properties", href: "/buy" },
  { label: "Invest", href: "/invest" },
  { label: "Services", href: "/" },
  { label: "Concierge", href: "/" },
  { label: "About Us", href: "/" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-700/60 bg-navy-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center text-gold-400 sm:h-10 sm:w-10">
            <BuildingIcon />
          </span>
          <span className="leading-tight">
            <span className="tracked-label block font-display text-base font-semibold text-gold-400 sm:text-lg">
              Simnani Estate
            </span>
            <span className="tracked-label hidden text-[9px] text-muted sm:block">
              Your Trusted Real Estate Partner
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
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

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/auth"
            className="tracked-label flex items-center gap-1.5 text-xs text-cream/80 transition hover:text-gold-400"
          >
            <UserIcon />
            Login
          </Link>
          <Link
            href="/auth/register"
            className="tracked-label border border-gold-500/70 px-4 py-2 text-xs text-gold-400 transition hover:bg-gold-500/10"
          >
            Sign Up
          </Link>
          <Link
            href="/post-property"
            className="tracked-label flex items-center gap-2 bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
          >
            Post Property
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-950/15 text-navy-950">
              <PlusIcon />
            </span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center text-cream lg:hidden"
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
        <nav className="border-t border-navy-700/60 bg-navy-950 px-4 pb-6 pt-2 lg:hidden">
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
              href="/auth"
              onClick={() => setOpen(false)}
              className="tracked-label flex items-center gap-1.5 text-sm text-cream/80 transition hover:text-gold-400"
            >
              <UserIcon />
              Login
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setOpen(false)}
              className="tracked-label inline-block w-fit border border-gold-500/70 px-4 py-2 text-sm text-gold-400 transition hover:bg-gold-500/10"
            >
              Sign Up
            </Link>
            <Link
              href="/post-property"
              onClick={() => setOpen(false)}
              className="tracked-label inline-flex w-fit items-center gap-2 bg-gold-400 px-4 py-2 text-sm text-navy-950 transition hover:bg-gold-300"
            >
              Post Property
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-950/15 text-navy-950">
                <PlusIcon />
              </span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function BuildingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-full w-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V9.75L8 6v15M8 21V5.25L12.5 2v19M12.5 21V11l4-2.25V21M16.5 21V13l4-1.5V21" />
      <path strokeLinecap="round" d="M2.5 21h19" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
      <circle cx="12" cy="8" r="3.25" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}
