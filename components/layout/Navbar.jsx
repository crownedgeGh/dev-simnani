"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthGateModal from "@/components/auth/AuthGateModal";

const NAV_LINKS = [
  { label: "Properties", href: "/buy" },
  { label: "Invest", href: "/invest" },
  { label: "Services", href: "/" },
  { label: "Concierge", href: "/" },
  { label: "About Us", href: "/" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  function handlePostProperty(e) {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/post-property");
    } else {
      setOpen(false); // close mobile menu if open
      setShowAuthGate(true);
    }
  }

  return (
    <>
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
      />

      <header className="sticky top-0 z-50 border-b border-navy-700/60 bg-navy-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
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
              className="tracked-label rounded-md border border-gold-500/70 px-4 py-2 text-xs text-gold-400 transition hover:bg-gold-500/10"
            >
              Sign Up
            </Link>
            <button
              type="button"
              onClick={handlePostProperty}
              id="navbar-post-property-btn"
              className="tracked-label flex items-center gap-2 rounded-md bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
            >
              Post Property
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-950/15 text-navy-950">
                <PlusIcon />
              </span>
            </button>
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
          <nav
            className="border-t border-navy-700/60 lg:hidden"
            style={{
              background: "linear-gradient(180deg, #0a0e1a 0%, #05070c 100%)",
              animation: "mobileMenuSlide 0.22s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <style>{`
              @keyframes mobileMenuSlide {
                from { opacity: 0; transform: translateY(-8px); }
                to   { opacity: 1; transform: translateY(0); }
              }
              .mob-nav-link { position: relative; }
              .mob-nav-link::after {
                content: '';
                position: absolute;
                bottom: 0; left: 0;
                width: 0; height: 1px;
                background: #ffc633;
                transition: width 0.2s ease;
              }
              .mob-nav-link:hover::after { width: 100%; }
              .mob-nav-link:hover svg { color: #ffc633; }
            `}</style>

            {/* ── Post Property CTA ── */}
            <div className="px-4 pt-4 pb-4">
              <button
                type="button"
                onClick={handlePostProperty}
                id="mobile-post-property-btn"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "14px 20px",
                  background: "linear-gradient(135deg, #ffc633, #ffde85 60%, #ffc633)",
                  backgroundSize: "200% 100%",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#05070c",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(255,198,51,0.25)",
                  transition: "box-shadow 0.2s, background-position 0.3s",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "rgba(5,7,12,0.18)",
                  }}
                >
                  <PlusIcon />
                </span>
                Post Your Property
              </button>
            </div>

            {/* ── Divider with label ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 20px 16px",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#9aa3b8",
                }}
              >
                Navigation
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* ── Nav Links ── */}
            <div className="px-4" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV_LINKS.map((link, i) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="mob-nav-link"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 4px",
                    borderBottom: i < NAV_LINKS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                    color: "#d5cfc4",
                    textDecoration: "none",
                    transition: "color 0.18s",
                  }}
                >
                  <span>{link.label}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    style={{ width: 14, height: 14, color: "#9aa3b8", transition: "color 0.18s" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>

            {/* ── Auth Footer ── */}
            <div
              style={{
                margin: "16px 16px 0",
                padding: "16px",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#9aa3b8",
                  marginBottom: 12,
                }}
              >
                Already a member?
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    padding: "11px 16px",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#f5f1e8",
                    textDecoration: "none",
                    transition: "border-color 0.18s, color 0.18s",
                  }}
                >
                  <UserIcon />
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "11px 16px",
                    background: "rgba(255,198,51,0.08)",
                    border: "1px solid rgba(255,198,51,0.3)",
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#ffc633",
                    textDecoration: "none",
                    transition: "background 0.18s",
                  }}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>
    </>
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
