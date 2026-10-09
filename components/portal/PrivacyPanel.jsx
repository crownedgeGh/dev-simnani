"use client";

import { useState } from "react";
import Link from "next/link";
import Switch from "./Switch";
import SectionCard from "./SectionCard";
import DeleteAccountModal from "./DeleteAccountModal";

const DATA_TOGGLES = [
  { key: "personalization", label: "Personalization", description: "Tailor recommendations to your activity.", defaultOn: true },
  { key: "marketing", label: "Marketing Communications", description: "Offers, newsletters and updates.", defaultOn: true },
  { key: "broker", label: "Broker Collaboration", description: "Share your enquiries with matched brokers.", defaultOn: false },
];

const PERMISSIONS = [
  { title: "Location Services", desc: "Used to suggest nearby properties." },
  { title: "Financial Verification Docs", desc: "Shared only with verified advisors." },
  { title: "Linked Devices", desc: "3 devices currently authorized." },
];

export default function PrivacyPanel() {
  const [toggles, setToggles] = useState(
    Object.fromEntries(DATA_TOGGLES.map((t) => [t.key, t.defaultOn]))
  );
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="Data Usage">
        <div className="flex flex-col gap-3">
          {DATA_TOGGLES.map((item) => (
            <div key={item.key} className="flex items-center justify-between border-b border-navy-700/60 py-3 last:border-b-0">
              <div>
                <p className="text-sm text-cream">{item.label}</p>
                <p className="mt-1 text-xs text-muted">{item.description}</p>
              </div>
              <Switch
                checked={toggles[item.key]}
                onChange={(value) => setToggles((prev) => ({ ...prev, [item.key]: value }))}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Account Permissions">
        <div className="flex flex-col gap-3">
          {PERMISSIONS.map((perm) => (
            <div key={perm.title} className="flex items-center justify-between border-b border-navy-700/60 py-3 last:border-b-0">
              <div>
                <p className="text-sm text-cream">{perm.title}</p>
                <p className="mt-1 text-xs text-muted">{perm.desc}</p>
              </div>
              <span className="tracked-label text-xs text-gold-400">Manage</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Session">
        {loggedOut ? (
          <p className="text-sm text-gold-400">You have been logged out.</p>
        ) : confirmingLogout ? (
          <div>
            <p className="text-sm text-cream">Are you sure you want to logout?</p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingLogout(false)}
                className="tracked-label rounded-full border border-navy-700/60 px-5 py-3 text-xs text-cream transition hover:border-gold-400 active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setLoggedOut(true)}
                className="tracked-label rounded-full bg-gold-400 px-5 py-3 text-xs text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98]"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingLogout(true)}
            className="tracked-label rounded-full border border-navy-700/60 px-5 py-3 text-xs text-cream transition hover:border-gold-400 active:scale-[0.98]"
          >
            Logout
          </button>
        )}
      </SectionCard>

      <div className="border border-red-500/40 bg-navy-900 p-6">
        <h2 className="tracked-label text-xs text-red-400">Danger Zone</h2>
        <div className="mt-3">
          <p className="text-sm text-muted">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="tracked-label rounded-full border border-red-500 px-5 py-3 text-xs text-red-400 transition hover:bg-red-500 hover:text-navy-950 active:scale-[0.98]"
            >
              Delete Account
            </button>
            <Link href="/help" className="tracked-label text-xs text-muted hover:text-gold-400">
              Need assistance? Contact Concierge
            </Link>
          </div>
        </div>
      </div>

      <DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
    </div>
  );
}
