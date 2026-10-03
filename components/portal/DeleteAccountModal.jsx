"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiX } from "react-icons/fi";
import { inputClass } from "@/components/auth/inputStyles";
import { useAuth } from "@/context/AuthContext";

export default function DeleteAccountModal({ isOpen, onClose }) {
  const { logout } = useAuth();
  const router = useRouter();
  const [method, setMethod] = useState("otp");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function reset() {
    setMethod("otp");
    setOtpSent(false);
    setCode("");
    setError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSendOtp() {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/account/send-delete-otp", { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send OTP");
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleConfirmDelete() {
    setSubmitting(true);
    setError("");
    try {
      const body = method === "otp" ? { method, otp: code } : { method, password: code };
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

  const canSubmit = method === "password" ? code.length > 0 : otpSent && code.length > 0;

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
          This permanently deactivates your account. Confirm your identity to continue.
        </p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => { setMethod("otp"); setCode(""); setError(""); }}
            className={`tracked-label flex-1 border px-3 py-2 text-xs transition ${
              method === "otp" ? "border-gold-400 text-gold-400" : "border-navy-700/60 text-muted hover:border-navy-600"
            }`}
          >
            Verify with OTP
          </button>
          <button
            type="button"
            onClick={() => { setMethod("password"); setCode(""); setError(""); }}
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
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter OTP"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className={inputClass}
                autoFocus
              />
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
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
