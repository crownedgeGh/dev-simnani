"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "./AuthShell";
import Stepper from "./Stepper";
import FormField from "./FormField";
import ChipGroup from "./ChipGroup";
import PasswordFields from "./PasswordFields";
import SearchableSelect from "./SearchableSelect";
import { inputClass } from "./inputStyles";
import { formatMobile, isMobileValid, isPasswordValid, generateAccountId } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { PROPERTY_CATEGORIES } from "@/lib/propertyCategories";
import { useWizardDraft } from "@/lib/useWizardDraft";
import { RTO_STATES, getCitiesForState } from "@/lib/cityRto";

const ACCOUNT_TYPE = "buyer";
const ACCOUNT_PREFIX = "BYR";
const TOTAL_STEPS = 3;

const PROPERTY_TYPES = PROPERTY_CATEGORIES;

const BUDGET_RANGES = [
  { value: "under-25l", label: "Under ₹25 Lakh" },
  { value: "25-50l", label: "₹25 Lakh - ₹50 Lakh" },
  { value: "50l-1cr", label: "₹50 Lakh - ₹1 Crore" },
  { value: "1-2cr", label: "₹1 Crore - ₹2 Crore" },
  { value: "2cr-plus", label: "₹2 Crore+" },
];

const INITIAL_FORM = {
  accountId: "",
  fullName: "",
  mobile: "",
  email: "",
  state: "",
  city: "",
  password: "",
  confirmPassword: "",
  propertyTypes: [],
  budget: "",
  location: "",
  agree: false,
};

export default function BuyerRegistrationWizard() {
  const { login, user: authUser, updateProfile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { step, setStep, form, setForm, clearDraft } = useWizardDraft("se_draft_buyer", INITIAL_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cityOptions = useMemo(() => {
    if (!form.state) return [];
    return getCitiesForState(form.state).map((c) => c.city);
  }, [form.state]);

  function handleStateChange(state) {
    setForm((prev) => ({ ...prev, state, city: "" }));
  }

  useEffect(() => {
    if (!authUser || authUser.accountType !== ACCOUNT_TYPE || form.accountId) return;
    const params = new URLSearchParams(window.location.search);
    const resumeStep = Number(params.get("step")) || authUser.registrationStep || 1;
    setForm((prev) => ({
      ...prev,
      accountId: authUser.accountId,
      fullName: authUser.fullName || prev.fullName,
      mobile: authUser.mobile || prev.mobile,
      email: authUser.email || prev.email,
      state: authUser.state || prev.state,
      city: authUser.city || prev.city,
    }));
    setStep(Math.min(Math.max(resumeStep, 1), TOTAL_STEPS));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  // A draft resumed from sessionStorage can carry an accountId from a
  // session that no longer exists server-side (cookie cleared/expired).
  // Once auth has resolved with no matching user, drop the stale accountId
  // so step 1 falls back to fresh registration instead of silently failing
  // with "Not authenticated" when updateProfile is called.
  useEffect(() => {
    if (authLoading || authUser || !form.accountId) return;
    setForm((prev) => ({ ...prev, accountId: "" }));
    setStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, authUser]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function goNext() {
    if (step === 1) {
      if (!form.fullName.trim() || !isMobileValid(form.mobile) || !form.state || !form.city.trim()) {
        setError("Please fill in all required fields.");
        return;
      }
      if (!form.accountId) {
        if (!isPasswordValid(form.password)) {
          setError("Password must be at least 8 characters.");
          return;
        }
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
      }
      setError("");
      setSubmitting(true);
      try {
        if (!form.accountId) {
          const id = generateAccountId(ACCOUNT_PREFIX);
          const profile = {
            fullName: form.fullName,
            mobile: form.mobile,
            email: form.email,
            state: form.state,
            city: form.city,
            password: form.password,
            accountType: ACCOUNT_TYPE,
            accountId: id,
            registeredAt: new Date().toISOString(),
            profileComplete: false,
            registrationStep: 2,
          };
          const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile),
          });
          const json = await res.json();
          if (!json.success) throw new Error(json.error || "Registration failed");
          await login(null, json.data);
          setForm((prev) => ({ ...prev, accountId: id }));
        } else {
          const result = await updateProfile({
            fullName: form.fullName,
            email: form.email,
            state: form.state,
            city: form.city,
            registrationStep: 2,
          });
          if (!result?.success) throw new Error(result?.error || "Something went wrong. Please try again.");
        }
      } catch (err) {
        setError(err.message || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
    }
    if (step === 2) {
      if (form.propertyTypes.length === 0) {
        setError("Please select at least one property type.");
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

  async function handleSkip() {
    setError("");
    if (form.accountId) {
      await updateProfile({ registrationStep: step });
    }
    clearDraft();
    router.push("/");
  }

  async function handleSubmit() {
    if (!form.agree) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const result = await updateProfile({
        propertyTypes: form.propertyTypes,
        budget: form.budget,
        location: form.location,
        profileComplete: true,
        registrationStep: null,
      });
      if (!result?.success) throw new Error(result?.error || "Something went wrong. Please try again.");
      clearDraft();
      router.push("/");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="State" htmlFor="state" required>
              <SearchableSelect
                id="state"
                value={form.state}
                onChange={handleStateChange}
                options={RTO_STATES}
                placeholder="Select your state"
                searchPlaceholder="Search states…"
              />
            </FormField>

            <FormField label="City" htmlFor="city" required>
              <SearchableSelect
                id="city"
                value={form.city}
                onChange={(city) => update("city", city)}
                options={cityOptions}
                placeholder={form.state ? "Select your city" : "Select a state first"}
                searchPlaceholder="Search cities…"
                disabled={!form.state}
                emptyMessage="No cities found for this state"
              />
            </FormField>
          </div>

          {!form.accountId && (
            <PasswordFields
              password={form.password}
              confirmPassword={form.confirmPassword}
              onPasswordChange={(value) => update("password", value)}
              onConfirmPasswordChange={(value) => update("confirmPassword", value)}
            />
          )}
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

          <FormField label="Budget Range" optional>
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
            <ReviewItem label="State" value={form.state} />
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
            I agree to the{" "}
            <Link href="/legal/terms-conditions" target="_blank" onClick={(e) => e.stopPropagation()} className="text-gold-400 hover:text-gold-300">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy-policy" target="_blank" onClick={(e) => e.stopPropagation()} className="text-gold-400 hover:text-gold-300">
              Privacy Policy
            </Link>
            .
          </label>
        </div>
      )}

      {error && <p className="mt-4 text-center text-xs text-red-400">{error}</p>}

      <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
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

        <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
          {step > 1 && (
            <button
              type="button"
              onClick={handleSkip}
              className="tracked-label px-4 py-4 text-xs text-muted transition hover:text-gold-400"
            >
              Skip for now
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={goNext}
              disabled={submitting}
              className="tracked-label bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && step === 1 ? "Please wait..." : "Continue"}
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
