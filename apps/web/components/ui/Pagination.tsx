import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    return page === 1 ? basePath : `${basePath}?page=${page}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      role="navigation"
      aria-label="Paginasi halaman"
      className="flex items-center justify-center gap-2 mt-12 py-4"
    >
      {/* Tombol Sebelumnya */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-3.5 rounded-control text-sm font-medium border border-border bg-surface text-ink hover:bg-brand-soft hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Sebelumnya</span>
        </Link>
      ) : (
        <span
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-3.5 rounded-control text-sm font-medium border border-border/50 bg-surface/50 text-ink/30 cursor-not-allowed"
          aria-disabled="true"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Sebelumnya</span>
        </span>
      )}

      {/* Nomor Halaman */}
      <div className="flex items-center gap-1.5">
        {pages.map((p) => {
          const isCurrent = p === currentPage;
          return isCurrent ? (
            <span
              key={p}
              aria-current="page"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-3.5 rounded-control text-sm font-semibold bg-brand text-white shadow-sm"
            >
              {p}
            </span>
          ) : (
            <Link
              key={p}
              href={createPageUrl(p)}
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-3.5 rounded-control text-sm font-medium border border-border bg-surface text-ink hover:bg-brand-soft hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label={`Ke halaman ${p}`}
            >
              {p}
            </Link>
          );
        })}
      </div>

      {/* Tombol Selanjutnya */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-3.5 rounded-control text-sm font-medium border border-border bg-surface text-ink hover:bg-brand-soft hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Halaman selanjutnya"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      ) : (
        <span
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-3.5 rounded-control text-sm font-medium border border-border/50 bg-surface/50 text-ink/30 cursor-not-allowed"
          aria-disabled="true"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </span>
      )}
    </nav>
  );
}
