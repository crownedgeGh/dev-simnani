"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MODES = ["Buy", "Rent", "Invest"];

const PROPERTY_TYPES = ["Property Type", "Apartment", "Villa", "Plot", "Commercial"];

const BUDGETS = [
  "Budget",
  "Under ₹50 Lakh",
  "₹50 Lakh - ₹1 Cr",
  "₹1 Cr - ₹2 Cr",
  "₹2 Cr+",
];

const SELECT_CLASS =
  "w-full appearance-none rounded-md border border-navy-700/70 bg-navy-900/80 px-4 py-3.5 text-sm text-cream transition focus:border-gold-500 focus:outline-none";

export default function SearchBar() {
  const router = useRouter();
  const [mode, setMode] = useState("Buy");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[0]);
  const [budget, setBudget] = useState(BUDGETS[0]);

  function handleSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (propertyType !== PROPERTY_TYPES[0]) params.set("type", propertyType);
    if (budget !== BUDGETS[0]) params.set("budget", budget);

    const query = params.toString();
    router.push(`/${mode.toLowerCase()}${query ? `?${query}` : ""}`);
  }

  return (
    <div className="rounded-3xl border border-cream/12 bg-navy-950/92 p-5 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.95)] backdrop-blur-md sm:p-8 lg:px-10 lg:py-9">
      <p className="tracked-label mb-5 text-[11px] font-medium text-gold-400">
        Start Your Search
      </p>

      <div className="flex flex-wrap gap-2">
        {MODES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`tracked-label rounded-md px-5 py-2.5 text-xs font-medium transition ${
              mode === item
                ? "bg-gold-400 text-navy-950"
                : "text-muted hover:text-cream"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 lg:flex-row">
        <div className="flex flex-1 items-center gap-2.5 rounded-md border border-navy-700/70 bg-navy-900/80 px-4 transition focus-within:border-gold-500">
          <span className="shrink-0 text-cream/70">
            <PinIcon />
          </span>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Search city, locality or project"
            className="w-full bg-transparent py-3.5 text-sm text-cream placeholder:text-muted focus:outline-none"
          />
        </div>

        <div className="relative lg:w-52">
          <select
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value)}
            className={SELECT_CLASS}
          >
            {PROPERTY_TYPES.map((option) => (
              <option key={option} value={option} className="bg-navy-900">
                {option}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>

        <div className="relative lg:w-52">
          <select
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            className={SELECT_CLASS}
          >
            {BUDGETS.map((option) => (
              <option key={option} value={option} className="bg-navy-900">
                {option}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>

        <button
          type="submit"
          className="tracked-label flex items-center justify-center gap-2.5 rounded-md bg-gold-400 px-8 py-3.5 text-xs font-semibold text-navy-950 transition hover:bg-gold-300 lg:w-auto"
        >
          Search Properties
          <SearchIcon />
        </button>
      </form>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/70"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9.5 6 6 6-6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6.75-5.86-6.75-11A6.75 6.75 0 0 1 12 3.25 6.75 6.75 0 0 1 18.75 10c0 5.14-6.75 11-6.75 11Z" />
      <circle cx="12" cy="10" r="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m20 20-3.5-3.5" />
    </svg>
  );
}
