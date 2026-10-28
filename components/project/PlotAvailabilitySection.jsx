import PlotLayoutViewer from "@/components/project/PlotLayoutViewer";

export default function PlotAvailabilitySection({ plots }) {
  return (
    <section className="pt-10 sm:pt-12">
      <span className="tracked-label text-xs text-gold-400">Live Inventory</span>
      <h2 className="mt-2 font-display text-3xl text-cream sm:text-4xl">Plot Availability</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Tap any plot to see its size, facing and price. Yellow plots are open for booking.
      </p>
      <div className="mt-8">
        <PlotLayoutViewer plots={plots} />
      </div>
    </section>
  );
}
