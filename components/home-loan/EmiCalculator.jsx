"use client";

import { useState } from "react";
import { FiArrowRight, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { calculateLoan, FOIR, RETIREMENT_AGE } from "@/lib/emi";

const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** 5000000 -> "50L", 25000 -> "25K", 20000000 -> "2Cr" */
function short(n) {
  if (n >= 1_00_00_000) return `${+(n / 1_00_00_000).toFixed(2)}Cr`;
  if (n >= 1_00_000) return `${+(n / 1_00_000).toFixed(2)}L`;
  if (n >= 1_000) return `${+(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, Number(v) || 0));

function Field({ label, value, onChange, min, max, step, prefix, suffix, format = (v) => v, children }) {
  return (
    <div className="rounded-sm border border-navy-700/60 bg-navy-950 p-4 transition hover:border-navy-600 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="tracked-label text-[10px] text-muted sm:text-[11px]">{label}</span>
        {children}
      </div>
      <div className="mt-3 flex items-baseline gap-1 border-b border-navy-700/60 pb-2 transition focus-within:border-gold-400">
        {prefix && <span className="text-lg text-gold-400">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          aria-label={label}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => onChange(clamp(value, min, max))}
          className="w-full min-w-0 bg-transparent font-display text-2xl text-cream outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="shrink-0 text-sm text-muted">{suffix}</span>}
      </div>
      <input
        type="range"
        aria-label={`${label} slider`}
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-4 h-6 w-full cursor-pointer accent-gold-400"
      />
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

export default function EmiCalculator({ onApply }) {
  const [amount, setAmount] = useState(3000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [unit, setUnit] = useState("yr");
  const [age, setAge] = useState(30);
  const [income, setIncome] = useState(100000);
  const [existingEmi, setExistingEmi] = useState(0);

  const isYears = unit === "yr";
  const tenureRange = isYears ? { min: 1, max: 30, step: 1 } : { min: 12, max: 360, step: 6 };

  function switchUnit(next) {
    if (next === unit) return;
    setTenure(next === "yr" ? clamp(Math.round(tenure / 12), 1, 30) : clamp(tenure * 12, 12, 360));
    setUnit(next);
  }

  const amountN = clamp(amount, 100000, 50000000);
  const months = isYears ? clamp(tenure, 1, 30) * 12 : clamp(tenure, 12, 360);
  const result = calculateLoan({
    amount: amountN,
    rate: clamp(rate, 6, 15),
    months,
    age: clamp(age, 21, 65),
    income: clamp(income, 15000, 2000000),
    existingEmi: clamp(existingEmi, 0, 500000),
  });

  const principalPct = result.totalPayable ? (amountN / result.totalPayable) * 100 : 100;
  const eligibleYears = result.eligibleMonths / 12;

  return (
    <section id="emi-calculator" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="max-w-2xl">
        <span className="tracked-label text-xs text-gold-400">EMI &amp; Eligibility</span>
        <h2 className="mt-2 font-display text-3xl text-cream sm:text-4xl lg:text-5xl">Plan your home loan</h2>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Adjust the sliders to see your monthly EMI, total interest, and how much you&apos;re likely to be eligible for.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:mt-10 lg:grid-cols-5">
        {/* Inputs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3">
          <Field label="Loan Amount" value={amount} onChange={setAmount} min={100000} max={50000000} step={50000} prefix="₹" format={short} />
          <Field label="Interest Rate (p.a.)" value={rate} onChange={setRate} min={6} max={15} step={0.05} suffix="%" format={(v) => `${v}%`} />
          <Field
            label="Tenure"
            value={tenure}
            onChange={setTenure}
            {...tenureRange}
            suffix={isYears ? "Yrs" : "Mo"}
            format={(v) => `${v} ${isYears ? "Yrs" : "Mo"}`}
          >
            <div role="group" aria-label="Tenure unit" className="flex rounded-full border border-navy-700/60 p-0.5">
              {[
                ["yr", "Yr"],
                ["mo", "Mo"],
              ].map(([key, text]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={unit === key}
                  onClick={() => switchUnit(key)}
                  className={`tracked-label min-h-[32px] min-w-[44px] rounded-full px-3 text-[10px] transition ${
                    unit === key ? "bg-gold-400 text-navy-950" : "text-muted hover:text-gold-400"
                  }`}
                >
                  {text}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Your Age" value={age} onChange={setAge} min={21} max={65} step={1} suffix="Yrs" format={(v) => `${v} Yrs`} />
          <Field label="Monthly Income" value={income} onChange={setIncome} min={15000} max={2000000} step={5000} prefix="₹" format={short} />
          <Field label="Existing Monthly EMIs" value={existingEmi} onChange={setExistingEmi} min={0} max={500000} step={1000} prefix="₹" format={short} />
        </div>

        {/* Results */}
        <aside className="flex flex-col rounded-sm border border-gold-500/40 bg-navy-900 lg:sticky lg:top-24 lg:col-span-2 lg:self-start">
          <div className="border-b border-navy-700/60 bg-gradient-to-br from-gold-400/15 to-transparent p-5 sm:p-6">
            <span className="tracked-label text-[11px] text-muted">Your Monthly EMI</span>
            <p className="mt-1 font-display text-4xl text-gold-400 sm:text-5xl">{inr(result.monthly)}</p>
            <p className="mt-1 text-sm text-muted">
              for {months} months on {inr(amountN)}
            </p>

            <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-navy-700" aria-hidden="true">
              <div className="bg-gold-400 transition-all" style={{ width: `${principalPct}%` }} />
              <div className="flex-1 bg-navy-600" />
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="flex items-center gap-1.5 text-cream">
                <span className="h-2 w-2 rounded-full bg-gold-400" /> Principal {Math.round(principalPct)}%
              </span>
              <span className="flex items-center gap-1.5 text-muted">
                <span className="h-2 w-2 rounded-full bg-navy-600" /> Interest {100 - Math.round(principalPct)}%
              </span>
            </div>
          </div>

          <dl className="divide-y divide-navy-700/60 px-5 text-sm sm:px-6">
            {[
              ["Principal", inr(amountN)],
              ["Total Interest", inr(result.totalInterest)],
              ["Total Payable", inr(result.totalPayable)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-3">
                <dt className="text-muted">{k}</dt>
                <dd className="text-cream">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="m-5 mt-2 rounded-sm border border-navy-700/60 bg-navy-950 p-4 sm:mx-6">
            <div className="flex items-center gap-2">
              {result.isFullyEligible ? (
                <FiCheckCircle className="h-4 w-4 shrink-0 text-gold-400" />
              ) : (
                <FiAlertCircle className="h-4 w-4 shrink-0 text-gold-300" />
              )}
              <span className="tracked-label text-[11px] text-cream">
                {result.isFullyEligible ? "Fully eligible" : "Partially eligible"}
              </span>
            </div>
            <p className="mt-2 font-display text-2xl text-cream">{inr(result.eligibleAmount)}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted">Eligible tenure</p>
                <p className="mt-0.5 text-cream">
                  {eligibleYears % 1 === 0 ? eligibleYears : eligibleYears.toFixed(1)} Yrs
                </p>
              </div>
              <div>
                <p className="text-muted">EMI at eligibility</p>
                <p className="mt-0.5 text-cream">{inr(result.eligibleEmi)}</p>
              </div>
            </div>
          </div>

          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <button
              type="button"
              onClick={() => onApply?.({ amount: Math.round(result.eligibleAmount), tenureYears: Math.ceil(result.eligibleMonths / 12) })}
              disabled={result.eligibleAmount <= 0}
              className="tracked-label flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-6 text-xs font-bold text-navy-950 transition hover:bg-gold-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply Now <FiArrowRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>

      <p className="mt-6 text-xs italic leading-relaxed text-muted">
        <span className="font-semibold not-italic text-cream">Disclaimer:</span> Results are indicative, assuming total EMIs up to{" "}
        {FOIR * 100}% of income and loan closure by age {RETIREMENT_AGE}. They are not a loan offer — final eligibility and terms
        depend on the lender&apos;s evaluation.
      </p>
    </section>
  );
}
