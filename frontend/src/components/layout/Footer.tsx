"use client";

import Link from "next/link";
import { useCongressQuery } from "@/hooks/useCongressQuery";
import { getLastSync } from "@/lib/api";

function formatSyncDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${y}. ${m}. ${day}. ${h}:${min}`;
}

export default function Footer() {
  const { data } = useCongressQuery(getLastSync, undefined, {
    staleTime: 1000 * 60 * 30,
  });

  return (
    <footer className="mt-8 border-t border-(--color-border-primary) pb-20 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--color-text-tertiary)">
            <Link
              href="/about"
              className="font-semibold underline hover:text-(--color-text-secondary)"
            >
              서비스 소개
            </Link>
            <Link href="/glossary" className="underline hover:text-(--color-text-secondary)">
              용어 사전
            </Link>
            <Link href="/guide" className="underline hover:text-(--color-text-secondary)">
              입법 과정 안내
            </Link>
            <a
              href="https://open.assembly.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-(--color-text-secondary)"
            >
              열린국회정보
            </a>
            <a
              href="https://github.com/wooder2050/congressman"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-(--color-text-secondary)"
            >
              GitHub
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--color-text-tertiary)">
            <Link href="/privacy" className="underline hover:text-(--color-text-secondary)">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="underline hover:text-(--color-text-secondary)">
              이용약관
            </Link>
          </div>
          {data?.lastSyncAt && (
            <p className="text-xs text-(--color-text-tertiary)">
              마지막 데이터 갱신: {formatSyncDate(data.lastSyncAt)}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
