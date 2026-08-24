import Link from "next/link";

export default function PropertyActionCard({ propertyId }) {
  return (
    <div className="border border-navy-700/60 bg-navy-900 p-6">
      <h3 className="font-display text-lg text-cream">Interested?</h3>
      <p className="mt-2 text-sm text-muted">
        Our advisory team will get back to you within 24 hours.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <Link
          href={`/property/${propertyId}/enquire`}
          className="tracked-label bg-gold-400 px-6 py-4 text-center text-xs text-navy-950 transition hover:bg-gold-300"
        >
          Send Enquiry
        </Link>
        <Link
          href={`/property/${propertyId}/schedule-visit`}
          className="tracked-label border border-navy-700/60 px-6 py-4 text-center text-xs text-cream transition hover:border-gold-400"
        >
          Schedule Site Visit
        </Link>
        <Link
          href="/request-callback"
          className="tracked-label border border-navy-700/60 px-6 py-4 text-center text-xs text-cream transition hover:border-gold-400"
        >
          Request Callback
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-3 border-t border-navy-700/60 pt-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-700/60 font-display text-lg text-gold-400">
          A
        </div>
        <div>
          <p className="text-sm text-cream">Alexander Vance</p>
          <p className="tracked-label text-xs text-muted">Senior Advisor</p>
        </div>
      </div>
    </div>
  );
}
