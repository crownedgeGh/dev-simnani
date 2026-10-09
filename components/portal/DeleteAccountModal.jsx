"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";
import { inputClass } from "@/components/auth/inputStyles";
import { useAuth } from "@/context/AuthContext";

// Must match OTP_LENGTH in lib/otp.js — see components/auth/AuthCard.jsx.
const OTP_LENGTH = parseInt(process.env.NEXT_PUBLIC_OTP_LENGTH || "4", 10);

export default function DeleteAccountModal({ isOpen, onClose }) {
  const { logout } = useAuth();
  const router = useRouter();
  const [method, setMethod] = useState("otp");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  if (!isOpen) return null;

  function reset() {
    setMethod("otp");
    setOtpSent(false);
    setOtp(Array(OTP_LENGTH).fill(""));
    setPassword("");
    setError("");
    clearInterval(timerRef.current);
    setResendIn(0);
  }

  function handleClose() {
    reset();
    onClose();
  }

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

  async function handleSendOtp() {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/account/send-delete-otp", { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send OTP");
      setOtp(Array(OTP_LENGTH).fill(""));
      setOtpSent(true);
      startResendTimer();
      requestAnimationFrame(() => otpRefs.current[0]?.focus());
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
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

  function handleOtpPaste(event) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    [...pasted].forEach((char, i) => {
      next[i] = char;
    });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  async function handleConfirmDelete() {
    setSubmitting(true);
    setError("");
    try {
      const body = method === "otp" ? { method, otp: otp.join("") } : { method, password };
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete account");
      await logout();
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    method === "password" ? password.length > 0 : otpSent && otp.every((d) => d.length === 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm border border-navy-700/60 bg-navy-900 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-cream">Delete Account</h3>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center text-muted transition hover:text-cream"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-muted">
          This permanently deletes your account. Confirm your identity to continue.
        </p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => { setMethod("otp"); setError(""); }}
            className={`tracked-label flex-1 border px-3 py-2 text-xs transition ${
              method === "otp" ? "border-gold-400 text-gold-400" : "border-navy-700/60 text-muted hover:border-navy-600"
            }`}
          >
            Verify with OTP
          </button>
          <button
            type="button"
            onClick={() => { setMethod("password"); setError(""); }}
            className={`tracked-label flex-1 border px-3 py-2 text-xs transition ${
              method === "password" ? "border-gold-400 text-gold-400" : "border-navy-700/60 text-muted hover:border-navy-600"
            }`}
          >
            Verify with Password
          </button>
        </div>

        <div className="mt-4">
          {method === "otp" ? (
            otpSent ? (
              <div className="flex flex-col gap-3">
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
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className={`h-14 w-12 rounded-full border bg-navy-950 text-center text-lg text-cream outline-none transition focus:border-gold-400 focus:ring-4 focus:ring-gold-400/10 ${
                        error ? "border-red-500" : "border-navy-700/60"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-center text-xs text-muted">
                  {resendIn > 0 ? (
                    <span>Resend OTP in 0:{String(resendIn).padStart(2, "0")}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sending}
                      className="tracked-label text-gold-400 hover:text-gold-300 disabled:opacity-50"
                    >
                      {sending ? "Sending…" : "Resend OTP"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sending}
                className="tracked-label w-full border border-gold-500/70 px-4 py-3 text-xs text-gold-400 transition hover:bg-gold-500/10 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send OTP"}
              </button>
            )
          ) : (
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoFocus
            />
          )}
        </div>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="tracked-label flex-1 border border-navy-700/60 px-4 py-3 text-xs text-cream transition hover:border-gold-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={!canSubmit || submitting}
            className="tracked-label flex-1 bg-red-500 px-4 py-3 text-xs text-cream transition hover:bg-red-600 disabled:opacity-50"
          >
            {submitting ? "Deleting…" : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
