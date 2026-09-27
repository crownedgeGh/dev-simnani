/** Shown by Next.js instantly on navigation while a route segment's async
 * server component is still fetching data — without this, App Router leaves
 * the previous screen frozen with no feedback until the fetch resolves. */
export default function PageLoading() {
  return (
    <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-navy-700 border-t-gold-400" />
        <p className="tracked-label text-xs text-muted">Loading</p>
      </div>
    </div>
  );
}
