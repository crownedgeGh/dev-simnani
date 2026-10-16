"use client";

import { useState } from "react";
import PayButton from "@/components/payment/PayButton";
import { inputClass } from "@/components/auth/inputStyles";

export default function TestPaymentSection() {
  const [amount, setAmount] = useState("1");
  const rupees = Number(amount);
  const valid = rupees > 0;

  return (
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
      <input
        type="number"
        min="1"
        step="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in ₹"
        className={`${inputClass} sm:max-w-[200px]`}
      />
      {valid && <PayButton amount={rupees} label={`Pay ₹${rupees} (Test)`} />}
    </div>
  );
}
