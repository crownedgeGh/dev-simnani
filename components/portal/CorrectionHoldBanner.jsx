import Link from "next/link";
import { MdReportProblem, MdEdit, MdHourglassTop, MdErrorOutline, MdOutlineChatBubble } from "react-icons/md";

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";
}

export default function CorrectionHoldBanner({ correctionRequest, propertyId }) {
  if (!correctionRequest?.active && !correctionRequest?.underReview) return null;

  if (correctionRequest.underReview) {
    return (
      <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border border-gold-500/60 bg-gold-400/10 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-gold-400">
              <MdHourglassTop className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="tracked-label text-xs text-gold-400">Your Changes Are Under Review</p>
              <p className="mt-1 text-sm text-cream">
                Thanks for updating your listing. Our team will re-check it shortly and let you know once
                it&apos;s live again.
              </p>
              {formatDate(correctionRequest.submittedAt) && (
                <p className="mt-3 text-xs text-muted">
                  Resubmitted on {formatDate(correctionRequest.submittedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { reasons, message, requestedAt } = correctionRequest;
  const dateLabel = formatDate(requestedAt);

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
              <div className="mt-4">
                <p className="tracked-label text-[10px] text-gold-400">What needs fixing</p>
                <ul className="mt-2 flex flex-col gap-2">
                  {reasons.map((reason) => (
                    <li
                      key={reason}
                      className="flex items-start gap-2.5 border-l-2 border-gold-400 bg-navy-950/60 px-3 py-2.5 text-sm font-medium text-cream"
                    >
                      <MdErrorOutline className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {message && (
              <div className="mt-4 border-l-2 border-gold-400 bg-navy-950/60 p-3.5">
                <p className="tracked-label flex items-center gap-1.5 text-[10px] text-gold-400">
                  <MdOutlineChatBubble className="h-3.5 w-3.5" />
                  Message from our team
                </p>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-cream">{message}</p>
              </div>
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
