import Link from "next/link";
import { MdAccountBalance, MdArrowForward, MdGridView } from "react-icons/md";
import dbConnect from "@/lib/mongodb";
import Plot from "@/models/Plot";
import BackButton from "@/components/layout/BackButton";
import PlotAvailabilitySection from "@/components/project/PlotAvailabilitySection";
import TestPaymentSection from "@/components/payment/TestPaymentSection";

export const revalidate = 60; // admin plot edits show up within a minute

export const metadata = {
  title: "Others — Home Loans & Plot Availability | Simnani Estate",
  description: "Compare home loan deals and check live plot availability for RERA-registered layouts.",
};

// Public-safe fields only — buyer name/phone, token amount and notes stay
// in the admin panel.
const PUBLIC_FIELDS = "project plotNumber block lengthFt widthFt areaSqft facing isCorner ratePerSqft totalPrice status reraRegNo";

async function getPlots() {
  try {
    await dbConnect();
    const plots = await Plot.find({}, PUBLIC_FIELDS).sort({ project: 1, block: 1, seq: 1 }).lean();
    return plots.map(({ _id, ratePerSqft, totalPrice, ...p }) => ({
      ...p,
      _id: _id.toString(),
      // Only quote prices on plots that are actually for sale.
      ratePerSqft: p.status === "available" ? ratePerSqft : 0,
      totalPrice: p.status === "available" ? totalPrice : 0,
    }));
  } catch (error) {
    console.error("Others page: failed to load plots:", error);
    return [];
  }
}

const SERVICES = [
  {
    href: "/home-loan",
    icon: MdAccountBalance,
    eyebrow: "Finance",
    title: "Home Loans",
    desc: "Compare interest rates, processing fees and tenure across top banks, and check your EMI instantly.",
    cta: "Compare bank deals",
  },
  {
    href: "#plot-availability",
    icon: MdGridView,
    eyebrow: "Plot Inventory",
    title: "Plot Availability",
    desc: "See which plots are available, booked or on hold in our RERA-registered layouts — updated live.",
    cta: "View plot layout",
  },
];

export default async function OthersPage() {
  const plots = await getPlots();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="flex items-center gap-3">
        <BackButton href="/" />
        <h1 className="font-display text-3xl text-cream sm:text-4xl">Others</h1>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {SERVICES.map(({ href, icon: Icon, eyebrow, title, desc, cta }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col rounded-sm border border-navy-700/60 bg-navy-900 p-6 transition hover:border-gold-500 sm:p-8"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-sm border border-gold-500/40 bg-gold-500/10 text-gold-400">
              <Icon className="h-6 w-6" />
            </span>
            <span className="tracked-label mt-5 text-xs text-gold-400">{eyebrow}</span>
            <h2 className="mt-2 font-display text-2xl text-cream">{title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted">{desc}</p>
            <span className="tracked-label mt-6 flex items-center gap-2 text-xs text-gold-400 transition group-hover:text-gold-300">
              {cta} <MdArrowForward className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      <PlotAvailabilitySection plots={plots} />

      <section className="pt-16 sm:pt-20 lg:pt-24">
        <span className="tracked-label text-xs text-gold-400">Testing</span>
        <h2 className="mt-2 font-display text-3xl text-cream sm:text-4xl">Razorpay Test Payment</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Dev-mode checkout — enter any amount. Use Razorpay test card <span className="text-cream">4111 1111 1111 1111</span>, any future expiry, any CVV.
        </p>
        <TestPaymentSection />
      </section>
    </div>
  );
}
