"use client";

import { useState, useMemo, useCallback } from "react";

export interface UsePaginationOptions<T> {
  data: T[];
  initialPage?: number;
  initialPageSize?: number;
}

export interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  paginatedData: T[];
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canNextPage: boolean;
  canPrevPage: boolean;
  startIndex: number;
  endIndex: number;
  getItemNumber: (indexInCurrentPage: number) => number;
}

export function usePagination<T>({
  data,
  initialPage = 1,
  initialPageSize = 10,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Auto-clamp page if data shrinks
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safeCurrentPage, pageSize]);

  const setPage = useCallback(
    (page: number) => {
      const target = Math.min(Math.max(1, page), totalPages);
      setCurrentPage(target);
    },
    [totalPages]
  );

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  const nextPage = useCallback(() => {
    if (safeCurrentPage < totalPages) {
      setCurrentPage((p) => Math.min(p + 1, totalPages));
    }
  }, [safeCurrentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (safeCurrentPage > 1) {
      setCurrentPage((p) => Math.max(p - 1, 1));
    }
  }, [safeCurrentPage]);

  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, totalItems);

  // Helper continuous numbering
  const getItemNumber = useCallback(
    (indexInCurrentPage: number) => {
      return (safeCurrentPage - 1) * pageSize + indexInCurrentPage + 1;
    },
    [safeCurrentPage, pageSize]
  );

  return {
    currentPage: safeCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedData,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    canNextPage: safeCurrentPage < totalPages,
    canPrevPage: safeCurrentPage > 1,
    startIndex,
    endIndex,
    getItemNumber,
  };
}
