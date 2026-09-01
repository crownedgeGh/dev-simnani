"use client";

import { useState } from "react";
import { MdBusinessCenter, MdCampaign, MdLocationOn } from "react-icons/md";
import AuthShell from "./AuthShell";
import Stepper from "./Stepper";
import FormField from "./FormField";
import ChipGroup from "./ChipGroup";
import RegistrationSuccess from "./RegistrationSuccess";
import { inputClass } from "./inputStyles";
import { formatMobile, isMobileValid, generateAccountId } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

const TOTAL_STEPS = 4;

const STEP_LABELS = ["Select Type", "Basic Details", "Professional Details", "Join Network"];

const CP_TYPES = [
  {
    value: "company",
    label: "Company Channel Partner",
    description: "Core office team — verify leads, assign partners and manage the network.",
    Icon: MdBusinessCenter,
  },
  {
    value: "digital",
    label: "Digital Channel Partner",
    description: "Promote projects online and generate leads from social media.",
    Icon: MdCampaign,
  },
  {
    value: "field",
    label: "Field Channel Partner",
    description: "Meet clients on ground, arrange site visits and close deals.",
    Icon: MdLocationOn,
  },
];

const COMPANY_ROLES = [
  { value: "lead-verification", label: "Lead Verification" },
  { value: "partner-coordination", label: "Partner Coordination" },
  { value: "sales-operations", label: "Sales Operations" },
  { value: "customer-support", label: "Customer Support" },
  { value: "commission-accounts", label: "Commission & Accounts" },
  { value: "other", label: "Other" },
];

const PROMOTION_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "other", label: "Other" },
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
  fullName: "",
  mobile: "",
  email: "",
  city: "",
  role: "",
  platforms: [],
  coverageAreas: "",
  experience: "",
  referral: "",
  inviteCode: "",
  agree: false,
};

export default function FreelancerRegistrationWizard() {
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
      if (!form.cpType) {
        setError("Please select how you'd like to join the network.");
        return;
      }
    }
    if (step === 2) {
      if (!form.fullName.trim() || !isMobileValid(form.mobile) || !form.city.trim()) {
        setError("Please fill in all required fields.");
        return;
      }
    }
    if (step === 3) {
      if (!form.experience) {
        setError("Please select your experience level.");
        return;
      }
      if (form.cpType === "company" && !form.role) {
        setError("Please select your primary role.");
        return;
      }
      if (form.cpType === "digital" && form.platforms.length === 0) {
        setError("Please select at least one platform you promote on.");
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

  function handleSubmit() {
    if (form.cpType === "company" && !form.inviteCode.trim()) {
      setError("Please enter your staff / invite code to continue.");
      return;
    }
    if (!form.agree) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }
    setError("");
    setSubmitting(true);
    setTimeout(() => {
      const id = generateAccountId(ACCOUNT_ID_PREFIX[form.cpType]);
      const profile = {
        fullName: form.fullName,
        mobile: form.mobile,
        email: form.email,
        city: form.city,
        accountType: "freelancer",
        cpType: form.cpType,
        accountId: id,
        role: form.role,
        platforms: form.platforms,
        coverageAreas: form.coverageAreas,
        experience: form.experience,
        referral: form.referral,
        status: form.cpType === "company" ? "pending" : "active",
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
          subtitle="Your registration has been successfully submitted. We are thrilled to welcome you to our exclusive network of professionals."
          idLabel={ID_LABEL[form.cpType]}
          accountId={accountId}
          pending={form.cpType === "company"}
          pendingNote={
            form.cpType === "company"
              ? "Company Channel Partner accounts are reviewed by our team before network access is granted."
              : undefined
          }
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
      <Stepper step={step} total={TOTAL_STEPS} label={STEP_LABELS[step - 1]} />

      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">
          {step === 1 && "Choose Your Channel Partner Path"}
          {step === 2 && "Begin Your Journey"}
          {step === 3 && "Professional Details"}
          {step === 4 && "Join Simnani Network"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {step === 1 && "Select how you'd like to work with Simnani Estate."}
          {step === 2 && "Please provide your primary contact information to initiate the registration process."}
          {step === 3 && "Tell us about your expertise and experience level to help us match you with the right opportunities."}
          {step === 4 && "Promote approved Simnani projects, bring genuine leads and earn commission on eligible successful deals."}
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
        </div>
      )}

      {step === 2 && (
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

      {step === 3 && (
        <div className="flex flex-col gap-6">
          {form.cpType === "company" && (
            <FormField label="Primary Role" required>
              <ChipGroup options={COMPANY_ROLES} value={form.role} onChange={(value) => update("role", value)} />
            </FormField>
          )}

          {form.cpType === "digital" && (
            <FormField label="Where do you promote?" required>
              <ChipGroup
                options={PROMOTION_PLATFORMS}
                value={form.platforms}
                onChange={(value) => update("platforms", value)}
                multi
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
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-6">
          {form.cpType === "company" && (
            <FormField
              label="Staff / Invite Code"
              htmlFor="inviteCode"
              required
              hint="Company Channel Partner accounts require an internal invite code."
            >
              <input
                id="inviteCode"
                type="text"
                placeholder="Enter your staff or invite code"
                value={form.inviteCode}
                onChange={(e) => update("inviteCode", e.target.value)}
                className={inputClass}
              />
            </FormField>
          )}

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
            I agree to the Terms &amp; Conditions and Channel Partner Policy.
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
