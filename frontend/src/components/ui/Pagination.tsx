'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const delta = 1;

    pages.push(1);

    if (totalPages > 1) {
      const rangeStart = Math.max(2, page - delta);
      const rangeEnd = Math.min(totalPages - 1, page + delta);

      if (rangeStart > 2) pages.push('ellipsis');

      for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
      }

      if (rangeEnd < totalPages - 1) pages.push('ellipsis');

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 text-sm font-medium text-primary-700/70 rounded-xl bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
      >
        Précédent
      </button>

      {getPageNumbers().map((p, idx) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2 text-sm text-primary-400">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
              p === page
                ? 'bg-primary-700/90 text-white backdrop-blur-sm border border-[var(--glass-border)] shadow-lg shadow-primary-700/20'
                : 'text-primary-700/70 bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)] hover:bg-[var(--glass-bg)]'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-2 text-sm font-medium text-primary-700/70 rounded-xl bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
      >
        Suivant
      </button>
    </nav>
  );
}
