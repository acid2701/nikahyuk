"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = "",
}: DataTablePaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  // Generate numbered pills with window
  const getPageNumbers = () => {
    const delta = 1;
    const range: number[] = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(safeTotalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift(-1);
    }
    if (currentPage + delta < safeTotalPages - 1) {
      range.push(-2);
    }

    range.unshift(1);
    if (safeTotalPages > 1) {
      range.push(safeTotalPages);
    }

    return range;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-3 border-t border-border/60 text-xs bg-card/40 ${className}`}
    >
      {/* Counter label & page size selector */}
      <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3 text-muted-foreground">
        <span>
          Menampilkan <strong className="font-mono text-foreground font-semibold">{startItem}</strong> -{" "}
          <strong className="font-mono text-foreground font-semibold">{endItem}</strong> dari{" "}
          <strong className="font-mono text-foreground font-semibold">{totalItems}</strong> entri
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="hidden sm:inline">Per hal:</span>
            <select
              aria-label="Pilih jumlah baris per halaman"
              value={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 px-2 rounded-full border border-border/80 bg-background text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={String(opt)}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pill buttons navigation (Jobright signature style) */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 rounded-full border-border/60 hover:bg-muted"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title="Halaman Pertama"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
          <span className="sr-only">Pertama</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5 rounded-full border-border/60 text-xs gap-1 hover:bg-muted"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) => {
            if (p < 0) {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
                  ...
                </span>
              );
            }
            const isActive = p === currentPage;
            return (
              <Button
                key={p}
                type="button"
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 rounded-full text-xs font-mono transition-all ${
                  isActive
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2.5 rounded-full border-border/60 text-xs gap-1 hover:bg-muted"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= safeTotalPages}
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 rounded-full border-border/60 hover:bg-muted"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={currentPage >= safeTotalPages}
          title="Halaman Terakhir"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
          <span className="sr-only">Terakhir</span>
        </Button>
      </div>
    </div>
  );
}
