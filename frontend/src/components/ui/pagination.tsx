"use client";

import {
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 4) pages.push("...");

  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 3) pages.push("...");

  pages.push(total);
  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="페이지 탐색" className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 10))}
        disabled={currentPage <= 1}
        aria-label="10페이지 이전"
      >
        <ChevronsLeftIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="이전 페이지"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>

      {/* 모바일: 간단 텍스트 */}
      <span className="min-w-16 text-center text-sm text-(--color-text-secondary) sm:hidden">
        {currentPage} / {totalPages}
      </span>

      {/* 데스크톱: 페이지 번호 */}
      <div className="hidden gap-1 sm:flex">
        {pages.map((page, i) =>
          page === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-(--color-text-tertiary)"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => onPageChange(page)}
              aria-label={`${page}페이지`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Button>
          ),
        )}
      </div>

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="다음 페이지"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 10))}
        disabled={currentPage >= totalPages}
        aria-label="10페이지 다음"
      >
        <ChevronsRightIcon className="h-4 w-4" />
      </Button>
    </nav>
  );
}
