"use client";

import { useState } from "react";
import AuthShell from "./AuthShell";
import Stepper from "./Stepper";
import FormField from "./FormField";
import ChipGroup from "./ChipGroup";
import RegistrationSuccess from "./RegistrationSuccess";
import { inputClass } from "./inputStyles";
import { formatMobile, isMobileValid, generateAccountId } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

const TOTAL_STEPS = 3;

const PROPERTY_TYPES = [
  { value: "flat", label: "Flat" },
  { value: "villa", label: "Villa" },
  { value: "plot", label: "Plot" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "farm-house", label: "Farm House" },
];

const BUDGET_RANGES = [
  { value: "under-25l", label: "Under ₹25 Lakh" },
  { value: "25-50l", label: "₹25 Lakh - ₹50 Lakh" },
  { value: "50l-1cr", label: "₹50 Lakh - ₹1 Crore" },
  { value: "1-2cr", label: "₹1 Crore - ₹2 Crore" },
  { value: "2cr-plus", label: "₹2 Crore+" },
];

const INITIAL_FORM = {
  fullName: "",
  mobile: "",
  email: "",
  city: "",
  propertyTypes: [],
  budget: "",
  location: "",
  agree: false,
};

export default function BuyerRegistrationWizard() {
  const { login } = useAuth();
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
      if (!form.fullName.trim() || !isMobileValid(form.mobile) || !form.city.trim()) {
        setError("Please fill in all required fields.");
        return;
      }
    }
    if (step === 2) {
      if (form.propertyTypes.length === 0 || !form.budget) {
        setError("Please select at least one property type and a budget range.");
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
      const id = generateAccountId("BYR");
      const profile = {
        fullName: form.fullName,
        mobile: form.mobile,
        email: form.email,
        city: form.city,
        accountType: "buyer",
        accountId: id,
        propertyTypes: form.propertyTypes,
        budget: form.budget,
        location: form.location,
        registeredAt: new Date().toISOString(),
      };
      const token = `se_mock_${form.mobile.replace(/\D/g, "")}_${Date.now()}`;
      login(token, profile);
      setSubmitting(false);
      setAccountId(id);
    }, 1000);
  }

  if (accountId) {
    return (
      <AuthShell size="md">
        <RegistrationSuccess
          title="Welcome to Simnani Estate"
          subtitle="Your buyer registration has been successfully submitted."
          idLabel="Assigned Buyer ID"
          accountId={accountId}
          primaryHref="/buy"
          primaryLabel="Explore Properties"
          secondaryHref="/account"
          secondaryLabel="Complete My Profile"
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell size="lg">
      <Stepper
        step={step}
        total={TOTAL_STEPS}
        label={["Basic Details", "Property Requirement", "Review & Submit"][step - 1]}
      />

      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">
          {step === 1 && "Basic Details"}
          {step === 2 && "What are you looking for?"}
          {step === 3 && "Review & Submit"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {step === 1 && "Please provide your primary contact information to begin."}
          {step === 2 && "Help us curate the perfect portfolio of properties for you."}
          {step === 3 && "Confirm your details before we create your buyer account."}
        </p>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <FormField label="Full Name" htmlFor="fullName" required>
            <input
              id="fullName"
              type="text"
              placeholder="e.g. John Doe"
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

          <FormField label="Email Address" htmlFor="email" optional>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField label="City" htmlFor="city" required>
            <input
              id="city"
              type="text"
              placeholder="e.g. Bangalore, Mumbai, Pune"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <FormField label="Property Type" required>
            <ChipGroup
              options={PROPERTY_TYPES}
              value={form.propertyTypes}
              onChange={(value) => update("propertyTypes", value)}
              multi
            />
          </FormField>

          <FormField label="Budget Range" required>
            <ChipGroup
              options={BUDGET_RANGES}
              value={form.budget}
              onChange={(value) => update("budget", value)}
              layout="row"
            />
          </FormField>

          <FormField label="Preferred Location" htmlFor="location" optional>
            <input
              id="location"
              type="text"
              placeholder="e.g., Whitefield, Baner"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 border border-navy-700/60 bg-navy-950 p-4 sm:grid-cols-2">
            <ReviewItem label="Full Name" value={form.fullName} />
            <ReviewItem label="Mobile" value={`+91 ${form.mobile}`} />
            <ReviewItem label="Email" value={form.email || "Not provided"} />
            <ReviewItem label="City" value={form.city} />
            <ReviewItem
              label="Property Type"
              value={
                PROPERTY_TYPES.filter((t) => form.propertyTypes.includes(t.value))
                  .map((t) => t.label)
                  .join(", ") || "Not selected"
              }
            />
            <ReviewItem
              label="Budget"
              value={BUDGET_RANGES.find((b) => b.value === form.budget)?.label || "Not selected"}
            />
            <ReviewItem label="Preferred Location" value={form.location || "Not provided"} />
          </div>

          <label className="flex items-start gap-3 text-xs text-muted">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => update("agree", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-gold-400"
            />
            I agree to the Terms &amp; Conditions and Privacy Policy.
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
            {submitting ? "Creating Account..." : "Create Buyer Account"}
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
