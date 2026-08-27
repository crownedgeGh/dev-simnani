"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthGateModal from "@/components/auth/AuthGateModal";
import { MdApartment } from "react-icons/md";
import {
  FiUser, FiPlus, FiMenu, FiX, FiChevronRight,
  FiList, FiBookmark, FiSettings, FiLogOut, FiHelpCircle,
} from "react-icons/fi";
import { BiBuildings } from "react-icons/bi";

const NAV_LINKS = [
  { label: "Properties", href: "/buy" },
  { label: "Invest", href: "/invest" },
  { label: "Services", href: "/" },
  { label: "Concierge", href: "/" },
  { label: "About Us", href: "/" },
];

const ACCOUNT_TYPE_LABEL = {
  buyer: "Buyer",
  investor: "Investor",
  broker: "Broker",
  freelancer: "Freelancer",
};

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** User dropdown panel (desktop) */
function UserDropdown({ user, onClose, onLogout }) {
  const typeLabel = ACCOUNT_TYPE_LABEL[user?.accountType] ?? user?.accountType ?? "Member";

  const MENU_ITEMS = [
    { icon: FiList, label: "My Listings", desc: "View & manage your properties", href: "/portal" },
    { icon: FiUser, label: "My Profile", desc: "Edit your account details", href: "/account" },
    { icon: FiBookmark, label: "Saved Properties", desc: "View your bookmarked properties", href: "/account" },
    { icon: BiBuildings, label: "Post a Property", desc: "List a new property", href: "/post-property", accent: true },
    { icon: FiHelpCircle, label: "Help & Support", desc: "Get help from our team", href: "/help" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 12px)",
        right: 0,
        width: 300,
        background: "linear-gradient(160deg, #0d1220 0%, #0a0e1a 60%, #06080f 100%)",
        border: "1px solid rgba(255,198,51,0.18)",
        borderRadius: 18,
        boxShadow: "0 8px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,198,51,0.06)",
        overflow: "hidden",
        zIndex: 9999,
        animation: "dropdownFadeIn 0.18s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .dd-item:hover { background: rgba(255,198,51,0.06) !important; }
        .dd-item:hover .dd-icon { color: #ffc633 !important; }
        .dd-logout:hover { background: rgba(220,38,38,0.08) !important; color: #f87171 !important; }
      `}</style>

      {/* Gold top bar */}
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent 5%, #ffc633 45%, #ffde85 55%, transparent 95%)" }} />

      {/* Header — avatar + name + type */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Avatar */}
          <div style={{
            flexShrink: 0,
            width: 48, height: 48, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(255,198,51,0.25), rgba(255,198,51,0.08))",
            border: "1.5px solid rgba(255,198,51,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, color: "#ffc633",
            letterSpacing: "0.02em",
          }}>
            {getInitials(user?.fullName)}
          </div>

          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#f5f1e8", marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.fullName || "My Account"}
            </p>
            {/* Account type tag */}
            <span style={{
              display: "inline-flex", alignItems: "center",
              padding: "2px 9px",
              background: "rgba(255,198,51,0.12)",
              border: "1px solid rgba(255,198,51,0.3)",
              borderRadius: 20,
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.13em", textTransform: "uppercase",
              color: "#ffc633",
            }}>
              {typeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: "12px 20px 6px" }}>
        <p style={{ fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6b7280" }}>My Account</p>
      </div>

      {/* Menu items */}
      <div style={{ padding: "0 10px" }}>
        {MENU_ITEMS.map(({ icon: Icon, label, desc, href, accent }) => (
          <Link
            key={label}
            href={href}
            onClick={onClose}
            className="dd-item"
            style={{
              display: "flex", alignItems: "center", gap: 13,
              padding: "11px 10px",
              borderRadius: 11,
              textDecoration: "none",
              transition: "background 0.15s",
              marginBottom: 2,
              background: "transparent",
            }}
          >
            <span
              className="dd-icon"
              style={{
                flexShrink: 0,
                width: 34, height: 34,
                borderRadius: 9,
                background: accent ? "rgba(255,198,51,0.1)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${accent ? "rgba(255,198,51,0.25)" : "rgba(255,255,255,0.07)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: accent ? "#ffc633" : "#9aa3b8",
                transition: "color 0.15s",
              }}
            >
              <Icon style={{ width: 15, height: 15 }} />
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: accent ? "#ffc633" : "#e8e3d9", marginBottom: 1 }}>{label}</p>
              <p style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div style={{ margin: "6px 20px", height: 1, background: "rgba(255,255,255,0.05)" }} />

      {/* Sign out */}
      <div style={{ padding: "6px 10px 12px" }}>
        <button
          type="button"
          onClick={onLogout}
          className="dd-logout"
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 13,
            padding: "11px 10px",
            borderRadius: 11,
            background: "transparent",
            border: "none", cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
            color: "#9aa3b8",
          }}
        >
          <span style={{
            flexShrink: 0, width: 34, height: 34, borderRadius: 9,
            background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#f87171",
          }}>
            <FiLogOut style={{ width: 15, height: 15 }} />
          </span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  function handleLogout() {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    router.push("/");
  }

  function handlePostProperty(e) {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/post-property");
    } else {
      setMobileOpen(false);
      setShowAuthGate(true);
    }
  }

  const typeLabel = ACCOUNT_TYPE_LABEL[user?.accountType] ?? user?.accountType ?? "Member";
  const initials = getInitials(user?.fullName);

  return (
    <>
      <AuthGateModal isOpen={showAuthGate} onClose={() => setShowAuthGate(false)} />

      <header className="sticky top-0 z-50 border-b border-navy-700/60 bg-navy-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center text-gold-400 sm:h-10 sm:w-10">
              <MdApartment className="h-full w-full" />
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

          {/* Desktop nav links */}
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

          {/* Desktop right section */}
          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              /* ── Authenticated: avatar chip + dropdown ── */
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "6px 12px 6px 6px",
                    background: dropdownOpen ? "rgba(255,198,51,0.1)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${dropdownOpen ? "rgba(255,198,51,0.35)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 999,
                    cursor: "pointer",
                    transition: "background 0.18s, border-color 0.18s",
                  }}
                >
                  {/* Avatar circle */}
                  <span style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(255,198,51,0.3), rgba(255,198,51,0.1))",
                    border: "1.5px solid rgba(255,198,51,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "#ffc633",
                    letterSpacing: "0.02em", flexShrink: 0,
                  }}>
                    {initials}
                  </span>

                  {/* Name */}
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#f5f1e8", whiteSpace: "nowrap" }}>
                    {user?.fullName?.split(" ")[0] || "Account"}
                  </span>

                  {/* Type tag */}
                  <span style={{
                    padding: "2px 7px",
                    background: "rgba(255,198,51,0.12)",
                    border: "1px solid rgba(255,198,51,0.28)",
                    borderRadius: 20,
                    fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: "#ffc633",
                  }}>
                    {typeLabel}
                  </span>
                </button>

                {dropdownOpen && (
                  <UserDropdown
                    user={user}
                    onClose={() => setDropdownOpen(false)}
                    onLogout={handleLogout}
                  />
                )}
              </div>
            ) : (
              /* ── Guest: Login + Sign Up ── */
              <>
                <Link
                  href="/auth"
                  className="tracked-label flex items-center gap-1.5 text-xs text-cream/80 transition hover:text-gold-400"
                >
                  <FiUser className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="tracked-label rounded-md border border-gold-500/70 px-4 py-2 text-xs text-gold-400 transition hover:bg-gold-500/10"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Post Property button */}
            <button
              type="button"
              onClick={handlePostProperty}
              id="navbar-post-property-btn"
              className="tracked-label flex items-center gap-2 rounded-md bg-gold-400 px-4 py-2 text-xs text-navy-950 transition hover:bg-gold-300"
            >
              Post Property
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-950/15 text-navy-950">
                <FiPlus className="h-3 w-3" />
              </span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center text-cream lg:hidden"
          >
            {mobileOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>

        {/* ── Mobile drawer ── */}
        {mobileOpen && (
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

            {/* Post Property CTA */}
            <div className="px-4 pt-4 pb-4">
              <button
                type="button"
                onClick={handlePostProperty}
                id="mobile-post-property-btn"
                style={{
                  width: "100%",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "14px 20px",
                  background: "linear-gradient(135deg, #ffc633, #ffde85 60%, #ffc633)",
                  backgroundSize: "200% 100%",
                  borderRadius: 12,
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "#05070c",
                  border: "none", cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(255,198,51,0.25)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "rgba(5,7,12,0.18)" }}>
                  <FiPlus style={{ width: 14, height: 14 }} />
                </span>
                Post Your Property
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px 16px" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9aa3b8" }}>Navigation</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* Nav links */}
            <div className="px-4" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV_LINKS.map((link, i) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="mob-nav-link"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 4px",
                    borderBottom: i < NAV_LINKS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    fontSize: 13, fontWeight: 500,
                    letterSpacing: "0.13em", textTransform: "uppercase",
                    color: "#d5cfc4", textDecoration: "none",
                    transition: "color 0.18s",
                  }}
                >
                  <span>{link.label}</span>
                  <FiChevronRight style={{ width: 14, height: 14, color: "#9aa3b8" }} />
                </Link>
              ))}
            </div>

            {/* Auth footer */}
            {isAuthenticated ? (
              /* ── Mobile: logged in user card ── */
              <div style={{ margin: "16px 16px 20px", padding: "16px", background: "rgba(255,198,51,0.05)", border: "1px solid rgba(255,198,51,0.2)", borderRadius: 14 }}>
                {/* User row */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <span style={{
                    flexShrink: 0, width: 44, height: 44, borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(255,198,51,0.25), rgba(255,198,51,0.08))",
                    border: "1.5px solid rgba(255,198,51,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700, color: "#ffc633",
                  }}>
                    {initials}
                  </span>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#f5f1e8", marginBottom: 5 }}>
                      {user?.fullName || "My Account"}
                    </p>
                    <span style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "2px 9px",
                      background: "rgba(255,198,51,0.12)", border: "1px solid rgba(255,198,51,0.3)",
                      borderRadius: 20,
                      fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.13em", textTransform: "uppercase",
                      color: "#ffc633",
                    }}>
                      {typeLabel}
                    </span>
                  </div>
                </div>

                {/* Quick links */}
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <Link href="/account" onClick={() => setMobileOpen(false)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", background: "rgba(255,198,51,0.08)", border: "1px solid rgba(255,198,51,0.25)", borderRadius: 9, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ffc633", textDecoration: "none" }}>
                    <FiUser style={{ width: 13, height: 13 }} /> Account
                  </Link>
                  <Link href="/portal" onClick={() => setMobileOpen(false)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d5cfc4", textDecoration: "none" }}>
                    <FiList style={{ width: 13, height: 13 }} /> Portal
                  </Link>
                </div>

                {/* Sign out */}
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: 9, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f87171", cursor: "pointer" }}
                >
                  <FiLogOut style={{ width: 14, height: 14 }} /> Sign Out
                </button>
              </div>
            ) : (
              /* ── Mobile: guest auth footer ── */
              <div style={{ margin: "16px 16px 0", padding: "16px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, marginBottom: 20 }}>
                <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9aa3b8", marginBottom: 12 }}>
                  Already a member?
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <Link href="/auth" onClick={() => setMobileOpen(false)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f5f1e8", textDecoration: "none" }}>
                    <FiUser style={{ width: 14, height: 14 }} /> Log In
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "11px 16px", background: "rgba(255,198,51,0.08)", border: "1px solid rgba(255,198,51,0.3)", borderRadius: 10, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffc633", textDecoration: "none" }}>
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </nav>
        )}
      </header>
    </>
  );
}
