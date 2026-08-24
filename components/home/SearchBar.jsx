"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MODES = ["Buy", "Sell", "Rent"];

const PROPERTY_TYPES = ["Any Type", "Apartment", "Villa", "Plot", "Commercial"];

const BUDGETS = [
  "Any Budget",
  "Under ₹50 Lakh",
  "₹50 Lakh - ₹1 Cr",
  "₹1 Cr - ₹2 Cr",
  "₹2 Cr+",
];

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
    <div className="relative z-10 mx-auto -mt-16 w-full max-w-5xl px-4 sm:-mt-20 sm:px-6 lg:px-8">
      <div className="rounded-sm border border-navy-700/60 bg-navy-900 p-4 shadow-2xl sm:p-6">
        <div className="flex flex-wrap gap-2">
          {MODES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`tracked-label rounded-sm px-4 py-2 text-xs transition ${
                mode === item
                  ? "bg-gold-500 text-navy-950"
                  : "text-muted hover:text-cream"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Search city, locality or project"
            className="w-full flex-1 border border-navy-600 bg-navy-950 px-4 py-3 text-sm text-cream placeholder:text-muted focus:border-gold-500 focus:outline-none"
          />

          <select
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value)}
            className="border border-navy-600 bg-navy-950 px-4 py-3 text-sm text-cream focus:border-gold-500 focus:outline-none sm:w-48"
          >
            {PROPERTY_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            className="border border-navy-600 bg-navy-950 px-4 py-3 text-sm text-cream focus:border-gold-500 focus:outline-none sm:w-48"
          >
            {BUDGETS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="tracked-label bg-gold-500 px-6 py-3 text-xs font-semibold text-navy-950 transition hover:bg-gold-400 sm:w-auto"
          >
            Search Properties
          </button>
        </form>
      </div>
    </div>
  );
}
