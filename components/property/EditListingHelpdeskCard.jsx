"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MdSupportAgent } from "react-icons/md";
import { textareaClass } from "@/components/auth/inputStyles";

// Locked listing fields (e.g. address, property ID) can't be self-edited —
// genuine change requests go to customer care instead, with full account +
// listing context attached automatically so support doesn't have to ask for it.
// Rendered inside the Property Identity Section, which is itself inside the
// page's <form> — this stays a plain div (not a nested <form>) to avoid an
// invalid <form> inside <form> and submits via a plain button click instead.
export default function EditListingHelpdeskCard({ propertyId }) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSend() {
    if (!message.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/helpdesk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, message }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to send request");
      toast.success("Sent to our customer care team. They'll reach out shortly.");
      setMessage("");
      setSent(true);
    } catch (err) {
      toast.error(err.message || "Failed to send request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="col-span-1 border border-navy-700/60 bg-navy-900 p-5 sm:col-span-2">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-400/10 text-gold-400">
          <MdSupportAgent className="h-5 w-5" />
        </span>
        <div>
          <p className="tracked-label text-xs text-gold-400">Need To Change Something In This Section?</p>
          <p className="mt-0.5 text-sm text-muted">
            These details can&apos;t be self-edited once approved. If you genuinely need a change,
            contact our customer care team below and we&apos;ll take care of it.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <textarea
          className={textareaClass}
          rows={3}
          placeholder="Describe the change you need and why..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="button"
          disabled={busy || !message.trim()}
          onClick={handleSend}
          className="tracked-label flex min-h-11 items-center justify-center gap-1.5 self-start rounded-full bg-gold-400 px-5 text-xs text-navy-950 transition hover:bg-gold-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Sending..." : "Message Customer Care"}
        </button>
        {sent && (
          <p className="text-xs text-muted">
            Request sent — our team will contact you once it&apos;s reviewed.
          </p>
        )}
      </div>
    </div>
  );
}
