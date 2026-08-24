"use client";

import { useState } from "react";
import Link from "next/link";

const ICON_PATHS = {
  home: "M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10M9.5 19.5v-6h5v6",
  "trending-up": "M4 16l5.5-5.5 3.5 3.5L20 6.5M20 6.5h-5M20 6.5v5",
  domain: "M4 20.5V6l6-2.5 6 2.5v14.5M10 20.5V16h3M7 9h.01M7 12.5h.01M13 9h.01M13 12.5h.01M4 20.5h16",
  briefcase: "M4 8.5h16v11H4v-11ZM9 8.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2.5M4 13h16",
};

function AccountIcon({ name, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS[name]} />
    </svg>
  );
}

const ACCOUNT_TYPES = [
  {
    value: "buyer",
    label: "Buyer",
    description: "Find and purchase properties.",
    icon: "home",
  },
  {
    value: "investor",
    label: "Investor",
    description: "Discover real estate investment opportunities.",
    icon: "trending-up",
  },
  {
    value: "broker",
    label: "Broker",
    description: "Sell properties and manage clients.",
    icon: "domain",
  },
  {
    value: "freelancer",
    label: "Freelancer",
    description: "Promote projects, generate leads and earn commission.",
    icon: "briefcase",
  },
];

export default function AccountTypeSelect() {
  const [selected, setSelected] = useState("");

  return (
    <div className="w-full max-w-3xl border border-navy-700/60 bg-navy-900 p-8 shadow-2xl sm:p-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="tracked-label text-xs text-gold-400">Simnani Estate</span>
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          How would you like to use Simnani Estate?
        </h1>
        <p className="text-sm text-muted">
          Select your primary account type to tailor your experience.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ACCOUNT_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setSelected(type.value)}
            aria-pressed={selected === type.value}
            className={`flex flex-col items-center gap-3 border p-6 text-center transition ${
              selected === type.value
                ? "border-gold-400 bg-gold-400/5"
                : "border-navy-700/60 hover:border-navy-600"
            }`}
          >
            <AccountIcon
              name={type.icon}
              className={`h-9 w-9 ${selected === type.value ? "text-gold-400" : "text-cream"}`}
            />
            <span className="tracked-label text-xs text-cream">{type.label}</span>
            <p className="text-xs text-muted">{type.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        {selected ? (
          <Link
            href={`/auth/register/${selected}`}
            className="tracked-label bg-gold-400 px-8 py-4 text-xs text-navy-950 transition hover:bg-gold-300"
          >
            Continue
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="tracked-label cursor-not-allowed bg-gold-400 px-8 py-4 text-xs text-navy-950 opacity-50"
          >
            Continue
          </button>
        )}
      </div>

      <footer className="mt-8 flex flex-col items-center gap-2 border-t border-navy-700/60 pt-6">
        <p className="text-xs text-muted">
          Already have an account?{" "}
          <Link href="/auth" className="tracked-label text-gold-400 hover:text-gold-300">
            Sign In
          </Link>
        </p>
      </footer>
    </div>
  );
}
