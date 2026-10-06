"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdHome, MdTrendingUp, MdDomain, MdWork, MdPerson, MdBadge, MdScience, MdApartment } from "react-icons/md";
import { FiMapPin, FiSmartphone, FiBriefcase } from "react-icons/fi";
import BackButton from "@/components/layout/BackButton";
import { useAuth } from "@/context/AuthContext";
import { TEST_MODE_CP_PROFILES } from "@/lib/testModeCp";

// Test Mode (registration bypass) is a dev/staging-only convenience — never
// reachable in production. Gate it behind an env flag set only outside prod.
const TEST_MODE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_TEST_MODE === "true";

const TEST_MODE_CP_OPTIONS = [
  { cpType: "field", label: "Field CP", description: "Field Channel Partner demo dashboard.", Icon: FiMapPin },
  { cpType: "digital", label: "Digital CP", description: "Digital Channel Partner demo dashboard.", Icon: FiSmartphone },
  { cpType: "company", label: "Company CP", description: "Company Channel Partner demo dashboard.", Icon: FiBriefcase },
];

const TEST_MODE_DIRECT_OPTIONS = [
  {
    key: "common-person",
    label: "Common Person",
    description: "Skip the form — go straight to the Common Person dashboard.",
    Icon: MdPerson,
    href: "/portal/common-person",
    profile: {
      fullName: "Test Common Person",
      mobile: "90000 00001",
      email: "test.commonperson@simnaniestate.com",
      accountType: "common-person",
      accountId: "SG-IND-TEST-COMMON",
      city: "Mumbai",
      registeredAt: new Date(0).toISOString(),
    },
  },
  {
    key: "broker",
    label: "Broker",
    description: "Skip the form — go straight to the Broker dashboard.",
    Icon: MdDomain,
    href: "/portal/broker",
    profile: {
      fullName: "Test Broker",
      mobile: "90000 00002",
      email: "test.broker@simnaniestate.com",
      accountType: "broker",
      accountId: "SG-BRK-TEST",
      city: "Mumbai",
      reraRegistered: false,
      registeredAt: new Date(0).toISOString(),
    },
  },
  {
    key: "buyer",
    label: "Buyer",
    description: "Skip the form — go straight to the home page.",
    Icon: MdHome,
    href: "/",
    profile: {
      fullName: "Test Buyer",
      mobile: "90000 00003",
      email: "test.buyer@simnaniestate.com",
      accountType: "buyer",
      accountId: "SG-BUY-TEST",
      city: "Mumbai",
      registeredAt: new Date(0).toISOString(),
    },
  },
];

const ACCOUNT_TYPES = [
  {
    value: "common-person",
    label: "Common User",
    description: "Post, Search and manage your own property directly.",
    Icon: MdPerson,
  },
  {
    value: "buyer",
    label: "Buyer",
    description: "Find and purchase properties.",
    Icon: MdHome,
  },
  {
    value: "investor",
    label: "Investor",
    description: "Discover real estate investment opportunities.",
    Icon: MdTrendingUp,
  },
  {
    value: "broker",
    label: "Broker",
    description: "Sell properties and manage clients.",
    Icon: MdDomain,
  },
  {
    value: "freelancer",
    label: "Freelancer",
    description: "Earn commissions by referring clients and closing deals on your own schedule.",
    Icon: MdWork,
  },
  {
    value: "employee",
    label: "Employee",
    description: "Manage assigned leads and close sales for your district.",
    Icon: MdBadge,
  },
  {
    value: "builder",
    label: "Builder",
    description: "Post, search and manage your own developments directly.",
    Icon: MdApartment,
  },
];

