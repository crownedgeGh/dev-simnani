"use client";

import { useState } from "react";
import { toast } from "sonner";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminTextareaClass } from "@/components/admin/ui/AdminFormField";

export default function VideoModerationDialog({ isOpen, onClose, video, onSave }) {
  const [note, setNote] = useState(video?.note || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...video, status: "Suggested Edit", note });
      toast.success("Suggestion saved — video marked for edit");
      onClose();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Suggest Edit"
      description={`Add feedback for "${video?.videoName || "this video"}"`}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="h-10 rounded-xl border border-[#e8e0d5] px-5 text-sm text-[#6b7280] hover:bg-[#faf8f5]">Cancel</button>
          <button onClick={handleSave} disabled={saving || !note.trim()} className="h-10 rounded-xl bg-[#f0b429] px-5 text-sm font-semibold text-white hover:bg-[#d97706] disabled:opacity-60">
            {saving ? "Saving…" : "Send Feedback"}
          </button>
        </>
      }
    >
      <AdminFormField label="Edit Suggestion" hint="This note will be visible to the CP partner">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="e.g. Trim the intro to 5 seconds and add a price overlay before posting." className={adminTextareaClass} />
      </AdminFormField>
    </AdminDialog>
  );
}
