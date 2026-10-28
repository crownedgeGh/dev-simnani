"use client";

import BackButton from "@/components/layout/BackButton";
import Select from "@/components/ui/Select";

const WORDS_ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

/** "3000000" -> "Thirty Lakhs". Only needs to cover realistic home-loan amounts (lakhs/crores). */
function amountInWords(value) {
  const n = Number(value);
  if (!n) return "";
  if (n >= 1_00_00_000) {
    const crores = n / 1_00_00_000;
    return `${crores % 1 === 0 ? crores : crores.toFixed(2)} Crore${crores !== 1 ? "s" : ""}`;
  }
  if (n >= 1_00_000) {
    const lakhs = n / 1_00_000;
    const whole = Math.floor(lakhs);
    const word = whole < 10 ? WORDS_ONES[whole] : `${whole}`;
    return lakhs % 1 === 0 ? `${word} Lakh${whole !== 1 ? "s" : ""}` : `${lakhs.toFixed(2)} Lakhs`;
  }
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function LoanCalculatorHero({ loanAmount, setLoanAmount, tenure, setTenure, age, setAge, onGetStarted }) {
  return (
    <div className="relative overflow-hidden bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="mb-6 max-w-xl">
          <div className="flex items-center gap-3">
            <BackButton href="/others" />
            <span className="tracked-label text-xs text-gold-400">Home Loans</span>
          </div>
          <h1 className="mt-2 font-display text-3xl text-cream sm:text-4xl lg:text-5xl">
            Compare &amp; get the best home loan deal
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Tell us your loan amount, tenure and age — we&apos;ll match you with the banks offering the lowest rates.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-navy-700/60 bg-navy-900 p-3 sm:flex-row sm:items-stretch sm:gap-0 sm:divide-x sm:divide-navy-700/60 sm:rounded-full sm:p-1.5">
          <div className="relative flex-1 px-3 py-2 sm:px-5">
            <label className="text-[11px] text-muted">Loan amount</label>
            <div className="flex items-center text-cream">
              <span className="mr-1 text-lg">₹</span>
              <input
                type="number"
                min="0"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full bg-transparent text-lg font-semibold text-cream outline-none"
              />
            </div>
            {amountInWords(loanAmount) && (
              <span className="absolute left-3 top-full z-10 mt-1 whitespace-nowrap rounded-md border border-navy-700/60 bg-navy-950 px-2 py-1 text-xs text-muted shadow-lg">
                {amountInWords(loanAmount)}
              </span>
            )}
          </div>

          <div className="flex-1 px-3 py-2 sm:px-5">
            <label className="text-[11px] text-muted">Tenure</label>
            <div className="relative flex items-center text-cream">
              <input
                type="number"
                min="1"
                max="30"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                className="w-14 bg-transparent text-lg font-semibold text-cream outline-none"
              />
              <Select
                value="Years"
                onChange={() => {}}
                options={["Years"]}
                className="bg-transparent text-sm text-muted outline-none"
              />
            </div>
          </div>

          <div className="flex-1 px-3 py-2 sm:px-5">
            <label className="text-[11px] text-muted">Your Age</label>
            <div className="flex items-center text-cream">
              <input
                type="number"
                min="18"
                max="70"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-10 bg-transparent text-lg font-semibold text-cream outline-none"
              />
              <span className="text-sm text-muted">Years</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGetStarted}
            className="tracked-label mt-2 min-h-[44px] rounded-full bg-gold-400 px-6 text-xs font-bold text-navy-950 transition hover:bg-gold-300 active:scale-[0.98] sm:ml-1.5 sm:mt-0"
          >
            Let&apos;s get started
          </button>
        </div>
      </div>
    </div>
  );
}
