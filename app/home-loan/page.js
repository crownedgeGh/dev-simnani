"use client";

import { useState, useEffect } from "react";
import LoanCalculatorHero from "@/components/home-loan/LoanCalculatorHero";
import BankDealsTable from "@/components/home-loan/BankDealsTable";
import LoanEnquiryModal from "@/components/home-loan/LoanEnquiryModal";

export default function HomeLoanPage() {
  const [loanAmount, setLoanAmount] = useState("3000000");
  const [tenure, setTenure] = useState("20");
  const [age, setAge] = useState("35");
  const [selectedBank, setSelectedBank] = useState(null);
  const [quickApply, setQuickApply] = useState(false);
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  useEffect(() => {
    fetch("/api/home-loan-banks")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setBanks(json.data);
      })
      .finally(() => setLoadingBanks(false));
  }, []);

  return (
    <div className="bg-navy-950">
      <LoanCalculatorHero
        loanAmount={loanAmount}
        setLoanAmount={setLoanAmount}
        tenure={tenure}
        setTenure={setTenure}
        age={age}
        setAge={setAge}
        onGetStarted={() => setQuickApply(true)}
      />

      <div id="bank-deals" className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-6 lg:px-8 lg:pb-24">
        <h2 className="font-display text-2xl text-cream sm:text-3xl">Bank(s) Deals</h2>

        {loadingBanks ? (
          <p className="mt-6 text-sm text-muted">Loading bank deals…</p>
        ) : (
          <BankDealsTable banks={banks} onGetDeal={setSelectedBank} />
        )}
      </div>

      <LoanEnquiryModal
        isOpen={!!selectedBank || quickApply}
        onClose={() => {
          setSelectedBank(null);
          setQuickApply(false);
        }}
        bank={selectedBank}
        loanAmount={loanAmount}
        tenure={tenure}
        age={age}
      />
    </div>
  );
}
