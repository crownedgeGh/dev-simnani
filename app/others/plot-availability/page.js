import dbConnect from "@/lib/mongodb";
import Plot from "@/models/Plot";
import BackButton from "@/components/layout/BackButton";
import PlotAvailabilitySection from "@/components/project/PlotAvailabilitySection";

export const revalidate = 60; // admin plot edits show up within a minute

export const metadata = {
  title: "Plot Availability | Simnani Estate",
  description: "Check live plot availability for RERA-registered layouts.",
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
    console.error("Plot availability page: failed to load plots:", error);
    return [];
  }
}

export default async function PlotAvailabilityPage() {
  const plots = await getPlots();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-10 lg:pb-24">
      <div className="flex items-center gap-3">
        <BackButton href="/others" />
        <h1 className="font-display text-3xl text-cream sm:text-4xl">Plot Availability</h1>
      </div>

      <PlotAvailabilitySection plots={plots} />
    </div>
  );
}
