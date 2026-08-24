"use client";

import { useState } from "react";
import AuthShell from "./AuthShell";
import Stepper from "./Stepper";
import FormField from "./FormField";
import ChipGroup from "./ChipGroup";
import FileUpload from "./FileUpload";
import RegistrationSuccess from "./RegistrationSuccess";
import { inputClass, selectClass } from "./inputStyles";
import { formatMobile, isMobileValid, generateAccountId } from "@/lib/auth";

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  "Personal Details",
  "Business Details",
  "Professional Verification",
  "Payment Details",
  "Review & Submit",
];

const EXPERIENCE_OPTIONS = ["0 - 2 Years", "3 - 5 Years", "6 - 10 Years", "10+ Years"];

const SPECIALTIES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "plot", label: "Plot" },
  { value: "land", label: "Land" },
  { value: "farm-house", label: "Farm House" },
  { value: "industrial", label: "Industrial" },
  { value: "rental", label: "Rental" },
];

const INITIAL_FORM = {
  fullName: "",
  mobile: "",
  email: "",
  city: "",
  agencyName: "",
  experience: "",
  officeAddress: "",
  operatingAreas: "",
  specialties: [],
  reraNumber: "",
  reraCertificate: null,
  panNumber: "",
  identityDoc: null,
  businessProof: null,
  accountHolderName: "",
  bankAccountNumber: "",
  ifsc: "",
  upiId: "",
  agree: false,
};

