"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiEdit3, FiAlertCircle, FiZap, FiArrowUpCircle } from "react-icons/fi";
import { MdStar, MdWorkspacePremium } from "react-icons/md";
import Badge from "./Badge";
import SectionCard from "./SectionCard";
import { inputClass } from "@/components/auth/inputStyles";
import { useAuth } from "@/context/AuthContext";

const PLAN_META = {
  free: { name: "Free", icon: FiZap },
  standard: { name: "Standard", icon: MdStar },
  premium: { name: "Premium", icon: MdWorkspacePremium },
};

const PLAN_STATUS_TONE = {
  active: { tone: "success", label: "Active" },
  pending: { tone: "gold", label: "Pending Approval" },
  hold: { tone: "muted", label: "On Hold" },
  rejected: { tone: "error", label: "Rejected" },
};

export default function AccountProfile({ user }) {
  const { user: authUser, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: authUser?.fullName || user.name,
    email: authUser?.email || user.email,
    city: authUser?.city || user.city,
    dealsClosed: authUser?.dealsClosed ?? 0,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (authUser) {
      setForm({
        name: authUser.fullName || user.name,
        email: authUser.email || user.email,
        city: authUser.city || user.city,
        dealsClosed: authUser.dealsClosed ?? 0,
      });
    }
  }, [authUser, user]);

  const displayRole = authUser?.accountType === "common-person"
    ? "Common Person"
    : (authUser?.accountType || user.role);

  const displayMobile = authUser?.mobile || user.mobile;
  const memberSince = authUser?.registeredAt
    ? new Date(authUser.registeredAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : (user.memberSince || "Recently");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    setEditing(false);
    setSaved(true);
    if (updateProfile) {
      const patch = {
        fullName: form.name,
        email: form.email,
        city: form.city,
      };
      if (authUser?.accountType === "broker") {
        patch.dealsClosed = form.dealsClosed !== "" ? Math.max(0, parseInt(form.dealsClosed, 10) || 0) : 0;
      }
      updateProfile(patch);
    }
  }

  const isProfileIncomplete = authUser?.profileComplete === false;

  return (
    <div className="flex flex-col gap-5">
      {isProfileIncomplete && (
        <div className="flex flex-col items-start gap-3 border border-gold-500/40 bg-gold-400/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold-400" />
            <p className="text-sm text-cream">
              Your profile is incomplete. Please complete your profile to unlock full access.
            </p>
          </div>
          <Link
            href={`/auth/register/${authUser.accountType}?step=${authUser.registrationStep || 1}`}
            className="tracked-label shrink-0 border border-gold-500/70 px-4 py-3 text-xs text-gold-400 transition hover:bg-gold-500/10"
          >
            Complete Your Profile
          </Link>
        </div>
      )}

      <SectionCard>
        <div className="flex items-center gap-4 border-b border-navy-700/60 pb-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-700/60 font-display text-2xl text-gold-400">
            {form.name ? form.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex-1">
            <p className="font-display text-lg text-cream">{form.name}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="gold">{displayRole}</Badge>
              {authUser?.accountType === "broker" && <PlanBadge user={authUser} />}
              {authUser?.accountType === "broker" && authUser?.plan !== "premium" && (
                <Link
                  href="/pricing"
                  className="tracked-label ml-1 flex items-center gap-1.5 bg-gold-400 px-3 py-1.5 text-[11px] text-navy-950 transition hover:bg-gold-300"
                >
                  <FiArrowUpCircle className="h-3.5 w-3.5" />
                  Upgrade Plan
                </Link>
              )}
            </div>
          </div>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Edit Profile"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-navy-700/60 text-gold-400 transition hover:border-gold-400 hover:bg-gold-400/10"
            >
              <FiEdit3 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {editing ? (
          <div className="mt-5 flex flex-col gap-4">
            <Field label="Full Name">
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Email Address">
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="City">
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className={inputClass}
              />
            </Field>
            {authUser?.accountType === "broker" && (
              <Field label="Deals Closed">
                <input
                  type="number"
                  min="0"
                  value={form.dealsClosed ?? ""}
                  onChange={(e) => update("dealsClosed", e.target.value)}
                  className={inputClass}
                />
              </Field>
            )}
            <Field label="Mobile Number">
              <div className="flex items-center justify-between border border-navy-700/60 bg-navy-950 px-4 py-4 text-sm text-muted">
                <span>+91 {displayMobile}</span>
                <Badge tone="success">Verified</Badge>
              </div>
            </Field>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="tracked-label border border-navy-700/60 px-6 py-3 text-xs text-cream transition hover:border-gold-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="tracked-label bg-gold-400 px-6 py-3 text-xs text-navy-950 transition hover:bg-gold-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <Field label="Full Name">
              <p className="text-[15px] font-medium text-cream">{form.name}</p>
            </Field>
            <Field label="Email Address">
              <p className="text-[15px] font-medium text-cream">{form.email}</p>
            </Field>
            <Field label="Mobile Number">
              <p className="text-[15px] font-medium text-cream">+91 {displayMobile}</p>
            </Field>
            <Field label="City">
              <p className="text-[15px] font-medium text-cream">{form.city}</p>
            </Field>
            {authUser?.accountType === "broker" && (
              <Field label="Deals Closed">
                <p className="text-[15px] font-medium text-cream">{authUser?.dealsClosed ?? form.dealsClosed ?? 0}</p>
              </Field>
            )}
          </div>
        )}

        {saved && <p className="mt-4 text-xs text-gold-400">Changes saved.</p>}
      </SectionCard>

      <SectionCard title="Account Status">
        <p className="text-sm text-cream">
          Verified {displayRole} <span className="text-muted">· Member since {memberSince}</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          Full access to premium property listings and investment portfolios.
        </p>
      </SectionCard>
    </div>
  );
}

// Membership plan is a Broker-only feature (see /pricing) — shown as a
// small badge right next to the account-type badge, e.g. "STANDARD MEMBER".
function PlanBadge({ user }) {
  const planMeta = PLAN_META[user?.plan] || PLAN_META.free;
  const PlanIcon = planMeta.icon;
  const statusMeta = PLAN_STATUS_TONE[user?.planStatus] || PLAN_STATUS_TONE.active;

  return (
    <Badge tone={statusMeta.tone}>
      <PlanIcon className="h-3 w-3" />
      {planMeta.name} Member
      {user?.planStatus !== "active" && ` · ${statusMeta.label}`}
    </Badge>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="tracked-label text-[11px] text-gold-400">{label}</label>
      {children}
    </div>
  );
}
