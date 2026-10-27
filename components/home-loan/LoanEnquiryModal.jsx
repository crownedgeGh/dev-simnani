"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdCheckCircle } from "react-icons/md";
import Link from "next/link";
import { inputClass, selectClass } from "@/components/auth/inputStyles";
import { LOCATIONS } from "@/lib/locations";
import Select from "@/components/ui/Select";

const fieldLabelClass = "mb-1.5 block text-xs text-muted";

/**
 * LoanEnquiryModal — "We just need a few details..." form.
 * Opens only when a user clicks "Get me this deal" on a specific bank row.
 */
export default function LoanEnquiryModal({ isOpen, onClose, bank, loanAmount, tenure, age }) {
  const overlayRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Select.jsx is a controlled button+listbox, not a real form control, so it
  // can't report its value through the native FormData read below like the
  // rest of this uncontrolled form — these three need their own state.
  const [propertyIdentified, setPropertyIdentified] = useState("");
  const [propertyCity, setPropertyCity] = useState("");
  const [employmentType, setEmploymentType] = useState("salaried");

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/home-loan-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: bank?.name || "",
          bankRate: bank?.rate ?? null,
          loanAmount: Number(fd.get("loanAmount")) || null,
          tenure: Number(fd.get("tenure")) || null,
          age: Number(fd.get("age")) || null,
          propertyIdentified,
          propertyCity,
          propertyCost: Number(fd.get("propertyCost")) || null,
          employmentType,
          income: Number(fd.get("income")) || null,
          currentEmi: Number(fd.get("currentEmi")) || null,
          name: fd.get("name") || "",
          email: fd.get("email") || "",
          phone: fd.get("phone") || "",
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to submit details");
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setSubmitted(false);
    setPropertyIdentified("");
    setPropertyCity("");
    setEmploymentType("salaried");
    onClose();
  }

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loan-modal-title"
      className="fixed inset-0 z-[9999] flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{
        background: "rgba(5,7,12,0.82)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        animation: "lmFadeIn 0.2s ease",
      }}
    >
      <style>{`
        @keyframes lmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lmSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .lm-card { animation: lmSlideUp 0.26s cubic-bezier(0.34,1.5,0.64,1); }
      `}</style>

      <div className="lm-card relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-gold-400/20 bg-navy-900 shadow-2xl sm:rounded-3xl">
        <div
          className="h-0.5"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, var(--color-gold-400) 45%, var(--color-gold-300) 55%, transparent 95%)",
          }}
        />

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-navy-700/60 bg-navy-950/60 text-muted transition hover:border-navy-600 hover:bg-navy-800 hover:text-cream"
        >
          <MdClose className="h-5 w-5" />
        </button>

        <div className="px-5 pb-6 pt-7 sm:px-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <MdCheckCircle className="h-14 w-14 text-gold-400" />
              <h2 className="font-display text-xl text-cream sm:text-2xl">Details submitted</h2>
              <p className="max-w-sm text-sm text-muted">
                {bank?.name ?? "Our loan desk"} will reach out to you shortly to take this forward.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="tracked-label mt-2 min-h-[44px] rounded-full bg-gold-400 px-6 text-xs font-bold text-navy-950 transition hover:bg-gold-300"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 id="loan-modal-title" className="pr-10 font-display text-lg text-cream sm:text-xl">
                We just need a few details to match you with the right home loan product
              </h2>
              {bank && (
                <p className="tracked-label mt-1 text-[11px] text-gold-400">
                  {bank.name} &middot; {bank.rate}% onwards
                </p>
              )}

              <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={fieldLabelClass}>Loan amount</label>
                  <input
                    type="text"
                    name="loanAmount"
                    defaultValue={loanAmount}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={fieldLabelClass}>Tenure (Years)</label>
                  <input type="number" name="tenure" min="1" max="30" defaultValue={tenure} className={inputClass} />
                </div>
                <div>
                  <label className={fieldLabelClass}>Your Age (Years)</label>
                  <input type="number" name="age" min="18" max="70" defaultValue={age} className={inputClass} />
                </div>

                <div>
                  <label className={fieldLabelClass}>Is your property identified</label>
                  <Select
                    name="propertyIdentified"
                    value={propertyIdentified}
                    onChange={(e) => setPropertyIdentified(e.target.value)}
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "Not yet" },
                    ]}
                    placeholder="Select"
                    className={selectClass}
                  />
                </div>
                <div>
                  <label className={fieldLabelClass}>Property city</label>
                  <Select
                    name="propertyCity"
                    value={propertyCity}
                    onChange={(e) => setPropertyCity(e.target.value)}
                    options={LOCATIONS.map((l) => ({ value: l.city, label: l.city }))}
                    placeholder="Select"
                    className={selectClass}
                  />
                </div>
                <div>
                  <label className={fieldLabelClass}>Property Cost</label>
                  <input type="text" name="propertyCost" placeholder="₹ 37,50,000" className={inputClass} />
                </div>

                <div>
                  <label className={fieldLabelClass}>How are you currently employed</label>
                  <Select
                    name="employmentType"
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    options={[
                      { value: "salaried", label: "Salaried" },
                      { value: "self-employed", label: "Self-employed" },
                    ]}
                    className={selectClass}
                  />
                </div>
                <div>
                  <label className={fieldLabelClass}>Your income (Monthly)</label>
                  <input type="text" name="income" placeholder="₹ 1,00,000" className={inputClass} />
                </div>
                <div>
                  <label className={fieldLabelClass}>Current total EMI (Monthly)</label>
                  <input type="text" name="currentEmi" placeholder="₹ 10,000" className={inputClass} />
                </div>

                <div className="sm:col-span-3">
                  <label className={fieldLabelClass}>Full Name (as per PAN)</label>
                  <input type="text" name="name" required className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={fieldLabelClass}>Your Email Id</label>
                  <input type="email" name="email" required className={inputClass} />
                </div>
                <div>
                  <label className={fieldLabelClass}>Mobile Number</label>
                  <input type="tel" name="phone" required className={inputClass} />
                </div>

                <div className="sm:col-span-3 flex items-start gap-2.5">
                  <input id="loan-consent" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-gold-400)]" />
                  <label htmlFor="loan-consent" className="text-xs leading-relaxed text-muted">
                    I authorize Simnani Estate&apos;s relevant loan providers and their representatives to call, SMS or
                    email me with reference to the application &amp; accept Simnani Estate&apos;s{" "}
                    <Link href="/legal" className="text-gold-400">Terms &amp; Conditions</Link>. This consent shall override
                    any DNC/NDNC registration.
                  </label>
                </div>

                {error && (
                  <p className="sm:col-span-3 text-center text-xs text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="tracked-label sm:col-span-3 min-h-[44px] w-full rounded-full bg-gold-400 px-5 py-3.5 text-xs font-bold text-navy-950 transition hover:bg-gold-300 active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit Details"}
                </button>

                <p className="sm:col-span-3 text-center text-[11px] leading-relaxed text-muted/80">
                  Please note that our privacy policy does not govern the use of your data by financial institutions
                  once it is shared. For more information, please refer the privacy policy of the related bank.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
