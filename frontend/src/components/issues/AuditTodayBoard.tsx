import Link from "next/link";
import {
  AUDIT_2026,
  auditCommitteePath,
  isAuditCommitteePageReady,
  type AuditCommittee,
} from "@/data/audit-2026";
import AuditLiveLinks from "@/components/issues/AuditLiveLinks";
import { expandAuditDate, formatAuditMd, kstDateKey } from "@/lib/audit-format";

interface BoardRow {
  committee: AuditCommittee;
  target: string;
  period: string;
}

/** 모든 위원회 일정을 날짜 키별로 펼친다. 기간형(재외공관 감사 등)은 기간 안의 날짜마다 넣는다 */
function rowsByDate(): Map<string, BoardRow[]> {
  const map = new Map<string, BoardRow[]>();
  for (const c of AUDIT_2026.committees) {
    if (c.status === "pending") continue;
    for (const day of c.days) {
      for (const key of expandAuditDate(day.date)) {
        const list = map.get(key) ?? [];
        list.push({ committee: c, target: day.target, period: day.date });
        map.set(key, list);
      }
    }
  }
  return map;
}

function RowList({ rows }: { rows: BoardRow[] }) {
  return (
    <ul className="divide-y divide-(--color-border-primary) text-sm">
      {rows.map((r, i) => (
        <li key={`${r.committee.name}-${i}`} className="flex gap-3 py-2">
          <span className="w-20 shrink-0 font-semibold">
            {isAuditCommitteePageReady(r.committee) ? (
              <Link
                href={auditCommitteePath(r.committee.name)}
                className="text-(--color-primary) hover:underline"
              >
                {r.committee.short}
              </Link>
            ) : (
              r.committee.short
            )}
          </span>
          <span className="text-(--color-text-secondary)">
            {r.target}
            {r.period.includes("~") ? " (기간 감사)" : ""}
            {r.committee.status === "reported" ? " (예정)" : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * 허브 일정 탐색의 첫 블록 — 국감 전엔 첫 감사일, 국감 중엔 오늘 예정된 감사와 공식 중계.
 * 날짜는 KST로 계산한다. "지금 감사 중"인지는 알 수 없으므로 '예정'으로만 쓴다.
 * 허브 revalidate(900초)만큼 자정 직후 전날 화면이 남을 수 있다.
 */
export default function AuditTodayBoard({ now }: { now: Date }) {
  const d = AUDIT_2026;
  const today = kstDateKey(now);
  if (today > d.extendedEnd) return null;
  const tomorrow = kstDateKey(now, 1);
  const map = rowsByDate();
  const beforeStart = today < d.start;
  const focusKey = beforeStart ? d.start : today;
  const focusRows = map.get(focusKey) ?? [];
  const tomorrowRows = beforeStart ? [] : (map.get(tomorrow) ?? []);
  const next = [...map.keys()].sort().find((k) => k > (beforeStart ? d.start : tomorrow));

  return (
    <section
      id="today"
      aria-labelledby="today-board-title"
      className="scroll-mt-32 rounded-xl border border-(--color-border-primary) p-4"
    >
      <h2 id="today-board-title" className="text-lg font-bold">
        {beforeStart ? "첫 감사일" : "오늘 예정된 국감"}{" "}
        <span className="font-semibold text-(--color-text-secondary)">
          · {formatAuditMd(focusKey.slice(5))}
        </span>
      </h2>
      <div className="mt-3">
        <AuditLiveLinks component="hub_today_board" />
      </div>
      <p className="mt-2 text-xs text-(--color-text-tertiary)">
        공식 중계 사이트에서 위원회를 고르세요. 방송 여부·정회 상태는 이곳에서 확인하지 않습니다.
      </p>
      <div className="mt-3">
        {focusRows.length > 0 ? (
          <RowList rows={focusRows} />
        ) : (
          <p className="text-sm text-(--color-text-secondary)">
            수록한 계획서에서 오늘 일정이 확인되지 않습니다.
          </p>
        )}
      </div>
      {!beforeStart && tomorrowRows.length > 0 && (
        <details
          open={focusRows.length === 0}
          className="group mt-3 rounded-lg bg-(--color-bg-secondary) px-3 py-2"
        >
          <summary className="cursor-pointer text-sm font-semibold">
            내일 {formatAuditMd(tomorrow.slice(5))} 일정 {tomorrowRows.length}건 보기
          </summary>
          <div className="mt-2">
            <RowList rows={tomorrowRows} />
          </div>
        </details>
      )}
      {!beforeStart && focusRows.length === 0 && tomorrowRows.length === 0 && next && (
        <div className="mt-3">
          <h3 className="text-sm font-bold">다음 확인 일정 · {formatAuditMd(next.slice(5))}</h3>
          <RowList rows={map.get(next) ?? []} />
        </div>
      )}
      <p className="mt-3 text-xs text-(--color-text-tertiary)">
        &lsquo;(예정)&rsquo;은 계획서 의결 전 보도된 일정입니다. 감사 예정 시각·장소는 계획서와
        위원회 공지에서 확인하세요.
      </p>
    </section>
  );
}
