"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAccountPermissions } from "@/lib/accountPermissions";
import AuthGateModal from "@/components/auth/AuthGateModal";
import { MdApartment, MdTrendingUp, MdSupportAgent, MdPersonAdd } from "react-icons/md";
import {
  FiUser, FiPlus, FiMenu, FiX,
  FiList, FiBookmark, FiSettings, FiLogOut, FiHelpCircle, FiInfo,
} from "react-icons/fi";
import { BiBuildings, BiBuildingHouse } from "react-icons/bi";

const NAV_LINKS = [
  { label: "Properties", href: "/properties", icon: BiBuildingHouse },
  { label: "Invest", href: "/invest", icon: MdTrendingUp },
  { label: "Services", href: "/", icon: FiSettings },
  { label: "Concierge", href: "/", icon: MdSupportAgent },
  { label: "About Us", href: "/", icon: FiInfo },
];

const ACCOUNT_TYPE_LABEL = {
  buyer: "Buyer",
  investor: "Investor",
  broker: "Broker",
  freelancer: "Freelancer",
  "common-person": "Common Person",
  employee: "Employee",
};

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** One icon-badge row used throughout the mobile sidebar (nav links, account links, sign out). */
function MobileNavRow({ icon: Icon, label, href, onClick, tone = "default" }) {
  const palette = {
    default: { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.08)", icon: "#9aa3b8", text: "#e8e3d9" },
    accent: { bg: "rgba(255,198,51,0.1)", border: "rgba(255,198,51,0.22)", icon: "#ffc633", text: "#e8e3d9" },
    danger: { bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.18)", icon: "#f87171", text: "#f87171" },
  }[tone];

  const rowStyle = {
    width: "100%",
    display: "flex", alignItems: "center", gap: 13,
    padding: "10px 4px",
    borderRadius: 11,
    textDecoration: "none",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  };

  const content = (
    <>
      <span style={{
        flexShrink: 0, width: 34, height: 34, borderRadius: 9,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: palette.icon,
      }}>
        <Icon style={{ width: 15, height: 15 }} />
      </span>
      <span className="tracked-label" style={{ fontSize: 12.5, fontWeight: 600, color: palette.text }}>
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} style={rowStyle}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} style={rowStyle}>
      {content}
    </button>
  );
}

/** User dropdown panel (desktop) */
function UserDropdown({ user, onClose, onLogout }) {
  const typeLabel = ACCOUNT_TYPE_LABEL[user?.accountType] ?? user?.accountType ?? "Member";
  const perms = getAccountPermissions(user?.accountType);

  const MENU_ITEMS = [
    perms.canManageListings && {
      icon: FiList,
      label: perms.portalLabel || "My Listings",
      desc: perms.portalDesc || "View & manage your properties",
      href: perms.portalHref,
    },
    { icon: FiUser, label: "My Profile", desc: "Edit your account details", href: "/account" },
    { icon: FiBookmark, label: "Saved Properties", desc: "View your bookmarked properties", href: "/account/saved-properties" },
    perms.canPostProperty && {
      icon: BiBuildings, label: "Post a Property", desc: "List a new property", href: "/post-property", accent: true,
    },
    { icon: FiHelpCircle, label: "Help & Support", desc: "Get help from our team", href: "/help" },
  ].filter(Boolean);

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

  // Mobile/tablet sidebar: lock body scroll + close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    function handleKey(e) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [mobileOpen]);

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
  const perms = getAccountPermissions(user?.accountType);
  const canPostProperty = !isAuthenticated || perms.canPostProperty;

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
            {/* Post Property button */}
            {canPostProperty && (
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
            )}

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
      </header>

      {/* ── Mobile/tablet sidebar (Radix-style overlay drawer) ──
          Rendered as a sibling of <header>, not nested inside it: header uses
          `backdrop-blur`, and a `backdrop-filter` on an ancestor creates a new
          containing block for `position: fixed` descendants (same as `transform`),
          which would confine this overlay to the header's own height instead of
          the full viewport. */}
      {mobileOpen && (
        <div className="lg:hidden" style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
          <style>{`
            @keyframes sidebarBackdropFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes sidebarSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          `}</style>

          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(2,3,6,0.72)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              animation: "sidebarBackdropFadeIn 0.2s ease",
            }}
          />

          {/* Sliding panel */}
          <nav
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            style={{
              position: "absolute",
              top: 0, right: 0, bottom: 0,
              width: "88%",
              maxWidth: 360,
              background: "linear-gradient(180deg, #0a0e1a 0%, #05070c 100%)",
              borderLeft: "1px solid rgba(255,198,51,0.15)",
              boxShadow: "0 0 60px rgba(0,0,0,0.65)",
              overflowY: "auto",
              animation: "sidebarSlideIn 0.26s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Panel header — avatar/name/badge (authenticated) or logo (guest) + close */}
            <div className="flex items-center justify-between border-b border-navy-700/60 px-4 py-3.5">
              {isAuthenticated ? (
                <div className="flex min-w-0 items-center gap-3">
                  <span style={{
                    flexShrink: 0, width: 42, height: 42, borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(255,198,51,0.3), rgba(255,198,51,0.1))",
                    border: "1.5px solid rgba(255,198,51,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15, fontWeight: 700, color: "#ffc633",
                  }}>
                    {initials}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#f5f1e8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user?.fullName || "My Account"}
                    </p>
                    <span className="tracked-label" style={{
                      display: "inline-flex", marginTop: 4,
                      padding: "2px 8px",
                      background: "rgba(255,198,51,0.12)", border: "1px solid rgba(255,198,51,0.3)",
                      borderRadius: 20,
                      fontSize: 9, fontWeight: 700,
                      color: "#ffc633",
                    }}>
                      {typeLabel}
                    </span>
                  </div>
                </div>
              ) : (
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center text-gold-400">
                    <MdApartment className="h-full w-full" />
                  </span>
                  <span className="tracked-label font-display text-base font-semibold text-gold-400">
                    Simnani Estate
                  </span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 shrink-0 items-center justify-center text-cream"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* Post Property CTA */}
            {canPostProperty && (
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
            )}

            {/* My Account — quick nav */}
            {isAuthenticated && (
              <div className="px-4 pb-4">
                <p className="tracked-label text-xs text-muted">My Account</p>
                <div className="mt-3 flex flex-col gap-1">
                  {[
                    { icon: FiBookmark, label: "Saved Properties", href: "/account/saved-properties" },
                    perms.canManageListings && {
                      icon: FiList,
                      label: perms.portalLabel || "My Listings",
                      href: perms.portalHref,
                    },
                    { icon: FiUser, label: "My Profile", href: "/account" },
                  ]
                    .filter(Boolean)
                    .map((item) => (
                      <MobileNavRow
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        href={item.href}
                        tone="accent"
                        onClick={() => setMobileOpen(false)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Navigation + sign out / auth */}
            <div className="border-t border-navy-700/60 px-4 py-4">
              <p className="tracked-label text-xs text-muted">Navigation</p>
              <div className="mt-3 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <MobileNavRow
                    key={link.label}
                    icon={link.icon}
                    label={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}

                {isAuthenticated ? (
                  <MobileNavRow icon={FiLogOut} label="Sign Out" tone="danger" onClick={handleLogout} />
                ) : (
                  <>
                    <MobileNavRow icon={FiUser} label="Login" href="/auth" onClick={() => setMobileOpen(false)} />
                    <MobileNavRow icon={MdPersonAdd} label="Sign Up" href="/auth/register" tone="accent" onClick={() => setMobileOpen(false)} />
                  </>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
