"use client";

import { useState } from "react";
import { MdReportProblem } from "react-icons/md";
import AdminDialog from "@/components/admin/ui/AdminDialog";

const QUICK_REASONS = [
  "Uploaded images appear to be AI-generated — please upload real photos of the property",
  "Photos are blurry or low quality — please upload clearer images",
  "Price looks incorrect — please verify and update",
  "Description is incomplete or unclear",
  "Contact details are missing or invalid",
  "Address / location details are unclear",
  "This listing appears to be a duplicate",
  "Property title needs to be more descriptive",
];

export default function CorrectionRequestDialog({ isOpen, onClose, property, onSubmit }) {
  const [reasons, setReasons] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleReason(reason) {
    setReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  }

  function handleClose() {
    if (submitting) return;
    setReasons([]);
    setMessage("");
    onClose();
  }

  async function handleSubmit() {
    const trimmedMessage = message.trim();
    if (reasons.length === 0 && !trimmedMessage) return;
    setSubmitting(true);
    try {
      await onSubmit({ reasons, message: trimmedMessage });
      setReasons([]);
      setMessage("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = reasons.length > 0 || message.trim().length > 0;

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Request Correction"
      description={property ? `Tell "${property.title}" what needs to be fixed before it can go live.` : undefined}
      size="lg"
      footer={
        <>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="h-9 rounded-xl border border-[#e8e0d5] px-4 text-sm text-[#6b7280] transition hover:bg-[#faf8f5] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-[#f0b429] px-4 text-sm font-medium text-white transition hover:bg-[#d97706] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdReportProblem size={16} />
            {submitting ? "Sending…" : "Put Listing On Hold"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm font-semibold text-[#1a1a2e]">Common issues</p>
          <p className="mt-0.5 text-xs text-[#9ca3af]">
            Select everything that applies. These will be shown to the user on their listing.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {QUICK_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-sm transition ${
                  reasons.includes(reason)
                    ? "border-[#f0b429] bg-[#fff8e1] text-[#1a1a2e]"
                    : "border-[#e8e0d5] text-[#374151] hover:border-[#f0b429]/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={reasons.includes(reason)}
                  onChange={() => toggleReason(reason)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#f0b429]"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="correction-message" className="text-sm font-semibold text-[#1a1a2e]">
            Additional instructions <span className="font-normal text-[#9ca3af]">(optional)</span>
          </label>
          <textarea
            id="correction-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Add any other details the user should know…"
            className="mt-2 w-full rounded-xl border border-[#e8e0d5] bg-white p-3 text-sm text-[#1a1a2e] outline-none transition placeholder:text-[#9ca3af] focus:border-[#f0b429]"
          />
        </div>

        <p className="text-xs text-[#9ca3af]">
          The listing will be marked <span className="font-medium text-[#d97706]">On Hold</span> and the
          user will see this message on their listing until you clear it.
        </p>
      </div>
    </AdminDialog>
  );
}
