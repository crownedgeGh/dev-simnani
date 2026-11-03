"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdPerson, MdDomain, MdVerified, MdTrendingUp, MdBolt } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import { POST_TOUR_KEY } from "@/components/layout/PostPropertyTour";

const ROLES = [
  { value: "owner", label: "I'm an Owner", perk: "5 free listings", Icon: MdPerson },
  { value: "broker", label: "I'm a Broker", perk: "20 free listings", Icon: MdDomain },
];

const BENEFITS = [
  { Icon: MdBolt, title: "Post in minutes", text: "No photos or full address needed to start." },
  { Icon: MdTrendingUp, title: "Genuine enquiries", text: "Verified buyers & tenants reach you directly." },
  { Icon: MdVerified, title: "Zero charges", text: "Listing is completely free. No hidden fees." },
];

// Logged-in visitors skip straight to the post-property form; new visitors
// pick Owner/Broker and are sent to the matching signup, then get the tour.
export default function ListFreeLanding() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) router.replace("/post-property");
  }, [isAuthenticated, router]);

  function pick(role) {
    try {
      localStorage.setItem(POST_TOUR_KEY, "1");
    } catch {}
    router.push(`/auth/register/${role}`);
  }

  if (isLoading || isAuthenticated) return null;

  return (
    <div className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(245,180,0,0.14),_transparent_60%)]" />
      <div className="mx-auto max-w-3xl text-center">
        <span className="tracked-label text-xs text-gold-400">Sell · Rent · List Free</span>
        <h1 className="mt-4 font-display text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">
          Want to sell or rent your property?
        </h1>
        <p className="mt-4 text-base text-muted sm:text-lg">
          List it on Simnani Estate and reach genuine buyers &amp; tenants.
        </p>
        <span className="tracked-label mt-6 inline-block rounded-full bg-gold-400 px-6 py-3 text-sm text-navy-950">
          Post your property now — 100% free
        </span>

        <div className="mt-12 rounded-2xl border border-navy-700/60 bg-navy-900 p-5 sm:p-8">
          <h2 className="font-display text-2xl text-cream">Are you an Owner or a Broker?</h2>
          <p className="mt-1 text-sm text-muted">Choose one to create your free account and start listing.</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ROLES.map(({ value, label, perk, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => pick(value)}
                className="flex min-h-[44px] flex-col items-center gap-2 rounded-2xl border border-navy-700/60 bg-navy-950 p-6 transition hover:border-gold-500 active:scale-[0.98]"
              >
                <Icon className="h-9 w-9 text-gold-400" />
                <span className="tracked-label text-sm text-cream">{label}</span>
                <span className="font-display text-xl text-gold-400">{perk}</span>
              </button>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            Already have an account?{" "}
            <Link href="/auth" className="tracked-label text-gold-400 transition hover:text-gold-300">
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {BENEFITS.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-sm border border-navy-700/60 bg-navy-900 p-5">
              <Icon className="h-6 w-6 text-gold-400" />
              <p className="mt-3 font-display text-lg text-cream">{title}</p>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
