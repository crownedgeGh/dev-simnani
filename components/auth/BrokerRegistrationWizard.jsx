"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "./AuthShell";
import Stepper from "./Stepper";
import FormField from "./FormField";
import ChipGroup from "./ChipGroup";
import { PROPERTY_CATEGORIES } from "@/lib/propertyCategories";
import FileUpload from "./FileUpload";
import PasswordFields from "./PasswordFields";
import SearchableSelect from "./SearchableSelect";
import { inputClass, selectClass } from "./inputStyles";
import { formatMobile, isMobileValid, isPasswordValid, generateAccountId } from "@/lib/auth";
import { RTO_STATES, getCitiesForState } from "@/lib/cityRto";
import { useAuth } from "@/context/AuthContext";
import { useWizardDraft } from "@/lib/useWizardDraft";

const ACCOUNT_TYPE = "broker";
const ACCOUNT_PREFIX = "BRK";
const TOTAL_STEPS = 4;

const STEP_LABELS = [
  "Personal Details",
  "Business Details",
  "Professional Verification",
  "Review & Submit",
];

const EXPERIENCE_OPTIONS = ["0 - 2 Years", "3 - 5 Years", "6 - 10 Years", "10+ Years"];

const APPLICANT_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "company", label: "Agency / Company" },
];

const SPECIALTIES = [{ value: "all", label: "All" }, ...PROPERTY_CATEGORIES];

const RERA_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
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
  applicantType: "",
  agencyName: "",
  experience: "",
  officeAddress: "",
  operatingAreas: "",
  specialties: [],
  reraRegistered: "",
  reraNumber: "",
  reraCertificate: null,
  panNumber: "",
  identityDoc: null,
  businessProof: null,
  agree: false,
};

