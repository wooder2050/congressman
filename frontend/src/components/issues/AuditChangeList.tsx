"use client";

import Link from "next/link";
import type { AuditChange } from "@/data/audit-2026";
import { trackEvent } from "@/lib/analytics";
import { formatAuditMd } from "@/lib/audit-format";

interface Item {
  change: AuditChange;
  /** 허브처럼 여러 위원회를 섞어 보여 줄 때만 넘긴다 */
  committee?: { name: string; short: string; href?: string };
}

interface Props {
  items: Item[];
  /** 변경이 없을 때 안내 문구 */
  emptyText: string;
}

/**
 * 일정·명단 변경 이력. 각 항목을 펼치면 이전 → 현재와 원문 링크가 보인다.
 * 이력은 2026-10-03부터 기록한다 — 그 전 변경을 추측해 채우지 않는다.
 */
export default function AuditChangeList({ items, emptyText }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-(--color-text-secondary)">{emptyText}</p>;
  }
  return (
    <ul className="divide-y divide-(--color-border-primary) border-y border-(--color-border-primary) text-sm">
      {items.map(({ change, committee }) => (
        <li key={`${committee?.name ?? ""}-${change.on}-${change.summary}`}>
          <details
            className="group py-2"
            onToggle={(e) => {
              if ((e.currentTarget as HTMLDetailsElement).open) {
                trackEvent("audit_change_open", {
                  change_type: change.kind,
                  committee: committee?.name ?? "",
                });
              }
            }}
          >
            <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-2">
              <span className="text-(--color-text-tertiary) tabular-nums">
                {formatAuditMd(change.on.slice(5))} 확인
              </span>
              {committee &&
                (committee.href ? (
                  <Link
                    href={committee.href}
                    className="font-semibold text-(--color-primary) hover:underline"
                  >
                    {committee.short}
                  </Link>
                ) : (
                  <span className="font-semibold">{committee.short}</span>
                ))}
              <span className="rounded-full border border-(--color-border-primary) px-1.5 text-xs text-(--color-text-secondary)">
                {change.kind}
              </span>
              <span className="text-(--color-text-primary)">{change.summary}</span>
              <span className="text-xs text-(--color-text-tertiary) group-open:hidden">자세히</span>
            </summary>
            <div className="mt-1 space-y-1 pl-1 text-xs text-(--color-text-secondary)">
              {(change.before || change.after) && (
                <p>
                  {change.before && <span className="line-through">{change.before}</span>}
                  {change.before && change.after && " → "}
                  {change.after && (
                    <span className="font-semibold text-(--color-text-primary)">
                      {change.after}
                    </span>
                  )}
                </p>
              )}
              {change.source && (
                <p>
                  원문:{" "}
                  <a
                    href={change.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--color-primary) underline underline-offset-2"
                  >
                    {change.source.title}
                  </a>
                </p>
              )}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
