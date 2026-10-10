import { MdHourglassBottom } from "react-icons/md";

/** Shown by Next.js instantly on navigation while a route segment's async
 * server component is still fetching data — without this, App Router leaves
 * the previous screen frozen with no feedback until the fetch resolves. */
export default function PageLoading() {
  return (
    <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-gold-400">
          <MdHourglassBottom className="h-7 w-7 animate-spin" />
        </span>
        <p className="tracked-label text-xs text-muted">Loading</p>
      </div>
    </div>
  );
}
