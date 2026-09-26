import Link from "next/link";
import { MdReportProblem, MdEdit } from "react-icons/md";

export default function CorrectionHoldBanner({ correctionRequest, propertyId }) {
  if (!correctionRequest?.active) return null;

  const { reasons, message, requestedAt } = correctionRequest;
  const dateLabel = requestedAt
    ? new Date(requestedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="border border-gold-500/60 bg-gold-400/10 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-gold-400">
            <MdReportProblem className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="tracked-label text-xs text-gold-400">Your Listing Is On Hold</p>
            <p className="mt-1 text-sm text-cream">
              Our team reviewed this listing and needs a few corrections before it can go live. Apply
              corrections on your listing by clicking on this button.
            </p>

            {reasons?.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5">
                {reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-2 text-sm text-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                    {reason}
                  </li>
                ))}
              </ul>
            )}

            {message && (
              <p className="mt-3 border border-navy-700/60 bg-navy-950 p-3 text-sm text-muted">{message}</p>
            )}

            {dateLabel && <p className="mt-3 text-xs text-muted">Flagged on {dateLabel}</p>}

            {propertyId && (
              <Link
                href={`/post-property/edit/${propertyId}`}
                className="tracked-label mt-4 inline-flex min-h-11 items-center justify-center gap-1.5 bg-gold-400 px-4 py-2.5 text-xs text-navy-950 transition hover:bg-gold-300"
              >
                <MdEdit className="h-4 w-4" />
                Edit Listing
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
