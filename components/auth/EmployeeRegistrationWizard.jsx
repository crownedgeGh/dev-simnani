"use client";

import { useState } from "react";
import AuthShell from "./AuthShell";
import Stepper from "./Stepper";
import FormField from "./FormField";
import RegistrationSuccess from "./RegistrationSuccess";
import { inputClass, selectClass } from "./inputStyles";
import { formatMobile, isMobileValid, generateAccountId } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { LOCATIONS } from "@/lib/locations";

const TOTAL_STEPS = 3;

const STEP_LABELS = ["Personal Details", "Employee & Territory", "Review & Submit"];

const INITIAL_FORM = {
  fullName: "",
  mobile: "",
  email: "",
  employeeCode: "",
  designation: "",
  assignedDistrict: "",
  agree: false,
};

export default function EmployeeRegistrationWizard() {
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
      if (!form.fullName.trim() || !isMobileValid(form.mobile) || !form.email.trim()) {
        setError("Please fill in all required fields.");
        return;
      }
    }
    if (step === 2) {
      if (!form.employeeCode.trim() || !form.assignedDistrict) {
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
      const id = generateAccountId("EMP");
      const profile = {
        fullName: form.fullName,
        mobile: form.mobile,
        email: form.email,
        accountType: "employee",
        accountId: id,
        employeeCode: form.employeeCode,
        designation: form.designation,
        assignedDistrict: form.assignedDistrict,
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
          title="Welcome Aboard"
          subtitle="Your employee account is ready. Head to your dashboard to view assigned leads."
          idLabel="Employee ID"
          accountId={accountId}
          primaryHref="/portal/employee"
          primaryLabel="Go to Employee Dashboard"
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
          {step === 1 && "Tell us who you are so we can set up your account."}
          {step === 2 && "Your employee code and district assign the leads you'll manage."}
          {step === 3 && "Confirm your details before we create your employee account."}
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
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <FormField label="Employee Code" htmlFor="employeeCode" required>
            <input
              id="employeeCode"
              type="text"
              placeholder="e.g. SE-STAFF-0245"
              value={form.employeeCode}
              onChange={(e) => update("employeeCode", e.target.value.toUpperCase())}
              className={`${inputClass} uppercase`}
            />
          </FormField>

          <FormField label="Designation" htmlFor="designation" optional>
            <input
              id="designation"
              type="text"
              placeholder="e.g. District Executive"
              value={form.designation}
              onChange={(e) => update("designation", e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Assigned District"
            htmlFor="assignedDistrict"
            required
            hint="Leads, site visits and inventory will be scoped to this district."
          >
            <select
              id="assignedDistrict"
              value={form.assignedDistrict}
              onChange={(e) => update("assignedDistrict", e.target.value)}
              className={selectClass}
            >
              <option value="">Select a district</option>
              {LOCATIONS.map((loc) => (
                <option key={loc.city} value={loc.city}>
                  {loc.city}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="tracked-label mb-2 text-xs text-gold-400">Personal Details</p>
            <div className="grid grid-cols-1 gap-4 border border-navy-700/60 bg-navy-950 p-4 sm:grid-cols-2">
              <ReviewItem label="Full Name" value={form.fullName} />
              <ReviewItem label="Mobile" value={`+91 ${form.mobile}`} />
              <ReviewItem label="Email" value={form.email} />
            </div>
          </div>

          <div>
            <p className="tracked-label mb-2 text-xs text-gold-400">Employee & Territory</p>
            <div className="grid grid-cols-1 gap-4 border border-navy-700/60 bg-navy-950 p-4 sm:grid-cols-2">
              <ReviewItem label="Employee Code" value={form.employeeCode} />
              <ReviewItem label="Designation" value={form.designation || "Not provided"} />
              <ReviewItem label="Assigned District" value={form.assignedDistrict} />
            </div>
          </div>

          <label className="flex items-start gap-3 text-xs text-muted">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => update("agree", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-gold-400"
            />
            By submitting, you agree to our Terms of Service and Privacy Policy.
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
            {submitting ? "Submitting..." : "Create Employee Account"}
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
