"use client";

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
        <div className="flex flex-col gap-1 text-xs text-(--color-text-tertiary)">
          <p>
            데이터 출처:{" "}
            <a
              href="https://open.assembly.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-(--color-text-secondary)"
            >
              열린국회정보
            </a>
          </p>
          {data?.lastSyncAt && <p>마지막 데이터 갱신: {formatSyncDate(data.lastSyncAt)}</p>}
        </div>
      </div>
    </footer>
  );
}
