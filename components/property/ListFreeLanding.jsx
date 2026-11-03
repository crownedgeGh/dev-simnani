"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdPerson, MdDomain, MdVerified, MdTrendingUp, MdBolt } from "react-icons/md";
import { useAuth } from "@/context/AuthContext";
import { POST_TOUR_KEY } from "@/components/layout/PostPropertyTour";

const ROLES = [
  { value: "owner", label: "I'm an Owner", perk: null, Icon: MdPerson },
  { value: "broker", label: "I'm a Broker", perk: "20 free listings", Icon: MdDomain },
];

const BENEFITS = [
  { Icon: MdBolt, title: "Post in minutes", text: "Add photos and address once, and your listing goes live fast." },
  { Icon: MdTrendingUp, title: "Genuine enquiries", text: "Verified buyers & tenants reach you directly." },
  { Icon: MdVerified, title: "Zero charges", text: "Listing is completely free. No hidden fees." },
];

// Logged-in visitors skip straight to the post-property form; new visitors
// pick Owner/Broker and are sent to the matching signup, then get the tour.
export default function ListFreeLanding() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) router.replace("/post-property");
  }, [isAuthenticated, router]);

  function pick(role) {
    try {
      localStorage.setItem(POST_TOUR_KEY, "1");
    } catch {}
    router.push(`/auth/register/${role}`);
  }

  // Render for guests while auth resolves — no blank flash; only hide for signed-in users being redirected.
  if (isAuthenticated) return null;

  return (
    <div className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(245,180,0,0.14),_transparent_60%)]" />
      <div className="mx-auto max-w-3xl text-center">
        <span className="tracked-label text-xs text-gold-400">Sell · Rent · List Free</span>
        <h1 className="mt-3 font-display text-3xl leading-tight text-cream sm:mt-4 sm:text-5xl lg:text-6xl">
          Want to sell or rent your property?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted sm:mt-4 sm:text-lg">
          List it on Simnani Estate and reach genuine buyers &amp; tenants.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-cream sm:mt-6 sm:text-base">
          <MdVerified className="h-5 w-5 text-gold-400" />
          Listing is <span className="font-semibold text-gold-400">100% free</span>
        </p>

        <div className="mt-8 rounded-2xl border border-navy-700/60 bg-navy-900 p-4 sm:mt-12 sm:p-8">
          <h2 className="font-display text-xl text-cream sm:text-2xl">Are you an Owner or a Broker?</h2>
          <p className="mt-1 text-sm text-muted">Choose one to create your free account.</p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
            {ROLES.map(({ value, label, perk, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => pick(value)}
                className="tracked-label flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-full bg-gold-400 px-6 py-3 text-sm text-navy-950 shadow-lg shadow-gold-400/10 transition hover:bg-gold-300 active:scale-[0.98]"
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {label}
                </span>
                {perk && <span className="text-[11px] font-semibold normal-case tracking-normal">{perk}</span>}
              </button>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted">
            Already have an account?{" "}
            <Link href="/auth" className="tracked-label text-gold-400 transition hover:text-gold-300">
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 text-left sm:mt-10 sm:grid-cols-3 sm:gap-4">
          {BENEFITS.map(({ Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3 rounded-sm border border-navy-700/60 bg-navy-900 p-4 sm:block sm:p-5">
              <Icon className="h-6 w-6 shrink-0 text-gold-400" />
              <div>
                <p className="font-display text-base text-cream sm:mt-3 sm:text-lg">{title}</p>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
