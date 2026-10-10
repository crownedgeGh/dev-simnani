import { MdWorkspacePremium } from "react-icons/md";

const ROWS = [
  { label: "Free Listings (Owners)", others: "1 Listing", us: "10 Listings" },
  { label: "Free Listings (Brokers)", others: "Up to 15", us: "Up to 50" },
];

export default function ComparisonSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="text-center">
        <span className="tracked-label text-xs text-gold-400">
          Why Simnani Wins
        </span>
        <h2 className="mt-3 font-display text-2xl text-cream sm:text-3xl lg:text-4xl">
          <span className="text-gold-400">Our Speciality</span> Vs Other Real Estate Websites
        </h2>
       
      </div>

      {/* Framed card wrapper */}
      <div
        className="mx-auto mt-10 max-w-3xl rounded-2xl border border-gold-500/30 bg-navy-900 p-1.5 sm:p-2"
        style={{
          boxShadow:
            "0 20px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,198,51,0.06), 0 0 40px -10px var(--color-gold-400)",
        }}
      >
        {/* Desktop / tablet table */}
        <div className="hidden overflow-hidden rounded-xl border border-navy-700/60 sm:block">
          <div className="grid grid-cols-[1.6fr_1fr_1fr] bg-navy-950">
            <div className="p-3 text-sm text-muted">Feature</div>
            <div className="tracked-label border-l border-navy-700/60 p-3 text-center text-xs text-muted">
              Other Portals
            </div>
            <div
              className="relative border-l border-gold-500/40 bg-gradient-to-b from-gold-400/25 via-gold-400/10 to-transparent p-3 text-center"
              style={{ boxShadow: "inset 0 1px 0 0 rgba(255,198,51,0.3)" }}
            >
              <span className="tracked-label inline-flex items-center gap-1.5 text-xs text-gold-300">
                <MdWorkspacePremium className="h-4 w-4" />
                Simnani Estate
              </span>
            </div>
          </div>

          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1.6fr_1fr_1fr] ${
                i % 2 === 0 ? "bg-navy-950" : "bg-navy-900"
              }`}
            >
              <div className="border-t border-navy-700/60 p-3 text-sm text-cream">
                {row.label}
              </div>
              <div className="border-t border-l border-navy-700/60 p-3 text-center text-sm text-muted">
                {row.others}
              </div>
              <div
                className="border-t border-l border-gold-500/30 bg-gradient-to-b from-gold-400/15 to-gold-400/5 p-3 text-center text-sm font-display font-semibold text-gold-300"
                style={{ textShadow: "0 0 16px rgba(255,198,51,0.35)" }}
              >
                {row.us}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile stacked cards */}
        <div className="space-y-3 p-1.5 sm:hidden">
          {ROWS.map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-navy-700/60 bg-navy-950 p-3"
            >
              <h3 className="font-display text-sm text-cream">{row.label}</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-navy-700/60 bg-navy-900 p-2 text-center">
                  <p className="tracked-label text-[10px] text-muted">Others</p>
                  <p className="mt-1 text-sm text-muted">{row.others}</p>
                </div>
                <div
                  className="rounded-lg border border-gold-500/40 bg-gradient-to-b from-gold-400/25 to-gold-400/5 p-2 text-center"
                  style={{ boxShadow: "0 0 20px -6px var(--color-gold-400)" }}
                >
                  <p className="tracked-label flex items-center justify-center gap-1 text-[10px] text-gold-300">
                    <MdWorkspacePremium className="h-3 w-3" />
                    Simnani Estate
                  </p>
                  <p className="mt-1 text-sm font-display font-semibold text-gold-300">
                    {row.us}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted">
        *Figures reflect typical free-tier limits on popular Indian real
        estate portals compared to Simnani Estate&apos;s current plans.
      </p>
    </section>
  );
}
