"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdHourglassTop, MdContentCopy, MdRefresh } from "react-icons/md";
import { inputClass } from "@/components/auth/inputStyles";

// Shown instead of the Company CP dashboard while cpPortalLocked is true
// (Task 2). Head CP generates and sends a code targeted at this account
// (Task 3) — once it exists it's fetched here and shown with a copy
// button, but the partner still has to paste it into the field below and
// submit before the portal actually unlocks.
export default function CpInviteLockScreen() {
  const router = useRouter();
  const [sentCode, setSentCode] = useState(null);
  const [loadingCode, setLoadingCode] = useState(true);
  const [refreshingCode, setRefreshingCode] = useState(false);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function fetchCode() {
    const res = await fetch("/api/invitation-codes/mine");
    const json = await res.json();
    if (json.success) setSentCode(json.data);
    return json;
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await fetchCode();
      } finally {
        if (active) setLoadingCode(false);
      }
    })();
    return () => { active = false; };
  }, []);

  async function handleRefreshCode() {
    setRefreshingCode(true);
    try {
      const json = await fetchCode();
      if (json.success && json.data) toast.success("Invitation code found");
      else toast("No invitation code sent yet", { description: "Check back once Head CP sends one." });
    } catch {
      toast.error("Couldn't check for a code right now");
    } finally {
      setRefreshingCode(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(sentCode.code);
      toast.success("Invitation code copied");
    } catch {
      toast.error("Couldn't copy — please copy manually");
    }
  }

  async function handleRedeem(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/invitation-codes/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: input.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Invalid invitation code");
      toast.success("Portal unlocked");
      router.refresh();
    } catch (err) {
      setError(err.message || "Invalid invitation code");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-navy-700/60 bg-navy-900 p-8 text-center shadow-2xl sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/10 text-gold-400">
          <MdHourglassTop className="h-8 w-8" />
        </span>
        <h2 className="mt-6 font-display text-2xl text-cream">Your Profile is Under Review</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Your Company CP portal stays locked until Head CP sends you an invitation code. Paste it below to unlock your dashboard.
        </p>

        {!loadingCode && sentCode && (
          <div className="mt-6 flex items-center justify-between gap-2 rounded-2xl border border-gold-400/30 bg-gold-400/10 px-4 py-3">
            <span className="font-mono text-lg tracking-widest text-gold-400">{sentCode.code}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gold-400 transition hover:bg-gold-400/10"
              aria-label="Copy invitation code"
            >
              <MdContentCopy className="h-4 w-4" />
            </button>
          </div>
        )}

        {!loadingCode && !sentCode && (
          <p className="mt-6 text-xs text-muted">No invitation code sent yet.</p>
        )}

        <button
          type="button"
          onClick={handleRefreshCode}
          disabled={refreshingCode}
          className="tracked-label mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-gold-500/70 bg-gold-400/10 px-5 text-xs text-gold-400 transition hover:bg-gold-400/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <MdRefresh className={`h-4 w-4 ${refreshingCode ? "animate-spin" : ""}`} />
          {refreshingCode ? "Checking..." : "Check for Code"}
        </button>

        <form onSubmit={handleRedeem} className="mt-6 flex flex-col gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste invitation code"
            className={`${inputClass} text-center tracking-widest`}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="tracked-label inline-flex h-12 w-full items-center justify-center rounded-full bg-gold-400 px-6 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Verifying..." : "Unlock Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}
