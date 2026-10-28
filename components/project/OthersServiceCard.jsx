"use client";

import { useState } from "react";
import Link from "next/link";
import { FiLoader } from "react-icons/fi";
import { MdAccountBalance, MdArrowForward, MdGridView } from "react-icons/md";

const SERVICES = [
  {
    href: "/home-loan",
    icon: MdAccountBalance,
    eyebrow: "Finance",
    title: "Home Loans",
    desc: "Compare interest rates, processing fees and tenure across top banks, and check your EMI instantly.",
    cta: "Compare bank deals",
  },
  {
    href: "/others/plot-availability",
    icon: MdGridView,
    eyebrow: "Plot Inventory",
    title: "Plot Availability",
    desc: "See which plots are available, booked or on hold in our RERA-registered layouts — updated live.",
    cta: "View plot layout",
  },
];

export function OthersServiceCards() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
      {SERVICES.map((service) => (
        <OthersServiceCard key={service.href} {...service} />
      ))}
    </div>
  );
}

function OthersServiceCard({ href, icon: Icon, eyebrow, title, desc, cta }) {
  const [loading, setLoading] = useState(false);

  return (
    <Link
      href={href}
      onClick={() => setLoading(true)}
      className="group flex flex-col rounded-sm border border-navy-700/60 bg-navy-900 p-6 transition hover:border-gold-500 sm:p-8"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-sm border border-gold-500/40 bg-gold-500/10 text-gold-400">
        {loading ? <FiLoader className="h-6 w-6 animate-spin" /> : <Icon className="h-6 w-6" />}
      </span>
      <span className="tracked-label mt-5 text-xs text-gold-400">{eyebrow}</span>
      <h2 className="mt-2 font-display text-2xl text-cream">{title}</h2>
      <p className="mt-2 flex-1 text-sm text-muted">{desc}</p>
      <span className="tracked-label mt-6 flex items-center gap-2 text-xs text-gold-400 transition group-hover:text-gold-300">
        {loading ? "Opening..." : cta} <MdArrowForward className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
