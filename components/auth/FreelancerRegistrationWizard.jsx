"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdBusinessCenter, MdCampaign, MdLocationOn } from "react-icons/md";
import AuthShell from "./AuthShell";
import Stepper from "./Stepper";
import FormField from "./FormField";
import ChipGroup from "./ChipGroup";
import PasswordFields from "./PasswordFields";
import SearchableSelect from "./SearchableSelect";
import SkillsSelector from "./SkillsSelector";
import { inputClass } from "./inputStyles";
import { formatMobile, isMobileValid, isPasswordValid, generateAccountId } from "@/lib/auth";
import { RTO_STATES, getCitiesForState } from "@/lib/cityRto";
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

const ACCOUNT_ID_PREFIX = { company: "CCP", digital: "DCP", field: "FCP" };

const INITIAL_FORM = {
  cpType: "",
  fullName: "",
  mobile: "",
  email: "",
  state: "",
  city: "",
  password: "",
  confirmPassword: "",
  currentlyWorking: "",
  coverageAreas: "",
  skills: [],
  agree: false,
};

export default function FreelancerRegistrationWizard() {
  const { login } = useAuth();
  const router = useRouter();
  const { step, setStep, form, setForm, clearDraft } = useWizardDraft("se_draft_freelancer", INITIAL_FORM);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function showFieldError(fields, message) {
    const errs = {};
    fields.forEach((f) => { errs[f] = true; });
    setFieldErrors(errs);
    setError(message);
    document.getElementById(fields[0])?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const cityOptions = useMemo(() => {
    if (!form.state) return [];
    return getCitiesForState(form.state).map((c) => c.city);
  }, [form.state]);

  function handleStateChange(state) {
    setForm((prev) => ({ ...prev, state, city: "" }));
  }

  function goNext() {
    if (step === 1) {
      if (!form.cpType) {
        setFieldErrors({ cpType: true });
        setError("Please select how you'd like to join the network.");
        return;
      }
    }
    if (step === 2) {
      if (!form.fullName.trim()) {
        showFieldError(["fullName"], "Please enter your full name.");
        return;
      }
      if (!isMobileValid(form.mobile)) {
        showFieldError(["mobile"], "Please enter a valid 10-digit mobile number.");
        return;
      }
      if (!form.state) {
        showFieldError(["state"], "Please select your state.");
        return;
      }
      if (!form.city) {
        showFieldError(["city"], "Please select your city.");
        return;
      }
      if (!form.skills.length) {
        showFieldError(["skills"], "Please add at least one skill.");
        return;
      }
      if (form.cpType === "digital" && !form.currentlyWorking) {
        showFieldError(["currentlyWorking"], "Please let us know if you are currently working anywhere.");
        return;
      }
      if (form.cpType === "field" && !form.coverageAreas.trim()) {
        showFieldError(["coverageAreas"], "Please enter the localities you cover.");
        return;
      }
    }
    setFieldErrors({});
    setError("");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setError("");
    setFieldErrors({});
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    if (!form.fullName.trim()) {
      showFieldError(["fullName"], "Please enter your full name.");
      return;
    }
    if (!isMobileValid(form.mobile)) {
      showFieldError(["mobile"], "Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!form.state) {
      showFieldError(["state"], "Please select your state.");
      return;
    }
    if (!form.city) {
      showFieldError(["city"], "Please select your city.");
      return;
    }
    if (!form.skills || !form.skills.length) {
      showFieldError(["skills"], "Please select at least one skill.");
      return;
    }
    if (form.cpType === "digital" && !form.currentlyWorking) {
      showFieldError(["currentlyWorking"], "Please let us know if you are currently working anywhere.");
      return;
    }
    if (form.cpType === "field" && !form.coverageAreas.trim()) {
      showFieldError(["coverageAreas"], "Please enter the localities you cover.");
      return;
    }
    if (!form.agree) {
      showFieldError(["agree"], "Please accept the Terms & Conditions to continue.");
      return;
    }
    if (!isPasswordValid(form.password)) {
      showFieldError(["password"], "Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      showFieldError(["confirmPassword"], "Passwords do not match.");
      return;
    }
    setFieldErrors({});
    setError("");
    setSubmitting(true);
    const id = generateAccountId(ACCOUNT_ID_PREFIX[form.cpType]);
    const profile = {
      fullName: form.fullName.trim(),
      mobile: form.mobile,
      email: form.email,
      state: form.state,
      city: form.city,
      password: form.password,
      accountType: "freelancer",
      cpType: form.cpType,
      accountId: id,
      currentlyWorking: form.currentlyWorking,
      coverageAreas: form.coverageAreas,
      skills: form.skills,
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
      const token = `se_mock_${form.mobile.replace(/\D/g, "")}_${Date.now()}`;
      await login(token, json.data);
      clearDraft();
      router.push(`/portal/${form.cpType}-cp`);
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
        <div id="cpType" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CP_TYPES.map(({ value, label, description, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => update("cpType", value)}
              aria-pressed={form.cpType === value}
              className={`flex flex-col items-center gap-3 rounded-2xl border p-6 text-center transition active:scale-[0.98] ${
                form.cpType === value
                  ? "border-gold-400 bg-gold-400/5"
                  : fieldErrors.cpType
                  ? "border-red-500"
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
              className={`${inputClass} ${fieldErrors.fullName ? "border-red-500 focus:border-red-400" : ""}`}
            />
          </FormField>

          <FormField label="Mobile Number" htmlFor="mobile" required>
            <div className={`flex items-center rounded-full border bg-navy-950 px-4 transition focus-within:border-gold-400 focus-within:ring-4 focus-within:ring-gold-400/10 ${fieldErrors.mobile ? "border-red-500" : "border-navy-700/60"}`}>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="State" htmlFor="state" required>
              <SearchableSelect
                id="state"
                value={form.state}
                onChange={handleStateChange}
                options={RTO_STATES}
                placeholder="Select your state"
                searchPlaceholder="Search states…"
                invalid={fieldErrors.state}
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
                invalid={fieldErrors.city}
              />
            </FormField>
          </div>

          {form.cpType === "digital" && (
            <FormField label="Currently working anywhere?" required>
              <div id="currentlyWorking" className={fieldErrors.currentlyWorking ? "rounded-xl border border-red-500 p-2" : ""}>
                <ChipGroup
                  options={CURRENTLY_WORKING_OPTIONS}
                  value={form.currentlyWorking}
                  onChange={(value) => update("currentlyWorking", value)}
                />
              </div>
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
                className={`${inputClass} ${fieldErrors.coverageAreas ? "border-red-500 focus:border-red-400" : ""}`}
              />
            </FormField>
          )}

          <FormField
            label="Your Current Skills"
            required
            hint="Select your category, then pick or add your skills below."
          >
            <div id="skills" className={fieldErrors.skills ? "rounded-xl border border-red-500 p-2" : ""}>
              <SkillsSelector
                value={form.skills}
                onChange={(skills) => update("skills", skills)}
              />
            </div>
          </FormField>

          <PasswordFields
            password={form.password}
            confirmPassword={form.confirmPassword}
            onPasswordChange={(value) => update("password", value)}
            onConfirmPasswordChange={(value) => update("confirmPassword", value)}
            passwordInvalid={fieldErrors.password}
            confirmInvalid={fieldErrors.confirmPassword}
          />

          <label id="agree" className={`flex items-start gap-3 text-xs text-muted ${fieldErrors.agree ? "text-red-400" : ""}`}>
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => update("agree", e.target.checked)}
              className={`mt-0.5 h-4 w-4 accent-gold-400 ${fieldErrors.agree ? "outline outline-2 outline-red-500" : ""}`}
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
            className="tracked-label rounded-full border border-navy-700/60 px-6 py-4 text-xs text-cream transition hover:border-gold-400 active:scale-[0.98]"
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
            className="tracked-label rounded-full bg-gold-400 px-6 py-4 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 hover:shadow-gold-400/20 active:scale-[0.98]"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="tracked-label rounded-full bg-gold-400 px-6 py-4 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 hover:shadow-gold-400/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Complete Registration"}
          </button>
        )}
      </div>
    </AuthShell>
  );
}