export default function BrokerRegistrationWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [accountId, setAccountId] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function goNext() {
    if (step === 1) {
      if (!form.fullName.trim() || !isMobileValid(form.mobile) || !form.email.trim() || !form.city.trim()) {
        setError("Please fill in all required fields.");
        return;
      }
    }
    if (step === 2) {
      if (
        !form.agencyName.trim() ||
        !form.experience ||
        !form.officeAddress.trim() ||
        !form.operatingAreas.trim() ||
        form.specialties.length === 0
      ) {
        setError("Please fill in all required fields.");
        return;
      }
    }
    if (step === 4) {
      if (!form.accountHolderName.trim() || !form.bankAccountNumber.trim() || !form.ifsc.trim()) {
        setError("Please fill in all required fields.");
        return;
      }
    }
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleSubmit() {
    if (!form.agree) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }
    setError("");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setAccountId(generateAccountId("BRK"));
    }, 1000);
  }

  if (accountId) {
    return (
      <AuthShell size="md">
        <RegistrationSuccess
          title="Registration Submitted"
          subtitle="Your broker profile is under verification. Our team is reviewing your credentials."
          idLabel="Broker ID"
          accountId={accountId}
          pending
          pendingNote="Estimated review time: 24 - 48 hours."
          primaryHref="/buy"
          primaryLabel="Explore Properties"
          secondaryHref="/auth"
          secondaryLabel="Return to Login"
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell size="xl">
      <Stepper step={step} total={TOTAL_STEPS} label={STEP_LABELS[step - 1]} />

      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">{STEP_LABELS[step - 1]}</h1>
        <p className="mt-2 text-sm text-muted">
          {step === 1 && "Tell us who you are so clients can find you."}
          {step === 2 && "Provide information about your agency or professional practice."}
          {step === 3 && "Your documents will be reviewed before your broker account is verified."}
          {step === 4 && "These details are used for eligible commission payments."}
          {step === 5 && "Confirm your details before we submit your application for review."}
        </p>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <FormField label="Full Name" htmlFor="fullName" required>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your legal name"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField label="Mobile Number" htmlFor="mobile" required>
            <div className="flex items-center border border-navy-700/60 bg-navy-950 px-4 transition focus-within:border-gold-400">
              <span className="text-sm text-muted">+91</span>
              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                placeholder="0000 000 000"
                value={form.mobile}
                onChange={(e) => update("mobile", formatMobile(e.target.value))}
                className="h-14 w-full bg-transparent px-3 text-cream placeholder:text-muted focus:outline-none"
              />
            </div>
          </FormField>

          <FormField label="Email Address" htmlFor="email" required>
            <input
              id="email"
              type="email"
              placeholder="name@domain.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField label="Primary City of Operation" htmlFor="city" required>
            <input
              id="city"
              type="text"
              placeholder="e.g. Bangalore, Mumbai"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <FormField label="Agency / Company Name" htmlFor="agencyName" required>
            <input
              id="agencyName"
              type="text"
              placeholder="e.g. Apex Luxury Real Estate"
              value={form.agencyName}
              onChange={(e) => update("agencyName", e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField label="Years of Experience" htmlFor="experience" required>
            <select
              id="experience"
              value={form.experience}
              onChange={(e) => update("experience", e.target.value)}
              className={selectClass}
            >
              <option value="">Select experience range</option>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Primary Office Address" htmlFor="officeAddress" required>
            <input
              id="officeAddress"
              type="text"
              placeholder="Street Address, City, State, PIN Code"
              value={form.officeAddress}
              onChange={(e) => update("officeAddress", e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Key Operating Areas"
            htmlFor="operatingAreas"
            required
            hint="Separate multiple areas with commas."
          >
            <input
              id="operatingAreas"
              type="text"
              placeholder="e.g. Whitefield, Indiranagar, Koramangala"
              value={form.operatingAreas}
              onChange={(e) => update("operatingAreas", e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField label="Property Specialties" required>
            <ChipGroup
              options={SPECIALTIES}
              value={form.specialties}
              onChange={(value) => update("specialties", value)}
              multi
            />
          </FormField>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <FormField label="RERA Registration Number" htmlFor="reraNumber" optional>
            <input
              id="reraNumber"
              type="text"
              placeholder="Enter your RERA ID"
              value={form.reraNumber}
              onChange={(e) => update("reraNumber", e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FileUpload
            id="reraCertificate"
            label="RERA Certificate"
            hint="PDF, JPG, PNG up to 10MB"
            file={form.reraCertificate}
            onChange={(file) => update("reraCertificate", file)}
            optional
          />

          <FormField label="PAN Number" htmlFor="panNumber" optional>
            <input
              id="panNumber"
              type="text"
              placeholder="Enter Tax ID"
              value={form.panNumber}
              onChange={(e) => update("panNumber", e.target.value.toUpperCase())}
              className={`${inputClass} uppercase`}
            />
          </FormField>

          <FileUpload
            id="identityDoc"
            label="Identity Document"
            hint="Passport, National ID · PDF, JPG, PNG up to 10MB"
            file={form.identityDoc}
            onChange={(file) => update("identityDoc", file)}
            optional
          />

          <FileUpload
            id="businessProof"
            label="Business / Agency Proof"
            hint="Business Registration · PDF, JPG, PNG up to 10MB"
            file={form.businessProof}
            onChange={(file) => update("businessProof", file)}
            optional
          />
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4">
          <FormField label="Account Holder Name" htmlFor="accountHolderName" required>
            <input
              id="accountHolderName"
              type="text"
              placeholder="Full name as per bank records"
              value={form.accountHolderName}
              onChange={(e) => update("accountHolderName", e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField label="Bank Account Number" htmlFor="bankAccountNumber" required>
            <input
              id="bankAccountNumber"
              type="text"
              inputMode="numeric"
              placeholder="0000111122223333"
              value={form.bankAccountNumber}
              onChange={(e) => update("bankAccountNumber", e.target.value.replace(/\D/g, ""))}
              className={inputClass}
            />
          </FormField>

          <FormField label="IFSC Code" htmlFor="ifsc" required>
            <input
              id="ifsc"
              type="text"
              placeholder="SBIN0001234"
              value={form.ifsc}
              onChange={(e) => update("ifsc", e.target.value.toUpperCase())}
              className={`${inputClass} uppercase`}
            />
          </FormField>

          <FormField label="UPI ID" htmlFor="upiId" optional>
            <input
              id="upiId"
              type="text"
              placeholder="name@upi"
              value={form.upiId}
              onChange={(e) => update("upiId", e.target.value)}
              className={inputClass}
            />
          </FormField>

          <p className="text-xs text-muted">
            All commission payments will be processed to this account within 7 business days of
            deal closure confirmation.
          </p>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="tracked-label mb-2 text-xs text-gold-400">Personal Details</p>
            <div className="grid grid-cols-1 gap-4 border border-navy-700/60 bg-navy-950 p-4 sm:grid-cols-2">
              <ReviewItem label="Full Name" value={form.fullName} />
              <ReviewItem label="Mobile" value={`+91 ${form.mobile}`} />
              <ReviewItem label="Email" value={form.email} />
              <ReviewItem label="City" value={form.city} />
            </div>
          </div>

          <div>
            <p className="tracked-label mb-2 text-xs text-gold-400">Business Details</p>
            <div className="grid grid-cols-1 gap-4 border border-navy-700/60 bg-navy-950 p-4 sm:grid-cols-2">
              <ReviewItem label="Agency Name" value={form.agencyName} />
              <ReviewItem label="Experience" value={form.experience} />
              <ReviewItem label="Office Address" value={form.officeAddress} />
              <ReviewItem label="Operating Areas" value={form.operatingAreas} />
              <ReviewItem
                label="Specialties"
                value={
                  SPECIALTIES.filter((s) => form.specialties.includes(s.value))
                    .map((s) => s.label)
                    .join(", ") || "Not selected"
                }
              />
            </div>
          </div>

          <div>
            <p className="tracked-label mb-2 text-xs text-gold-400">Professional Verification</p>
            <div className="grid grid-cols-1 gap-4 border border-navy-700/60 bg-navy-950 p-4 sm:grid-cols-2">
              <ReviewItem label="RERA Number" value={form.reraNumber || "Not provided"} />
              <ReviewItem label="PAN Number" value={form.panNumber || "Not provided"} />
              <ReviewItem label="RERA Certificate" value={form.reraCertificate?.name || "Not uploaded"} />
              <ReviewItem label="Identity Document" value={form.identityDoc?.name || "Not uploaded"} />
              <ReviewItem label="Business Proof" value={form.businessProof?.name || "Not uploaded"} />
            </div>
          </div>

          <div>
            <p className="tracked-label mb-2 text-xs text-gold-400">Payment Details</p>
            <div className="grid grid-cols-1 gap-4 border border-navy-700/60 bg-navy-950 p-4 sm:grid-cols-2">
              <ReviewItem label="Account Holder" value={form.accountHolderName} />
              <ReviewItem
                label="Bank Account"
                value={form.bankAccountNumber ? `•••• ${form.bankAccountNumber.slice(-4)}` : ""}
              />
              <ReviewItem label="IFSC" value={form.ifsc} />
              <ReviewItem label="UPI ID" value={form.upiId || "Not provided"} />
            </div>
          </div>

          <label className="flex items-start gap-3 text-xs text-muted">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => update("agree", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-gold-400"
            />
            By submitting, you agree to our Terms of Service and Privacy Policy. All information
            provided will be verified.
          </label>
        </div>
      )}

      {error && <p className="mt-4 text-center text-xs text-red-400">{error}</p>}

      <div className="mt-8 flex items-center justify-between gap-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="tracked-label border border-navy-700/60 px-6 py-4 text-xs text-cream transition hover:border-gold-400"
          >
            Back
          </button>
        ) : (
          <span />
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={goNext}
            className="tracked-label bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="tracked-label bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Registration"}
          </button>
        )}
      </div>
    </AuthShell>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div>
      <p className="tracked-label text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm text-cream">{value}</p>
    </div>
  );
}
