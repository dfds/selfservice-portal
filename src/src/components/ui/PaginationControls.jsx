import React from "react";

export function PaginationControls({
  currentPage,
  totalPages,
  pageStart,
  pageSize,
  total,
  onPrev,
  onNext,
}) {
  if (total === 0) return null;
  return (
    <div className="flex items-center justify-between mt-4 py-2 border-t border-divider">
      <span className="text-xs text-muted">
        {pageStart + 1}–{Math.min(pageStart + pageSize, total)} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="px-3 py-1 text-xs border border-divider rounded-[5px] bg-surface text-primary disabled:opacity-40 hover:bg-surface-muted"
        >
          Previous
        </button>
        <span className="text-xs text-muted">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-xs border border-divider rounded-[5px] bg-surface text-primary disabled:opacity-40 hover:bg-surface-muted"
        >
          Next
        </button>
      </div>
    </div>
  );
}
