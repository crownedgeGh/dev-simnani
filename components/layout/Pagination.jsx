"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Builds a compact page list like [1, "...", 4, 5, 6, "...", 12] so the
// pager stays readable on mobile even with many pages.
function getPageList(currentPage, totalPages) {
  const pages = [];
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);

  pages.push(1);
  if (windowStart > 2) pages.push("ellipsis-start");
  for (let page = windowStart; page <= windowEnd; page++) pages.push(page);
  if (windowEnd < totalPages - 1) pages.push("ellipsis-end");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageList = getPageList(currentPage, totalPages);

  function goTo(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  }

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
    >
      <button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-700/60 text-cream transition hover:border-gold-500/60 hover:text-gold-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-navy-700/60 disabled:hover:text-cream"
      >
        <FiChevronLeft className="h-4 w-4" />
      </button>

      {pageList.map((page) =>
        typeof page === "number" ? (
          <button
            key={page}
            type="button"
            onClick={() => goTo(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={`flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm transition active:scale-[0.98] ${
              page === currentPage
                ? "border border-gold-400 bg-gold-400/10 text-gold-400"
                : "border border-navy-700/60 text-cream hover:border-gold-500/60 hover:text-gold-400"
            }`}
          >
            {page}
          </button>
        ) : (
          <span
            key={page}
            className="flex h-11 w-6 items-center justify-center text-sm text-muted"
          >
            …
          </span>
        )
      )}

      <button
        type="button"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-700/60 text-cream transition hover:border-gold-500/60 hover:text-gold-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-navy-700/60 disabled:hover:text-cream"
      >
        <FiChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
