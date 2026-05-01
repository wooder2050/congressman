"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ElectionFab() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        // 첫 화면 이내(< 300px)면 항상 표시, 아래로 스크롤이면 숨김
        setHidden(currentY > 300 && currentY > lastY);
        lastY = currentY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/elections") || pathname.startsWith("/local-elections")) return null;

  return (
    <Link
      href="/local-elections/2026"
      className={`fixed right-4 bottom-20 z-40 flex items-center gap-2 rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-[transform,opacity,background-color] duration-300 hover:bg-rose-600 hover:shadow-xl active:scale-95 lg:bottom-6 ${
        hidden ? "pointer-events-none translate-y-24 opacity-0" : "translate-y-0 opacity-100"
      }`}
      aria-label="6·3 지방선거 보기"
      tabIndex={hidden ? -1 : undefined}
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
      <span>6·3 지방선거</span>
    </Link>
  );
}
