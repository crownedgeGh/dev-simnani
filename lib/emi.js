// Banks typically cap total EMIs at ~50% of monthly income (FOIR) and want the
// loan closed by retirement age.
export const FOIR = 0.5;
export const RETIREMENT_AGE = 60;

/** Monthly EMI for principal p, annual rate (%), n months. */
export function emi(p, annualRate, n) {
  if (p <= 0 || n <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return p / n;
  const f = Math.pow(1 + r, n);
  return (p * r * f) / (f - 1);
}

/** Largest principal a given monthly EMI can service. Inverse of emi(). */
export function principalFor(monthlyEmi, annualRate, n) {
  if (monthlyEmi <= 0 || n <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return monthlyEmi * n;
  const f = Math.pow(1 + r, n);
  return (monthlyEmi * (f - 1)) / (r * f);
}

export function calculateLoan({ amount, rate, months, age, income, existingEmi }) {
  const eligibleMonths = Math.max(0, Math.min(months, (RETIREMENT_AGE - age) * 12));
  const maxEmi = Math.max(0, income * FOIR - existingEmi);
  const maxLoan = principalFor(maxEmi, rate, eligibleMonths);
  const eligibleAmount = Math.min(amount, maxLoan);

  const monthly = emi(amount, rate, months);
  const totalPayable = monthly * months;

  return {
    monthly,
    totalPayable,
    totalInterest: totalPayable - amount,
    eligibleMonths,
    eligibleAmount,
    eligibleEmi: emi(eligibleAmount, rate, eligibleMonths),
    maxEmi,
    isFullyEligible: eligibleAmount >= amount && eligibleMonths >= months,
  };
}
