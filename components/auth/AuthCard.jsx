"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const OTP_LENGTH = 6;

function formatMobile(value) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  return [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 10)]
    .filter(Boolean)
    .join(" ");
}

export default function AuthCard() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState("mobile"); // "mobile" | "otp" | "success"
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(59);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const mobileValid = mobile.replace(/\D/g, "").length === 10;

  function startResendTimer() {
    clearInterval(timerRef.current);
    setResendIn(59);
    timerRef.current = setInterval(() => {
      setResendIn((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleMobileSubmit(event) {
    event.preventDefault();
    if (!mobileValid || loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtp(Array(OTP_LENGTH).fill(""));
      setError("");
      setStep("otp");
      startResendTimer();
      requestAnimationFrame(() => otpRefs.current[0]?.focus());
    }, 800);
  }

  function handleOtpChange(index, rawValue) {
    const value = rawValue.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setError("");
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, event) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(event) {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    [...pasted].forEach((char, i) => {
      next[i] = char;
    });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  function handleVerify() {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      clearInterval(timerRef.current);
      setLoading(false);

      // Mock login — check if a registered profile exists for this mobile
      const rawProfile = localStorage.getItem("se_user_profile");
      let profile = rawProfile ? JSON.parse(rawProfile) : null;

      // If no existing profile (returning user who registered elsewhere), create a minimal one
      if (!profile || profile.mobile?.replace(/\D/g, "") !== mobile.replace(/\D/g, "")) {
        profile = {
          fullName: "",
          mobile: mobile,
          email: "",
          accountType: "buyer",
          accountId: `SG-BYR-${Math.floor(100000 + Math.random() * 900000)}`,
          city: "",
          registeredAt: new Date().toISOString(),
        };
      }

      const token = `se_mock_${mobile.replace(/\D/g, "")}_${Date.now()}`;
      login(token, profile);
      setStep("success");
    }, 1000);
  }

  function handleChangeNumber() {
    clearInterval(timerRef.current);
    setError("");
    setStep("mobile");
  }

  function handleContinue() {
    router.push("/");
  }

  return (
    <div className="w-full max-w-md border border-navy-700/60 bg-navy-900 p-8 shadow-2xl sm:p-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="tracked-label text-xs text-gold-400">
          Simnani Estate
        </span>
        <h1 className="font-display text-3xl text-cream sm:text-4xl">
          {step === "mobile" && "Welcome Back"}
          {step === "otp" && "Verify Your Number"}
          {step === "success" && "Verified"}
        </h1>
        <p className="text-sm text-muted">
          {step === "mobile" &&
            "Access your exclusive Simnani Estate portfolio."}
          {step === "otp" && (
            <>
              We&apos;ve sent a 6-digit code to{" "}
              <span className="text-gold-400">+91 {mobile}</span>
            </>
          )}
          {step === "success" &&
            "You're signed in. Explore properties, investments and more."}
        </p>
      </div>

      {step === "mobile" && (
        <form onSubmit={handleMobileSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="mobile" className="tracked-label text-xs text-cream/80">
              Mobile Number
            </label>
            <div className="flex items-center border border-navy-700/60 bg-navy-950 px-4 transition focus-within:border-gold-400">
              <span className="text-sm text-muted">+91</span>
              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="0000 000 000"
                value={mobile}
                onChange={(event) => setMobile(formatMobile(event.target.value))}
                className="h-14 w-full bg-transparent px-3 text-cream placeholder:text-muted focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!mobileValid || loading}
            className="tracked-label mt-2 flex items-center justify-center gap-2 bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Continue with OTP"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted">Wrong number?</span>
            <button
              type="button"
              onClick={handleChangeNumber}
              className="tracked-label text-xs text-gold-400 hover:text-gold-300"
            >
              Change
            </button>
          </div>

          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  otpRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                onPaste={handleOtpPaste}
                className={`h-14 w-12 border bg-navy-950 text-center text-lg text-cream outline-none transition focus:border-gold-400 ${
                  error ? "border-red-500" : "border-navy-700/60"
                }`}
              />
            ))}
          </div>

          {error && <p className="text-center text-xs text-red-400">{error}</p>}

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading}
            className="tracked-label flex items-center justify-center gap-2 bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <div className="text-center text-xs text-muted">
            Didn&apos;t receive the code?{" "}
            {resendIn > 0 ? (
              <span>Resend in 0:{String(resendIn).padStart(2, "0")}</span>
            ) : (
              <button
                type="button"
                onClick={startResendTimer}
                className="tracked-label text-gold-400 hover:text-gold-300"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="mt-8 flex flex-col items-center gap-6">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-400 text-2xl text-gold-400">
            ✓
          </span>
          <button
            type="button"
            onClick={handleContinue}
            className="tracked-label w-full bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 transition hover:bg-gold-300"
          >
            Continue to Simnani Estate
          </button>
        </div>
      )}

      {step !== "success" && (
        <footer className="mt-8 flex flex-col items-center gap-2 border-t border-navy-700/60 pt-6">
          <p className="text-xs text-muted">
            New to Simnani Estate?{" "}
            <Link href="/auth/register" className="tracked-label text-gold-400 hover:text-gold-300">
              Create Account
            </Link>
          </p>
        </footer>
      )}
    </div>
  );
}
