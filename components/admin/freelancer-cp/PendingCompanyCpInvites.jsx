"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MdSend, MdContentCopy } from "react-icons/md";
import AdminTable from "@/components/admin/ui/AdminTable";

function generateInviteCode() {
  const letters = Array.from({ length: 4 }, () =>
    "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]
  ).join("");
  const digits = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join("");
  return `${letters}${digits}`;
}

// Head CP's queue of Company CPs who registered themselves and are stuck
// behind the locked-portal screen until an invitation code is generated
// and sent to their specific account (Tasks 1 & 3).
export default function PendingCompanyCpInvites() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);
  const [sentCodes, setSentCodes] = useState({});

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cp-network?cpType=company");
      const json = await res.json();
      setPending(json.success ? json.data.filter((cp) => cp.cpPortalLocked) : []);
    } catch {
      toast.error("Failed to load pending Company CP registrations");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) load();
    });
    return () => { active = false; };
  }, [load]);

  async function handleSend(row) {
    setSending(row.accountId);
    try {
      const code = generateInviteCode();
      const res = await fetch("/api/invitation-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          cpType: "company",
          targetAccountId: row.accountId,
          name: row.name,
          mobile: row.phone,
          city: row.city,
          state: row.state,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to generate code");
      setSentCodes((prev) => ({ ...prev, [row.accountId]: json.data.code }));
      toast.success(`Invitation code sent to ${row.name}`);
    } catch (err) {
      toast.error(err.message || "Failed to send invitation code");
    } finally {
      setSending(null);
    }
  }

  async function handleCopy(code) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied");
    } catch {
      toast.error("Couldn't copy — please copy manually");
    }
  }

  const COLUMNS = [
    { key: "name", label: "Name", primary: true, sortable: true },
    { key: "phone", label: "Phone" },
    { key: "city", label: "City", render: (v) => <span className="text-sm text-[#374151]">{v || "—"}</span> },
    {
      key: "actions",
      label: "",
      searchable: false,
      render: (_, row) => {
        const sentCode = sentCodes[row.accountId];
        return (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {sentCode ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-[#e8e0d5] bg-white px-2.5 py-1.5">
                <span className="font-mono text-xs font-semibold text-[#d97706]">{sentCode}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(sentCode)}
                  className="flex h-6 w-6 items-center justify-center rounded text-[#9ca3af] transition hover:text-[#d97706]"
                  aria-label="Copy code"
                >
                  <MdContentCopy size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleSend(row)}
                disabled={sending === row.accountId}
                className="flex h-8 items-center gap-1 rounded-lg bg-[#f0b429] px-2.5 text-xs font-medium text-white transition hover:bg-[#d97706] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MdSend size={13} />
                {sending === row.accountId ? "Sending…" : "Generate & Send Code"}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  if (!loading && pending.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="mb-3 text-sm font-semibold text-[#1a1a2e]">Company CPs Awaiting Invitation Code</h3>
      <p className="mb-3 text-xs text-[#9ca3af]">
        These partners registered themselves and their portal stays locked until you generate and send them a code.
      </p>
      <AdminTable columns={COLUMNS} data={pending} loading={loading} emptyMessage="No pending registrations" pageSize={10} />
    </div>
  );
}
