"use client";

import { useState } from "react";
import { toast } from "sonner";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Generic Razorpay checkout trigger — pass amount (rupees) and onSuccess(paymentId).
export default function PayButton({ amount, label = "Pay Now", name = "", notes, onSuccess, className }) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        toast.error("Could not load payment gateway. Check your connection.");
        return;
      }

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, notes }),
      });
      const order = await orderRes.json();

      if (!order.success) {
        toast.error(order.error || "Could not start payment");
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "Simnani Estate",
        description: label,
        theme: { color: "#ffc633" },
        prefill: name ? { name } : undefined,
        handler: async (response) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verify = await verifyRes.json();

          if (verify.success) {
            toast.success("Payment successful");
            onSuccess?.(response.razorpay_payment_id);
          } else {
            toast.error("Payment could not be verified");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      razorpay.open();
    } catch (error) {
      console.error("Razorpay payment error:", error);
      toast.error("Something went wrong starting the payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePay}
      disabled={loading}
      className={
        className ||
        "tracked-label bg-gold-400 text-navy-950 hover:bg-gold-300 transition px-4 py-2 text-xs disabled:opacity-60"
      }
    >
      {loading ? "Processing..." : label}
    </button>
  );
}
