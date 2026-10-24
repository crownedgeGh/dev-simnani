"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdEngineering, MdFactory, MdAgriculture } from "react-icons/md";
import AuthShell from "./AuthShell";
import FormField from "./FormField";
import PasswordFields from "./PasswordFields";
import SearchableSelect from "./SearchableSelect";
import MobileOtpGate from "./MobileOtpGate";
import { inputClass } from "./inputStyles";
import { formatMobile, isMobileValid, isPasswordValid, generateAccountId } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { RTO_STATES, getCitiesForState } from "@/lib/cityRto";
import { SERVICE_PROVIDER_TYPES, getServiceTypeLabel } from "@/lib/serviceProviders";
import ServiceProviderPlanCards from "@/components/payment/ServiceProviderPlanCards";

const TYPE_ICONS = {
  "civil-contractor": MdEngineering,
  "industrial-epc": MdFactory,
  "agri-infra": MdAgriculture,
};

const INITIAL_FORM = {
  fullName: "",
  mobile: "",
  email: "",
  state: "",
  city: "",
  yearsOfExperience: "",
  password: "",
  confirmPassword: "",
  agree: false,
};

export default function ServiceProviderRegistrationWizard() {
  const { login } = useAuth();
  const router = useRouter();
  const [serviceType, setServiceType] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [registeredName, setRegisteredName] = useState("");

  const cityOptions = useMemo(() => {
    if (!form.state) return [];
    return getCitiesForState(form.state).map((c) => c.city);
  }, [form.state]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function focusFirstError(errors) {
    const order = [
      "fullName",
      "mobile",
      "state",
      "city",
      "yearsOfExperience",
      "password",
      "confirmPassword",
      "agree",
    ];
    const firstKey = order.find((key) => errors[key]);
    document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function handleSubmit() {
    if (!otpVerified) {
      setError("Please verify your mobile number with the OTP before continuing.");
      return;
    }
    const years = Number(form.yearsOfExperience);
    const errors = {
      fullName: !form.fullName.trim(),
      mobile: !isMobileValid(form.mobile),
      state: !form.state,
      city: !form.city.trim(),
      yearsOfExperience: !form.yearsOfExperience.trim() || !Number.isFinite(years) || years < 0,
      password: !isPasswordValid(form.password),
      confirmPassword: form.password !== form.confirmPassword,
      agree: !form.agree,
    };
    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      if (errors.password) {
        setError("Password must be at least 8 characters.");
      } else if (errors.confirmPassword) {
        setError("Passwords do not match.");
      } else if (errors.agree) {
        setError("Please accept the Terms & Conditions to continue.");
      } else {
        setError("All fields are required.");
      }
      focusFirstError(errors);
      return;
    }
    setFieldErrors({});
    setError("");
    setSubmitting(true);
    const profile = {
      fullName: form.fullName,
      mobile: form.mobile,
      email: form.email,
      state: form.state,
      city: form.city,
      yearsOfExperience: years,
      serviceType,
      password: form.password,
      accountType: "service-provider",
      accountId: generateAccountId("SVC"),
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
      setRegisteredName(form.fullName);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (registeredName) {
    return (
      <ServiceProviderPlanCards
        fullName={registeredName}
        onDone={() => router.push("/portal/service-provider")}
      />
    );
  }

  if (!serviceType) {
    return (
      <AuthShell size="lg">
        <div className="mb-6 text-center">
          <span className="tracked-label text-xs text-gold-400">Service Provider</span>
          <h1 className="mt-2 font-display text-2xl text-cream sm:text-3xl">
            What kind of work do you do?
          </h1>
          <p className="mt-2 text-sm text-muted">
            Choose your service category to continue your registration.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {SERVICE_PROVIDER_TYPES.map(({ value, label, description }) => {
            const Icon = TYPE_ICONS[value];
            return (
              <button
                key={value}
                type="button"
                onClick={() => setServiceType(value)}
                className="flex min-h-[44px] flex-col items-center gap-2 rounded-2xl border border-navy-600 bg-navy-900 p-4 text-center transition hover:border-gold-500 hover:bg-gold-500/5 active:scale-[0.98] sm:gap-3 sm:p-6"
              >
                <Icon className="h-7 w-7 text-cream sm:h-9 sm:w-9" />
                <span className="tracked-label text-xs text-cream">{label}</span>
                <p className="text-xs text-muted">{description}</p>
              </button>
            );
          })}
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell size="lg" onBack={() => setServiceType("")}>
      <div className="mb-6 text-center">
        <span className="tracked-label text-xs text-gold-400">{getServiceTypeLabel(serviceType)}</span>
        <h1 className="mt-2 font-display text-2xl text-cream sm:text-3xl">Basic Details</h1>
        <p className="mt-2 text-sm text-muted">All fields below are required.</p>
      </div>

      <div className="flex flex-col gap-4">
        <FormField label="Full Name" htmlFor="fullName" required>
          <input
            id="fullName"
            type="text"
            placeholder="e.g. John Doe"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className={`${inputClass} ${fieldErrors.fullName ? "border-red-500 focus:border-red-400" : ""}`}
          />
        </FormField>

        <FormField label="Mobile Number" htmlFor="mobile" required>
          <div
            className={`flex items-center rounded-full border bg-navy-950 px-4 transition focus-within:border-gold-400 focus-within:ring-4 focus-within:ring-gold-400/10 ${fieldErrors.mobile ? "border-red-500" : "border-navy-700/60"}`}
          >
            <span className="text-sm text-muted">+91</span>
            <input
              id="mobile"
              type="tel"
              inputMode="numeric"
              placeholder="0000 000 000"
              value={form.mobile}
              onChange={(e) => update("mobile", formatMobile(e.target.value))}
              disabled={otpVerified}
              className="h-14 w-full bg-transparent px-3 text-cream placeholder:text-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </FormField>

        <MobileOtpGate
          mobile={form.mobile}
          mobileValid={isMobileValid(form.mobile)}
          verified={otpVerified}
          onVerified={setOtpVerified}
        />

        <fieldset
          disabled={!otpVerified}
          className={`flex flex-col gap-4 ${!otpVerified ? "pointer-events-none opacity-40" : ""}`}
        >
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
                onChange={(state) => setForm((prev) => ({ ...prev, state, city: "" }))}
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

          <FormField label="Years of Experience" htmlFor="yearsOfExperience" required>
            <input
              id="yearsOfExperience"
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="e.g. 8"
              value={form.yearsOfExperience}
              onChange={(e) => update("yearsOfExperience", e.target.value)}
              className={`${inputClass} ${fieldErrors.yearsOfExperience ? "border-red-500 focus:border-red-400" : ""}`}
            />
          </FormField>

          <PasswordFields
            password={form.password}
            confirmPassword={form.confirmPassword}
            onPasswordChange={(value) => update("password", value)}
            onConfirmPasswordChange={(value) => update("confirmPassword", value)}
            passwordInvalid={fieldErrors.password}
            confirmInvalid={fieldErrors.confirmPassword}
          />

          <label
            id="agree"
            className={`flex items-start gap-3 text-xs text-muted ${fieldErrors.agree ? "text-red-400" : ""}`}
          >
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => update("agree", e.target.checked)}
              className={`mt-0.5 h-4 w-4 accent-gold-400 ${fieldErrors.agree ? "outline outline-1 outline-red-500" : ""}`}
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
        </fieldset>
      </div>

      {error && <p className="mt-4 text-center text-xs text-red-400">{error}</p>}

      <div className="mt-8 flex items-center justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !otpVerified}
          className="tracked-label rounded-full bg-gold-400 px-6 py-4 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 hover:shadow-gold-400/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating Account..." : "Create Account"}
        </button>
      </div>
    </AuthShell>
  );
}
