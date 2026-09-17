"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdBusinessCenter, MdCampaign, MdLocationOn, MdCheckCircle } from "react-icons/md";
import AuthShell from "./AuthShell";
import Stepper from "./Stepper";
import FormField from "./FormField";
import ChipGroup from "./ChipGroup";
import PasswordFields from "./PasswordFields";
import { inputClass } from "./inputStyles";
import { formatMobile, isMobileValid, isPasswordValid, generateAccountId } from "@/lib/auth";
import { findInvitationCode, markInvitationCodeUsed } from "@/lib/adminStorage";
import { useAuth } from "@/context/AuthContext";
import { useWizardDraft } from "@/lib/useWizardDraft";

const TOTAL_STEPS = 2;

const STEP_LABELS = ["Select Type", "Your Details"];

const CP_TYPES = [
  {
    value: "company",
    label: "Company Channel Partner",
    shortLabel: "Company CP",
    description: "Core office team — verify leads, assign partners and manage the network.",
    Icon: MdBusinessCenter,
  },
  {
    value: "digital",
    label: "Digital Channel Partner",
    shortLabel: "Digital CP",
    description: "Promote projects online and generate leads from social media.",
    Icon: MdCampaign,
  },
  {
    value: "field",
    label: "Field Channel Partner",
    shortLabel: "Field CP",
    description: "Meet clients on ground, arrange site visits and close deals.",
    Icon: MdLocationOn,
  },
];

const CURRENTLY_WORKING_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", hint: "0-1 Years" },
  { value: "intermediate", label: "Intermediate", hint: "1-3 Years" },
  { value: "expert", label: "Expert", hint: "3+ Years" },
];

const ACCOUNT_ID_PREFIX = { company: "CCP", digital: "DCP", field: "FCP" };
const ID_LABEL = {
  company: "Your Company CP ID",
  digital: "Your Digital CP ID",
  field: "Your Field CP ID",
};

const INITIAL_FORM = {
  cpType: "",
  mobile: "",
  email: "",
  city: "",
  password: "",
  confirmPassword: "",
  currentlyWorking: "",
  coverageAreas: "",
  experience: "",
  invitationCode: "",
  agree: false,
};

