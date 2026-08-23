'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransition } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function CertificationPagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const navigate = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  // Show at most 5 pages around current
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  const visiblePages = pages.slice(start - 1, end);

  const btnBase =
    'flex items-center justify-center w-9 h-9 rounded-lg border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]/40';

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1.5 mt-12 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
    >
      <button
        onClick={() => navigate(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
        className={`${btnBase} bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-30 disabled:cursor-not-allowed`}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => navigate(1)}
            className={`${btnBase} bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]`}
          >
            1
          </button>
          {start > 2 && <span className="text-[var(--text-tertiary)] px-1">…</span>}
        </>
      )}

      {visiblePages.map((p) => (
        <button
          key={p}
          onClick={() => navigate(p)}
          aria-current={p === currentPage ? 'page' : undefined}
          className={`${btnBase} ${
            p === currentPage
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]'
              : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-[var(--text-tertiary)] px-1">…</span>}
          <button
            onClick={() => navigate(totalPages)}
            className={`${btnBase} bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => navigate(currentPage + 1)}
        disabled={currentPage === totalPages || isPending}
        className={`${btnBase} bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-30 disabled:cursor-not-allowed`}
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
