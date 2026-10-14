import { MdWorkspacePremium, MdArrowForward } from "react-icons/md";

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
      <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-xl border border-navy-700/60 bg-navy-900">
        {/* Desktop / tablet table */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-[1.6fr_1fr_1fr] border-b border-navy-700/60 bg-navy-950">
            <div className="tracked-label p-4 text-xs text-muted">Feature</div>
            <div className="tracked-label border-l border-navy-700/60 p-4 text-center text-xs text-muted">
              Other Portals
            </div>
            <div className="tracked-label flex items-center justify-center gap-1.5 border-l border-navy-700/60 bg-gold-400/5 p-4 text-center text-xs text-gold-400">
              <MdWorkspacePremium className="h-4 w-4" />
              Simnani Estate
            </div>
          </div>

          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`relative grid grid-cols-[1.6fr_1fr_1fr] ${
                i !== ROWS.length - 1 ? "border-b border-navy-700/60" : ""
              }`}
            >
              <div className="p-4 text-sm text-cream">{row.label}</div>
              <div className="border-l border-navy-700/60 p-4 text-center text-sm text-muted">
                {row.others}
              </div>
              <div className="border-l border-navy-700/60 bg-gold-400/5 p-4 text-center font-display text-sm font-semibold text-gold-400">
                {row.us}
              </div>
              <span className="absolute left-[calc(1.6/3.6*100%)] top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/40 bg-navy-950">
                <MdArrowForward className="h-3.5 w-3.5 text-gold-400" />
              </span>
            </div>
          ))}
        </div>

        {/* Mobile stacked cards */}
        <div className="divide-y divide-navy-700/60 sm:hidden">
          {ROWS.map((row) => (
            <div key={row.label} className="p-4">
              <h3 className="font-display text-sm text-cream">{row.label}</h3>
              <div className="relative mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-navy-700/60 bg-navy-950 p-3 text-center">
                  <p className="tracked-label text-[10px] text-muted">Others</p>
                  <p className="mt-1 text-sm text-muted">
                    {row.others}
                  </p>
                </div>
                <div className="rounded-lg border border-gold-500/30 bg-gold-400/5 p-3 text-center">
                  <p className="tracked-label flex items-center justify-center gap-1 text-[10px] text-gold-400">
                    <MdWorkspacePremium className="h-3 w-3" />
                    Simnani Estate
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold text-gold-400">
                    {row.us}
                  </p>
                </div>
                <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/40 bg-navy-950">
                  <MdArrowForward className="h-4 w-4 text-gold-400" />
                </span>
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
