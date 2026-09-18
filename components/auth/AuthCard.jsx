"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdScience, MdCheckCircle } from "react-icons/md";
import { FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import BackButton from "@/components/layout/BackButton";

const OTP_LENGTH = 6;

function formatMobile(value) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  return [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 10)]
    .filter(Boolean)
    .join(" ");
}

export default function AuthCard() {
  const router = useRouter();
  const { login, loginWithMobile, loginWithPassword, resetPassword } = useAuth();

  const [mode, setMode] = useState("password"); // "password" | "otp"
  const [step, setStep] = useState("mobile"); // "mobile" | "otp" | "forgot-otp" | "new-password"
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTesterLogin, setIsTesterLogin] = useState(false);
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

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    if (!mobileValid || !password || loading) return;
    setLoading(true);
    setError("");
    try {
      await loginWithPassword(mobile, password);
      router.push("/");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
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

  async function handleVerify() {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await loginWithMobile(mobile);
      clearInterval(timerRef.current);
      router.push("/");
    } catch (err) {
      setLoading(false);
      setError(err.message || "Verification failed. Please try again.");
    }
  }

  async function handleTesterLogin() {
    if (loading) return;
    setLoading(true);
    setIsTesterLogin(true);
    setError("");

    const testerProfile = {
      fullName: "Tester Account",
      mobile: "98765 43210",
      email: "tester@simnaniestate.com",
      accountType: "common-person",
      accountId: "SG-IND-TESTER",
      city: "Mumbai",
      propertyType: "flat",
      purpose: "sale",
      locality: "Bandra West",
      registeredAt: new Date().toISOString(),
    };

    try {
      await login(null, testerProfile);
      clearInterval(timerRef.current);
      router.push("/");
    } catch (err) {
      setLoading(false);
      setError(err.message || "Tester login failed. Please try again.");
    }
  }

  function handleChangeNumber() {
    clearInterval(timerRef.current);
    setError("");
    setSuccessMessage("");
    setNewPassword("");
    setConfirmPassword("");
    setStep("mobile");
  }

  async function handleForgotPassword() {
    if (!mobileValid) {
      setError("Please enter your 10-digit mobile number first.");
      const mobileEl = document.getElementById("mobile");
      if (mobileEl) mobileEl.focus();
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, checkOnly: true }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "No account found with this mobile number");
      }
      setOtp(Array(OTP_LENGTH).fill(""));
      setStep("forgot-otp");
      startResendTimer();
      requestAnimationFrame(() => otpRefs.current[0]?.focus());
    } catch (err) {
      setError(err.message || "Failed to start password reset");
    } finally {
      setLoading(false);
    }
  }

  function handleForgotOtpVerify() {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter all 6 digits of the verification code");
      return;
    }
    setError("");
    setSuccessMessage("");
    setStep("new-password");
  }

  async function handleNewPasswordSubmit(event) {
    event.preventDefault();
    if (loading) return;

    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await resetPassword(mobile, newPassword, confirmPassword);
      setSuccessMessage("Password updated successfully in database! Redirecting...");
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to update password. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md border border-navy-700/60 bg-navy-900 p-8 shadow-2xl sm:p-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="tracked-label text-xs text-gold-400">
          Simnani Estate
        </span>
        <div className="flex items-center gap-3">
          {step === "mobile" ? (
            <BackButton />
          ) : (
            <button
              type="button"
              onClick={handleChangeNumber}
              aria-label="Back to login"
              className="flex h-11 w-11 shrink-0 items-center justify-center border border-navy-700/60 bg-navy-900 text-cream transition hover:border-gold-400 hover:text-gold-400"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="font-display text-3xl text-cream sm:text-4xl">
            {step === "mobile" && "Welcome Back"}
            {step === "otp" && "Verify Your Number"}
            {step === "forgot-otp" && "Reset Password"}
            {step === "new-password" && "New Password"}
          </h1>
        </div>
        <p className="text-sm text-muted">
          {step === "mobile" && mode === "password" &&
            "Login with your mobile number and password."}
          {step === "mobile" && mode === "otp" &&
            "Access your exclusive Simnani Estate portfolio."}
          {step === "otp" && (
            <>
              We&apos;ve sent a 6-digit code to{" "}
              <span className="text-gold-400">+91 {mobile}</span>
            </>
          )}
          {step === "forgot-otp" && (
            <>
              Enter the 6-digit code sent to{" "}
              <span className="text-gold-400">+91 {mobile}</span> to reset your password.
            </>
          )}
          {step === "new-password" && (
            <>
              Create a new secure password for{" "}
              <span className="text-gold-400">+91 {mobile}</span>
            </>
          )}
        </p>
      </div>

      {step === "mobile" && (
        <>
          <form
            onSubmit={mode === "password" ? handlePasswordSubmit : handleMobileSubmit}
            className="mt-8 flex flex-col gap-4"
          >
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

            {mode === "password" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="tracked-label text-xs text-cream/80">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="tracked-label text-[11px] text-gold-400 transition hover:text-gold-300"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center border border-navy-700/60 bg-navy-950 px-4 transition focus-within:border-gold-400">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    className="h-14 w-full bg-transparent px-0 pr-8 text-cream placeholder:text-muted focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 text-muted transition hover:text-gold-400"
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {error && mode === "password" && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={mode === "password" ? !mobileValid || !password || loading : !mobileValid || loading}
              className="tracked-label mt-2 flex items-center justify-center gap-2 bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mode === "password"
                ? loading ? "Logging in..." : "Login"
                : loading && !isTesterLogin ? "Sending OTP..." : "Continue with OTP"}
            </button>
          </form>

          <div className="mt-4 text-center">
            {mode === "password" ? (
              <button
                type="button"
                onClick={() => switchMode("otp")}
                className="tracked-label text-xs text-gold-400 hover:text-gold-300"
              >
                Or Login via OTP
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode("password")}
                className="tracked-label text-xs text-gold-400 hover:text-gold-300"
              >
                Or Login with Password
              </button>
            )}
          </div>

          {/* Tester Login Divider & Button */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-navy-700/60" />
            <span className="absolute bg-navy-900 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
              Or Fast Track
            </span>
          </div>

          <button
            type="button"
            onClick={handleTesterLogin}
            disabled={loading}
            className="group flex w-full items-center justify-between border border-gold-400/30 bg-gold-400/5 p-4 text-left transition hover:border-gold-400 hover:bg-gold-400/10 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold-400/30 bg-gold-400/10 text-gold-400 transition group-hover:border-gold-400 group-hover:bg-gold-400/20">
                <MdScience className="h-5 w-5" />
              </span>
              <div>
                <span className="tracked-label block text-xs font-semibold text-cream group-hover:text-gold-300">
                  {loading && isTesterLogin ? "Logging in..." : "Login as Tester"}
                </span>
                <p className="mt-0.5 text-[11px] text-muted">
                  Instant login as Common Person
                </p>
              </div>
            </div>
            <span className="rounded border border-gold-400/30 bg-gold-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-400">
              Common Person
            </span>
          </button>
        </>
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
            {loading && !isTesterLogin ? "Verifying..." : "Verify"}
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

          <div className="border-t border-navy-700/60 pt-4 text-center">
            <button
              type="button"
              onClick={handleTesterLogin}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-gold-400 disabled:opacity-50"
            >
              <MdScience className="h-3.5 w-3.5 text-gold-400" />
              <span>Or skip OTP &amp; <strong className="font-semibold text-gold-400">Login as Tester</strong></span>
            </button>
          </div>
        </div>
      )}

      {step === "forgot-otp" && (
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
            onClick={handleForgotOtpVerify}
            disabled={loading}
            className="tracked-label flex items-center justify-center gap-2 bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Verify &amp; Set New Password
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

          <div className="border-t border-navy-700/60 pt-4 text-center">
            <button
              type="button"
              onClick={handleChangeNumber}
              className="tracked-label text-xs text-muted transition hover:text-gold-400"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}

      {step === "new-password" && (
        <form onSubmit={handleNewPasswordSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="new-password" className="tracked-label text-xs text-cream/80">
                Create New Password
              </label>
              <span className="text-[11px] text-muted">Min. 8 characters</span>
            </div>
            <div className="relative flex items-center border border-navy-700/60 bg-navy-950 px-4 transition focus-within:border-gold-400">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                className="h-14 w-full bg-transparent px-0 pr-8 text-cream placeholder:text-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((s) => !s)}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                className="absolute right-3 text-muted transition hover:text-gold-400"
              >
                {showNewPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirm-password" className="tracked-label text-xs text-cream/80">
              Confirm Password
            </label>
            <div className="relative flex items-center border border-navy-700/60 bg-navy-950 px-4 transition focus-within:border-gold-400">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                className="h-14 w-full bg-transparent px-0 pr-8 text-cream placeholder:text-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3 text-muted transition hover:text-gold-400"
              >
                {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {successMessage && (
            <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
              <MdCheckCircle className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!newPassword || !confirmPassword || loading || Boolean(successMessage)}
            className="tracked-label mt-2 flex items-center justify-center gap-2 bg-gold-400 px-6 py-4 text-xs text-navy-950 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating Password..." : "Update Password & Login"}
          </button>

          <button
            type="button"
            onClick={handleChangeNumber}
            className="tracked-label mt-2 text-center text-xs text-muted hover:text-cream"
          >
            Cancel and Return to Login
          </button>
        </form>
      )}

      <footer className="mt-8 flex flex-col items-center gap-2 border-t border-navy-700/60 pt-6">
        <p className="text-xs text-muted">
          New to Simnani Estate?{" "}
          <Link href="/auth/register" className="tracked-label text-gold-400 hover:text-gold-300">
            Create Account
          </Link>
        </p>
      </footer>
    </div>
  );
}