export default function FreelancerRegistrationWizard() {
  const { login } = useAuth();
  const router = useRouter();
  const { step, setStep, form, setForm, clearDraft } = useWizardDraft("se_draft_freelancer", INITIAL_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const code = form.invitationCode.trim();
  const inviteLookup = useMemo(() => {
    if (!code || !form.cpType) return { record: null, error: "" };
    const record = findInvitationCode(code);
    if (!record) return { record: null, error: "Invalid invitation code. Please check and try again." };
    if (record.cpType !== form.cpType) {
      const label = CP_TYPES.find((t) => t.value === form.cpType)?.shortLabel || "this";
      return { record: null, error: `This code isn't valid for ${label} registrations.` };
    }
    if (record.used) return { record: null, error: "This invitation code has already been used." };
    return { record, error: "" };
  }, [code, form.cpType]);
  const matchedInvite = inviteLookup.record;
  const codeError = inviteLookup.error;

  function goNext() {
    if (step === 1) {
      if (!form.cpType) {
        setError("Please select how you'd like to join the network.");
        return;
      }
      if (!form.invitationCode.trim()) {
        setError("Please enter your invitation code to continue.");
        return;
      }
      if (!matchedInvite) {
        setError(codeError || "Invalid invitation code. Please check and try again.");
        return;
      }
    }
    if (step === 2) {
      if (!isMobileValid(form.mobile) || !form.city.trim()) {
        setError("Please fill in all required fields.");
        return;
      }
      if (!form.experience) {
        setError("Please select your experience level.");
        return;
      }
      if (form.cpType === "digital" && !form.currentlyWorking) {
        setError("Please let us know if you are currently working anywhere.");
        return;
      }
      if (form.cpType === "field" && !form.coverageAreas.trim()) {
        setError("Please enter the localities you cover.");
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

  async function handleSubmit() {
    if (!form.agree) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }
    if (!matchedInvite) {
      setError("Please enter a valid invitation code to continue.");
      return;
    }
    if (!isPasswordValid(form.password)) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setSubmitting(true);
    const id = generateAccountId(ACCOUNT_ID_PREFIX[form.cpType]);
    const profile = {
      fullName: matchedInvite.name,
      mobile: form.mobile,
      email: form.email,
      city: form.city,
      password: form.password,
      accountType: "freelancer",
      cpType: form.cpType,
      accountId: id,
      currentlyWorking: form.currentlyWorking,
      coverageAreas: form.coverageAreas,
      experience: form.experience,
      invitationCode: form.invitationCode,
      verificationStatus: form.cpType === "company" ? "pending" : "active",
      pendingVerification: form.cpType === "company",
      registeredAt: new Date().toISOString(),
      profileComplete: true,
    };
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Registration failed");
      markInvitationCodeUsed(form.invitationCode, id);
      const token = `se_mock_${form.mobile.replace(/\D/g, "")}_${Date.now()}`;
      await login(token, json.data);
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
      <Stepper step={step} total={TOTAL_STEPS} label={STEP_LABELS[step - 1]} />

      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">
            {step === 1 && "Choose Your Channel Partner Path"}
            {step === 2 && "Tell Us About You"}
          </h1>
        <p className="mt-2 text-sm text-muted">
          {step === 1 && "Select how you'd like to work with Simnani Estate."}
          {step === 2 && "Please share your details and experience to help us match you with the right opportunities."}
        </p>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CP_TYPES.map(({ value, label, description, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => update("cpType", value)}
              aria-pressed={form.cpType === value}
              className={`flex flex-col items-center gap-3 border p-6 text-center transition ${
                form.cpType === value
                  ? "border-gold-400 bg-gold-400/5"
                  : "border-navy-700/60 hover:border-navy-600"
              }`}
            >
              <Icon
                className={`h-9 w-9 ${form.cpType === value ? "text-gold-400" : "text-cream"}`}
              />
              <span className="tracked-label text-xs text-cream">{label}</span>
              <p className="text-xs text-muted">{description}</p>
            </button>
          ))}

          {form.cpType && (
            <div className="sm:col-span-3">
              <FormField
                label="Invitation Code"
                htmlFor="invitationCode"
                required
                hint="Enter the invitation code shared with you to auto-fill your details."
              >
                <input
                  id="invitationCode"
                  type="text"
                  placeholder="Enter your invitation code"
                  value={form.invitationCode}
                  onChange={(e) => update("invitationCode", e.target.value)}
                  className={inputClass}
                />
              </FormField>

              {codeError && <p className="mt-2 text-xs text-red-400">{codeError}</p>}

              {matchedInvite && (
                <div className="mt-4 flex items-center gap-3 border border-gold-500/40 bg-gold-400/5 px-4 py-3">
                  <MdCheckCircle className="h-6 w-6 shrink-0 text-gold-400" />
                  <p className="text-sm text-cream">
                    Hi <span className="font-display text-gold-400">{matchedInvite.name}</span>, welcome as a{" "}
                    {CP_TYPES.find((t) => t.value === form.cpType)?.shortLabel}!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          {matchedInvite && (
            <div className="flex items-center gap-3 border border-gold-500/40 bg-gold-400/5 px-4 py-3">
              <MdCheckCircle className="h-6 w-6 shrink-0 text-gold-400" />
              <p className="text-sm text-cream">
                Hi <span className="font-display text-gold-400">{matchedInvite.name}</span>, welcome as a{" "}
                {CP_TYPES.find((t) => t.value === form.cpType)?.shortLabel}!
              </p>
            </div>
          )}

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

          {form.cpType === "digital" && (
            <FormField label="Currently working anywhere?" required>
              <ChipGroup
                options={CURRENTLY_WORKING_OPTIONS}
                value={form.currentlyWorking}
                onChange={(value) => update("currentlyWorking", value)}
              />
            </FormField>
          )}

          {form.cpType === "field" && (
            <FormField
              label="Coverage Localities"
              htmlFor="coverageAreas"
              required
              hint="Neighborhoods or areas where you can arrange site visits."
            >
              <input
                id="coverageAreas"
                type="text"
                placeholder="e.g. Whitefield, Sarjapur Road, HSR Layout"
                value={form.coverageAreas}
                onChange={(e) => update("coverageAreas", e.target.value)}
                className={inputClass}
              />
            </FormField>
          )}

          <FormField label="Experience" required>
            <ChipGroup
              options={EXPERIENCE_LEVELS}
              value={form.experience}
              onChange={(value) => update("experience", value)}
              layout="card"
            />
          </FormField>

          <PasswordFields
            password={form.password}
            confirmPassword={form.confirmPassword}
            onPasswordChange={(value) => update("password", value)}
            onConfirmPasswordChange={(value) => update("confirmPassword", value)}
          />

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
            Channel Partner Policy
          </Link>
          .
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
