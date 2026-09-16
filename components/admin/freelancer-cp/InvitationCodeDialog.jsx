"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  MdBusiness,
  MdCampaign,
  MdDirectionsWalk,
  MdArrowBack,
  MdContentCopy,
  MdCheckCircle,
} from "react-icons/md";
import AdminDialog from "@/components/admin/ui/AdminDialog";
import AdminFormField, { adminInputClass, adminSelectClass, adminTextareaClass } from "@/components/admin/ui/AdminFormField";
import { ADMIN_KEYS, readCollection, writeCollection } from "@/lib/adminStorage";
import { INDIAN_STATES } from "@/lib/indianStates";

const CP_TYPES = [
  {
    key: "company",
    label: "Company CP",
    prefix: "CCP",
    icon: MdBusiness,
    description: "Verifies leads and manages the wider network.",
    classes: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    key: "digital",
    label: "Digital CP",
    prefix: "DCP",
    icon: MdCampaign,
    description: "Promotes projects and generates leads online.",
    classes: "border-purple-200 bg-purple-50 text-purple-700",
  },
  {
    key: "field",
    label: "Field CP",
    prefix: "FCP",
    icon: MdDirectionsWalk,
    description: "Converts leads through on-ground site visits.",
    classes: "border-orange-200 bg-orange-50 text-orange-700",
  },
];

const EMPTY_FORM = { name: "", mobile: "", state: "", address: "" };

function buildCode(prefix, stateCode, existingCodes) {
  let code;
  do {
    const random = Math.floor(10000 + Math.random() * 90000);
    code = `${prefix}${stateCode}-${random}`;
  } while (existingCodes.includes(code));
  return code;
}

export default function InvitationCodeDialog({ isOpen, onClose }) {
  const [step, setStep] = useState("type"); // type | details | result
  const [cpType, setCpType] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setStep("type");
    setCpType(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setGeneratedCode("");
    setCopied(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const selectType = (type) => {
    setCpType(type);
    setStep("details");
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) next.mobile = "Enter a valid 10-digit mobile number";
    if (!form.state) next.state = "State is required";
    if (!form.address.trim()) next.address = "Full address is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const stateInfo = INDIAN_STATES.find((s) => s.code === form.state);
    const existing = readCollection(ADMIN_KEYS.invitationCodes) || [];
    const code = buildCode(cpType.prefix, stateInfo.code, existing.map((c) => c.code));

    const record = {
      code,
      cpType: cpType.key,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      state: stateInfo.name,
      address: form.address.trim(),
      createdAt: new Date().toISOString(),
    };
    writeCollection(ADMIN_KEYS.invitationCodes, [record, ...existing]);

    setGeneratedCode(code);
    setStep("result");
    toast.success("Invitation code generated");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — please copy manually");
    }
  };

  const titles = {
    type: "Generate Invitation Code",
    details: `${cpType?.label || ""} — Partner Details`,
    result: "Invitation Code Ready",
  };
  const descriptions = {
    type: "Choose which type of channel partner this invitation is for",
    details: "Enter the partner's contact and address details",
    result: "Share this code with the partner to complete their registration",
  };

  return (
    <AdminDialog isOpen={isOpen} onClose={handleClose} title={titles[step]} description={descriptions[step]} size="sm">
      {step === "type" && (
        <div className="flex flex-col gap-3">
          {CP_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => selectType(t)}
                className={`flex min-h-[44px] items-center gap-3 rounded-2xl border p-4 text-left transition hover:shadow-md ${t.classes}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold">{t.label}</p>
                  <p className="mt-0.5 text-xs opacity-80">{t.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {step === "details" && (
        <form id="invitation-code-form" onSubmit={handleGenerate} className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setStep("type")}
            className="flex min-h-[44px] w-fit items-center gap-1.5 text-xs font-medium text-[#9ca3af] transition hover:text-[#d97706]"
          >
            <MdArrowBack size={14} /> Change CP type
          </button>

          <AdminFormField label="Full Name" id="inv-name" required error={errors.name}>
            <input
              id="inv-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Rohan Deshpande"
              className={adminInputClass}
            />
          </AdminFormField>

          <AdminFormField label="Mobile Number" id="inv-mobile" required error={errors.mobile}>
            <input
              id="inv-mobile"
              value={form.mobile}
              onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="98765 43210"
              inputMode="numeric"
              className={adminInputClass}
            />
          </AdminFormField>

          <AdminFormField label="State" id="inv-state" required error={errors.state} hint="Used to build the invitation code">
            <select id="inv-state" value={form.state} onChange={(e) => set("state", e.target.value)} className={adminSelectClass}>
              <option value="">Select state…</option>
              {INDIAN_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </AdminFormField>

          <AdminFormField label="Full Address" id="inv-address" required error={errors.address}>
            <textarea
              id="inv-address"
              rows={3}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="House / street, area, city, PIN code"
              className={adminTextareaClass}
            />
          </AdminFormField>

          <button
            type="submit"
            className="mt-1 flex h-11 min-h-[44px] w-full items-center justify-center rounded-xl bg-[#f0b429] px-5 text-sm font-semibold text-white transition hover:bg-[#d97706]"
          >
            Generate Code
          </button>
        </form>
      )}

      {step === "result" && (
        <div className="flex flex-col gap-4">
          <div className={`flex flex-col items-center gap-2 rounded-2xl border p-6 text-center ${cpType?.classes}`}>
            <MdCheckCircle size={28} />
            <p className="break-all font-mono text-xl font-bold sm:text-2xl">{generatedCode}</p>
            <p className="text-xs opacity-80">{cpType?.label} • {form.name} • {INDIAN_STATES.find((s) => s.code === form.state)?.name}</p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[#e8e0d5] text-sm font-semibold text-[#374151] transition hover:bg-[#faf8f5]"
          >
            <MdContentCopy size={16} /> {copied ? "Copied!" : "Copy Code"}
          </button>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="flex h-11 min-h-[44px] flex-1 items-center justify-center rounded-xl border border-[#e8e0d5] px-5 text-sm text-[#6b7280] transition hover:bg-[#faf8f5]"
            >
              Generate Another
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-11 min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[#f0b429] px-5 text-sm font-semibold text-white transition hover:bg-[#d97706]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </AdminDialog>
  );
}
