"use client";

import { useState } from "react";
import Badge from "./Badge";
import SectionCard from "./SectionCard";
import { inputClass } from "@/components/auth/inputStyles";

export default function AccountProfile({ user }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email, city: user.city });
  const [saved, setSaved] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    setEditing(false);
    setSaved(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="Personal Information"
        action={
          !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="tracked-label text-xs text-gold-400 hover:text-gold-300"
            >
              Edit Profile
            </button>
          )
        }
      >
        <div className="flex items-center gap-4 border-b border-navy-700/60 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-700/60 font-display text-2xl text-gold-400">
            {form.name.charAt(0)}
          </div>
          <div>
            <p className="font-display text-lg text-cream">{form.name}</p>
            <Badge tone="gold">{user.role}</Badge>
          </div>
        </div>

        {editing ? (
          <div className="mt-6 flex flex-col gap-4">
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
            <Field label="Mobile Number">
              <div className="flex items-center justify-between border border-navy-700/60 bg-navy-950 px-4 py-4 text-sm text-muted">
                <span>+91 {user.mobile}</span>
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
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full Name">
              <p className="text-sm text-cream">{form.name}</p>
            </Field>
            <Field label="Email Address">
              <p className="text-sm text-cream">{form.email}</p>
            </Field>
            <Field label="Mobile Number">
              <p className="text-sm text-cream">+91 {user.mobile}</p>
            </Field>
            <Field label="City">
              <p className="text-sm text-cream">{form.city}</p>
            </Field>
          </div>
        )}

        {saved && <p className="mt-4 text-xs text-gold-400">Changes saved.</p>}
      </SectionCard>

      <SectionCard title="Account Status">
        <p className="text-sm text-cream">
          Verified {user.role} <span className="text-muted">· Member since {user.memberSince}</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          Full access to premium property listings and investment portfolios.
        </p>
      </SectionCard>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="tracked-label text-xs text-cream/80">{label}</label>
      {children}
    </div>
  );
}
