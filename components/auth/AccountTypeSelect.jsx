"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdHome, MdTrendingUp, MdDomain, MdWork, MdPerson, MdBadge, MdScience } from "react-icons/md";
import { FiMapPin, FiSmartphone, FiBriefcase } from "react-icons/fi";
import BackButton from "@/components/layout/BackButton";

const TEST_MODE_CP_OPTIONS = [
  { cpType: "field", label: "Field CP", description: "Field Channel Partner demo dashboard.", Icon: FiMapPin },
  { cpType: "digital", label: "Digital CP", description: "Digital Channel Partner demo dashboard.", Icon: FiSmartphone },
  { cpType: "company", label: "Company CP", description: "Company Channel Partner demo dashboard.", Icon: FiBriefcase },
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
];

export default function AccountTypeSelect() {
  const router = useRouter();
  const [testModeOpen, setTestModeOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl border border-navy-700/60 bg-navy-900 p-8 shadow-2xl sm:p-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="tracked-label text-xs text-gold-400">Simnani Estate</span>
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="font-display text-3xl text-cream sm:text-4xl">
            How would you like to use Simnani Estate?
          </h1>
        </div>
        <p className="text-sm text-muted">
          Select your primary account type to tailor your experience.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACCOUNT_TYPES.map(({ value, label, description, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => router.push(`/auth/register/${value}`)}
            className="flex flex-col items-center gap-3 border border-navy-700/60 p-6 text-center transition hover:border-gold-500"
          >
            <Icon className="h-9 w-9 text-cream" />
            <span className="tracked-label text-xs text-cream">{label}</span>
            <p className="text-xs text-muted">{description}</p>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setTestModeOpen((open) => !open)}
          aria-pressed={testModeOpen}
          className={`flex flex-col items-center gap-3 border p-6 text-center transition ${
            testModeOpen
              ? "border-gold-400 bg-gold-400/5"
              : "border-navy-700/60 hover:border-navy-600"
          }`}
        >
          <MdScience className={`h-9 w-9 ${testModeOpen ? "text-gold-400" : "text-cream"}`} />
          <span className="tracked-label text-xs text-cream">Test Mode</span>
          <p className="text-xs text-muted">Preview a Channel Partner dashboard with demo data — no form required.</p>
        </button>
      </div>

      {testModeOpen && (
        <div className="mt-6 border border-navy-700/60 bg-navy-950 p-6">
          <p className="tracked-label text-xs text-gold-400">Test Mode — Choose a Channel Partner Dashboard</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TEST_MODE_CP_OPTIONS.map(({ cpType, label, description, Icon }) => (
              <Link
                key={cpType}
                href={`/portal/freelancer?cpType=${cpType}`}
                className="flex flex-col items-center gap-3 border border-navy-700/60 p-6 text-center transition hover:border-gold-500"
              >
                <Icon className="h-8 w-8 text-gold-400" />
                <span className="tracked-label text-xs text-cream">{label}</span>
                <p className="text-xs text-muted">{description}</p>
              </Link>
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
