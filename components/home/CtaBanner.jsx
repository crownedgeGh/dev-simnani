import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <h2 className="font-display text-2xl text-cream sm:text-3xl">
        Ready to Find Your Next Property?
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm text-muted sm:text-base">
        Whether you&apos;re buying, selling, renting or investing, Simnani
        Estate helps you make better property decisions.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/buy"
          className="tracked-label w-full bg-gold-500 px-8 py-3.5 text-sm font-semibold text-navy-950 transition hover:bg-gold-400 sm:w-auto"
        >
          Explore Properties
        </Link>
        <Link
          href="/sell"
          className="tracked-label w-full border border-gold-500/70 px-8 py-3.5 text-sm text-gold-400 transition hover:bg-gold-500/10 sm:w-auto"
        >
          Post Your Property
        </Link>
      </div>
    </section>
  );
}
