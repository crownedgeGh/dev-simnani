"use client";

import { useAuth } from "@/context/AuthContext";
import { DEMO_USER } from "@/lib/demoAccount";

export default function CommonPersonHeader() {
  const { user } = useAuth();
  const displayName = user?.fullName || DEMO_USER.name;

  return (
    <div>
      <p className="tracked-label text-xs text-gold-400">Welcome</p>
      <h1 className="mt-2 font-display text-3xl text-cream">{displayName}</h1>
      <p className="mt-2 text-sm text-muted">
        Manage the properties you&apos;ve listed and track enquiries from buyers.
      </p>
    </div>
  );
}
