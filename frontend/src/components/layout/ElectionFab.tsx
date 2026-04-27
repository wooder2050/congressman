"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ElectionFab() {
  const pathname = usePathname();

  if (pathname.startsWith("/elections")) return null;

  return (
    <Link
      href="/elections/2026-06-03"
      className="fixed right-4 bottom-20 z-40 flex items-center gap-2 rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-rose-600 hover:shadow-xl active:scale-95 lg:bottom-6"
      aria-label="6·3 재보궐선거 보기"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
      <span>6·3 재보궐</span>
    </Link>
  );
}
