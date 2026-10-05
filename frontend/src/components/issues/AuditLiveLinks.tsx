"use client";

import { trackEvent } from "@/lib/analytics";
import { AUDIT_LIVE_LINKS } from "@/lib/audit-format";

interface Props {
  /** 어느 자리의 링크인지(허브 오늘 보드·상임위 요약 등) — audit_live_click의 component 값 */
  component: string;
  committee?: string;
}

/**
 * 국회 공식 생중계로 나가는 링크. 방송 여부·정회 상태는 우리가 알 수 없으므로
 * "지금 생중계 중" 같은 표시는 하지 않고 공식 채널로만 안내한다.
 */
export default function AuditLiveLinks({ component, committee }: Props) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      {AUDIT_LIVE_LINKS.map((l, i) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackEvent("audit_live_click", { component, committee, channel: l.label, position: i })
          }
          className={
            i === 0
              ? "inline-flex min-h-10 items-center rounded-lg bg-(--color-text-primary) px-3 text-sm font-semibold text-(--color-text-inverse) no-underline"
              : "inline-flex min-h-10 items-center rounded-lg border border-(--color-border-primary) px-3 text-sm font-semibold text-(--color-text-primary) no-underline"
          }
        >
          {i === 0 ? "국회 의사중계" : "국회방송"}
          <span aria-hidden="true" className="ml-1">
            ↗
          </span>
        </a>
      ))}
    </span>
  );
}
