"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "./AuthShell";
import FormField from "./FormField";
import PasswordFields from "./PasswordFields";
import { inputClass } from "./inputStyles";
import { formatMobile, isMobileValid, isPasswordValid, generateAccountId } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

const INITIAL_FORM = {
  fullName: "",
  mobile: "",
  email: "",
  city: "",
  password: "",
  confirmPassword: "",
  agree: false,
};

export default function CommonPersonRegistrationWizard() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.fullName.trim() || !isMobileValid(form.mobile) || !form.city.trim()) {
      setError("Please fill in all required fields.");
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
    if (!form.agree) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }
    setError("");
    setSubmitting(true);
    const id = generateAccountId("IND");
    const profile = {
      fullName: form.fullName,
      mobile: form.mobile,
      email: form.email,
      city: form.city,
      password: form.password,
      accountType: "common-person",
      accountId: id,
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
      router.push("/");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <AuthShell size="lg">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">Basic Details</h1>
        <p className="mt-2 text-sm text-muted">
          Please provide your primary contact information to begin.
        </p>
      </div>

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
            Privacy Policy
          </Link>
          .
        </label>
      </div>

      {error && <p className="mt-4 text-center text-xs text-red-400">{error}</p>}

      <div className="mt-8 flex items-center justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="tracked-label bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating Account..." : "Create Account"}
        </button>
      </div>
    </AuthShell>
  );
}
