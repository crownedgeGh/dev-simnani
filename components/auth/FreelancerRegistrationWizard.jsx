"use client";

import { useState } from "react";
import AuthShell from "./AuthShell";
import Stepper from "./Stepper";
import FormField from "./FormField";
import ChipGroup from "./ChipGroup";
import RegistrationSuccess from "./RegistrationSuccess";
import { inputClass } from "./inputStyles";
import { formatMobile, isMobileValid, generateAccountId } from "@/lib/auth";

const TOTAL_STEPS = 3;

const ROLES = [
  { value: "sales", label: "Sales" },
  { value: "digital-marketing", label: "Digital Marketing" },
  { value: "social-media", label: "Social Media" },
  { value: "content-creation", label: "Content Creation" },
  { value: "video-editing", label: "Video Editing" },
  { value: "real-estate", label: "Real Estate" },
  { value: "other", label: "Other" },
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", hint: "0-1 Years" },
  { value: "intermediate", label: "Intermediate", hint: "1-3 Years" },
  { value: "expert", label: "Expert", hint: "3+ Years" },
];

const INITIAL_FORM = {
  fullName: "",
  mobile: "",
  email: "",
  city: "",
  role: "",
  experience: "",
  referral: "",
  agree: false,
};

export default function FreelancerRegistrationWizard() {
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
      if (!form.role || !form.experience) {
        setError("Please select what you do and your experience level.");
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
      setAccountId(generateAccountId("FRL"));
    }, 1000);
  }

  if (accountId) {
    return (
      <AuthShell size="md">
        <RegistrationSuccess
          title="Welcome to Simnani Estate"
          subtitle="Your registration has been successfully submitted. We are thrilled to welcome you to our exclusive network of professionals."
          idLabel="Your Freelancer ID"
          accountId={accountId}
          pending
          primaryHref="/portal/freelancer"
          primaryLabel="Start Training"
          secondaryHref="/portal/freelancer"
          secondaryLabel="Return to Dashboard"
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell size="lg">
      <Stepper
        step={step}
        total={TOTAL_STEPS}
        label={["Basic Details", "Professional Details", "Join Network"][step - 1]}
      />

      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">
          {step === 1 && "Begin Your Journey"}
          {step === 2 && "Professional Details"}
          {step === 3 && "Join Simnani Network"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {step === 1 && "Please provide your primary contact information to initiate the registration process."}
          {step === 2 && "Tell us about your expertise and experience level to help us match you with the right opportunities."}
          {step === 3 && "Promote approved Simnani projects, bring genuine leads and earn commission on eligible successful deals."}
        </p>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <FormField label="Full Name" htmlFor="fullName" required>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
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
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField label="City of Operation" htmlFor="city" required>
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
        <div className="flex flex-col gap-6">
          <FormField label="What do you do?" required>
            <ChipGroup options={ROLES} value={form.role} onChange={(value) => update("role", value)} />
          </FormField>

          <FormField label="Experience" required>
            <ChipGroup
              options={EXPERIENCE_LEVELS}
              value={form.experience}
              onChange={(value) => update("experience", value)}
              layout="card"
            />
          </FormField>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <FormField label="Referral Code" htmlFor="referral" optional>
            <input
              id="referral"
              type="text"
              placeholder="Enter referral code"
              value={form.referral}
              onChange={(e) => update("referral", e.target.value)}
              className={inputClass}
            />
          </FormField>

          <label className="flex items-start gap-3 text-xs text-muted">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => update("agree", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-gold-400"
            />
            I agree to the Terms &amp; Conditions and Freelancer Policy.
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
            {submitting ? "Submitting..." : "Complete Registration"}
          </button>
        )}
      </div>
    </AuthShell>
  );
}