export default function BrokerRegistrationWizard() {
  const { login, user: authUser, updateProfile } = useAuth();
  const router = useRouter();
  const { step, setStep, form, setForm, clearDraft } = useWizardDraft("se_draft_broker", INITIAL_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cityOptions = useMemo(() => {
    if (!form.state) return [];
    return getCitiesForState(form.state).map((c) => c.city);
  }, [form.state]);

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

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleStateChange(state) {
    setForm((prev) => ({ ...prev, state, city: "" }));
  }

  async function goNext() {
    if (step === 1) {
      if (!form.fullName.trim() || !isMobileValid(form.mobile) || !form.email.trim() || !form.state || !form.city) {
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
            reraRegistered: false,
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
      if (!form.applicantType) {
        setError("Please select whether you are an individual or an agency/company.");
        return;
      }
      if (form.applicantType === "company") {
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
      } else if (!form.experience) {
        setError("Please fill in all required fields.");
        return;
      }
    }
    if (step === 3) {
      if (!form.reraRegistered) {
        setError("Please let us know if you are RERA registered.");
        return;
      }
      if (form.reraRegistered === "yes" && !form.reraNumber.trim()) {
        setError("RERA registration is mandatory. Please provide your RERA number.");
        return;
      }
    }
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function selectReraStatus(value) {
    update("reraRegistered", value);
    if (value === "no") {
      setError("");
      setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
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
    router.push("/account");
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
        applicantType: form.applicantType,
        agencyName: form.agencyName,
        experience: form.experience,
        officeAddress: form.officeAddress,
        operatingAreas: form.operatingAreas,
        specialties: form.specialties,
        reraRegistered: form.reraRegistered === "yes",
        reraNumber: form.reraNumber,
        panNumber: form.panNumber,
        pendingVerification: true,
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
    <AuthShell size="xl">
      <Stepper step={step} total={TOTAL_STEPS} label={STEP_LABELS[step - 1]} />

      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">{STEP_LABELS[step - 1]}</h1>
        <p className="mt-2 text-sm text-muted">
          {step === 1 && "Tell us who you are so clients can find you."}
          {step === 2 && "Provide information about your agency or professional practice."}
          {step === 3 && "Your documents will be reviewed before your broker account is verified."}
          {step === 4 && "Confirm your details before we submit your application for review."}
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

            <FormField label="Primary City of Operation" htmlFor="city" required>
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
        <div className="flex flex-col gap-4">
          <FormField label="I am registering as" required>
            <ChipGroup
              options={APPLICANT_TYPES}
              value={form.applicantType}
              onChange={(value) => update("applicantType", value)}
              layout="row"
            />
          </FormField>

          {form.applicantType === "company" && (
            <>
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
            </>
          )}

          {form.applicantType === "individual" && (
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
          )}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <FormField label="Are you RERA Registered?" required>
            <ChipGroup
              options={RERA_OPTIONS}
              value={form.reraRegistered}
              onChange={selectReraStatus}
              layout="row"
            />
          </FormField>

          {form.reraRegistered === "yes" && (
            <>
              <div className="border border-navy-700/60 bg-navy-900 p-4">
                <p className="tracked-label text-xs text-gold-400">RERA Registration Is Mandatory</p>
                <p className="mt-1 text-sm text-muted">
                  RERA registration is compulsory for all brokers on Simnani Estate. Your account
                  cannot be verified without a valid RERA number.
                </p>
              </div>

              <FormField label="RERA Registration Number" htmlFor="reraNumber" required>
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
            </>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="tracked-label mb-2 text-xs text-gold-400">Personal Details</p>
            <div className="grid grid-cols-1 gap-4 border border-navy-700/60 bg-navy-950 p-4 sm:grid-cols-2">
              <ReviewItem label="Full Name" value={form.fullName} />
              <ReviewItem label="Mobile" value={`+91 ${form.mobile}`} />
              <ReviewItem label="Email" value={form.email} />
              <ReviewItem label="State" value={form.state} />
              <ReviewItem label="City" value={form.city} />
            </div>
          </div>

          <div>
            <p className="tracked-label mb-2 text-xs text-gold-400">Business Details</p>
            <div className="grid grid-cols-1 gap-4 border border-navy-700/60 bg-navy-950 p-4 sm:grid-cols-2">
              <ReviewItem
                label="Registering As"
                value={form.applicantType === "company" ? "Agency / Company" : "Individual"}
              />
              {form.applicantType === "company" && (
                <>
                  <ReviewItem label="Agency Name" value={form.agencyName} />
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
                </>
              )}
              <ReviewItem label="Experience" value={form.experience} />
            </div>
          </div>

          <div>
            <p className="tracked-label mb-2 text-xs text-gold-400">Professional Verification</p>
            <div className="grid grid-cols-1 gap-4 border border-navy-700/60 bg-navy-950 p-4 sm:grid-cols-2">
              <ReviewItem label="RERA Registered" value={form.reraRegistered === "yes" ? "Yes" : "No"} />
              {form.reraRegistered === "yes" && (
                <>
                  <ReviewItem label="RERA Number" value={form.reraNumber} />
                  <ReviewItem label="RERA Certificate" value={form.reraCertificate?.name || "Not uploaded"} />
                </>
              )}
              <ReviewItem label="PAN Number" value={form.panNumber || "Not provided"} />
              <ReviewItem label="Identity Document" value={form.identityDoc?.name || "Not uploaded"} />
              <ReviewItem label="Business Proof" value={form.businessProof?.name || "Not uploaded"} />
            </div>
          </div>

          <label className="flex items-start gap-3 text-xs text-muted">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => update("agree", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-gold-400"
            />
            By submitting, you agree to our{" "}
            <Link href="/legal/terms-conditions" target="_blank" onClick={(e) => e.stopPropagation()} className="text-gold-400 hover:text-gold-300">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy-policy" target="_blank" onClick={(e) => e.stopPropagation()} className="text-gold-400 hover:text-gold-300">
              Privacy Policy
            </Link>
            . All information provided will be verified.
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
            (step !== 3 || form.reraRegistered === "yes") && (
              <button
                type="button"
                onClick={goNext}
                disabled={submitting}
                className="tracked-label bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && step === 1 ? "Please wait..." : "Continue"}
              </button>
            )
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