export default function AccountTypeSelect() {
  const router = useRouter();
  const { login } = useAuth();
  const [testModeOpen, setTestModeOpen] = useState(false);
  const [bypassLoading, setBypassLoading] = useState(null);
  const [bypassError, setBypassError] = useState("");

  async function handleDirectBypass(key, profile, href) {
    if (bypassLoading) return;
    setBypassLoading(key);
    setBypassError("");
    try {
      await login(null, profile);
      router.push(href);
    } catch (err) {
      setBypassLoading(null);
      setBypassError(err.message || "Bypass login failed. Please try again.");
    }
  }

  return (
    <div className="relative w-full max-w-4xl rounded-2xl border border-navy-700/60 bg-navy-900 p-5 shadow-2xl sm:rounded-3xl sm:p-10">
      <BackButton className="absolute left-4 top-4 h-10 w-10 sm:hidden" />
      <div className="flex flex-col items-center gap-2 pt-7 text-center sm:pt-0">
        <span className="tracked-label text-xs text-gold-400">Simnani Estate</span>
        <div className="flex items-center gap-3">
          <BackButton className="hidden sm:flex" />
          <h1 className="font-display text-2xl text-cream sm:text-4xl">
            How would you like to use Simnani Estate?
          </h1>
        </div>
        <p className="text-sm text-muted">
          Select your primary account type to tailor your experience.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-3">
        {ACCOUNT_TYPES.map(({ value, label, description, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => router.push(`/auth/register/${value}`)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-navy-700/60 p-4 text-center transition hover:border-gold-500 active:scale-[0.98] sm:gap-3 sm:p-6"
          >
            <Icon className="h-7 w-7 text-cream sm:h-9 sm:w-9" />
            <span className="tracked-label text-xs text-cream">{label}</span>
            <p className="text-xs text-muted">{description}</p>
          </button>
        ))}

        {TEST_MODE_ENABLED && (
          <button
            type="button"
            onClick={() => setTestModeOpen((open) => !open)}
            aria-pressed={testModeOpen}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition active:scale-[0.98] sm:gap-3 sm:p-6 ${
              testModeOpen
                ? "border-gold-400 bg-gold-400/5"
                : "border-navy-700/60 hover:border-navy-600"
            }`}
          >
            <MdScience className={`h-7 w-7 sm:h-9 sm:w-9 ${testModeOpen ? "text-gold-400" : "text-cream"}`} />
            <span className="tracked-label text-xs text-cream">Test Mode</span>
            <p className="text-xs text-muted">Preview a Channel Partner dashboard with demo data — no form required.</p>
          </button>
        )}
      </div>

      {TEST_MODE_ENABLED && testModeOpen && (
        <div className="mt-6 rounded-2xl border border-navy-700/60 bg-navy-950 p-6">
          <p className="tracked-label text-xs text-gold-400">Test Mode — Bypass Registration</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {TEST_MODE_DIRECT_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                disabled={bypassLoading !== null}
                onClick={() => handleDirectBypass(option.key, option.profile, option.href)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-navy-700/60 p-4 text-center transition hover:border-gold-500 active:scale-[0.98] disabled:opacity-60 sm:gap-3 sm:p-6"
              >
                <option.Icon className="h-7 w-7 text-gold-400 sm:h-8 sm:w-8" />
                <span className="tracked-label text-xs text-cream">
                  {bypassLoading === option.key ? "Loading…" : option.label}
                </span>
                <p className="text-xs text-muted">{option.description}</p>
              </button>
            ))}
          </div>
          {bypassError && <p className="mt-3 text-xs text-gold-500">{bypassError}</p>}

          <p className="mt-6 tracked-label text-xs text-gold-400">Test Mode — Choose a Channel Partner Dashboard</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {TEST_MODE_CP_OPTIONS.map(({ cpType, label, description, Icon }) => (
              <button
                key={cpType}
                type="button"
                disabled={bypassLoading !== null}
                onClick={() => handleDirectBypass(cpType, TEST_MODE_CP_PROFILES[cpType], `/portal/${cpType}-cp`)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-navy-700/60 p-4 text-center transition hover:border-gold-500 active:scale-[0.98] disabled:opacity-60 sm:gap-3 sm:p-6"
              >
                <Icon className="h-7 w-7 text-gold-400 sm:h-8 sm:w-8" />
                <span className="tracked-label text-xs text-cream">
                  {bypassLoading === cpType ? "Loading…" : label}
                </span>
                <p className="text-xs text-muted">{description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <footer className="mt-8 flex flex-col items-center gap-2 border-t border-navy-700/60 pt-6">
        <p className="text-sm text-muted">
          Already have an account?{" "}
          <Link href="/auth" className="tracked-label text-sm text-gold-400 hover:text-gold-300">
            Sign In
          </Link>
        </p>
      </footer>
    </div>
  );
}
