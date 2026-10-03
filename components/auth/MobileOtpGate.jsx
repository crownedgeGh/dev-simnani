"use client";

import { useEffect, useRef, useState } from "react";
import { MdCheckCircle } from "react-icons/md";

const OTP_LENGTH = parseInt(process.env.NEXT_PUBLIC_OTP_LENGTH || "4", 10);

// Gates the rest of a registration form behind mobile OTP verification.
// Once an OTP has been sent, back/refresh is blocked so a half-verified
// number can't be abandoned and silently re-entered.
export default function MobileOtpGate({ mobile, mobileValid, verified, onVerified }) {
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);
  const verifiedMobileRef = useRef("");

  useEffect(() => () => clearInterval(timerRef.current), []);

  // If the user edits the mobile number after verifying, the verification
  // no longer proves ownership of the new number — reset it.
  useEffect(() => {
    if (verified && mobile !== verifiedMobileRef.current) {
      onVerified(false);
      setSent(false);
      setOtp(Array(OTP_LENGTH).fill(""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile]);

  useEffect(() => {
    if (!sent || verified) return;
    window.history.pushState(null, "", window.location.href);
    const blockBack = () => window.history.pushState(null, "", window.location.href);
    const warnUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("popstate", blockBack);
    window.addEventListener("beforeunload", warnUnload);
    return () => {
      window.removeEventListener("popstate", blockBack);
      window.removeEventListener("beforeunload", warnUnload);
    };
  }, [sent, verified]);

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

  async function sendCode() {
    if (!mobileValid || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, purpose: "register" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send OTP");
      setSent(true);
      setOtp(Array(OTP_LENGTH).fill(""));
      startResendTimer();
      requestAnimationFrame(() => otpRefs.current[0]?.focus());
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index, rawValue) {
    const value = rawValue.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setError("");
    if (value && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index, event) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function verifyCode() {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp: code, purpose: "register" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Incorrect OTP");
      verifiedMobileRef.current = mobile;
      clearInterval(timerRef.current);
      onVerified(true);
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (verified) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400">
        <MdCheckCircle className="h-4 w-4 shrink-0" />
        Mobile number verified
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-navy-700/60 bg-navy-950 p-4">
      {!sent ? (
        <>
          <p className="text-xs text-muted">Verify your mobile number to continue.</p>
          <button
            type="button"
            onClick={sendCode}
            disabled={!mobileValid || loading}
            className="tracked-label rounded-full bg-gold-400 px-4 py-3 text-xs text-navy-950 transition hover:bg-gold-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </>
      ) : (
        <>
          <p className="tracked-label text-xs text-cream/80">
            Enter the code sent to +91 {mobile}
          </p>
          <div className="flex items-center gap-2">
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
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="h-12 w-11 rounded-full border border-navy-700/60 bg-navy-900 text-center text-cream outline-none transition focus:border-gold-400 focus:ring-4 focus:ring-gold-400/10"
              />
            ))}
            <button
              type="button"
              onClick={verifyCode}
              disabled={loading}
              className="tracked-label ml-2 rounded-full bg-gold-400 px-4 py-3 text-xs text-navy-950 transition hover:bg-gold-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
          <div className="text-xs text-muted">
            {resendIn > 0 ? (
              <span>Resend OTP in 0:{String(resendIn).padStart(2, "0")}</span>
            ) : (
              <button type="button" onClick={sendCode} className="text-gold-400 hover:text-gold-300">
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
