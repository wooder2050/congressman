import Link from "next/link";
import {
  AUDIT_2026,
  auditCommitteePath,
  isAuditCommitteePageReady,
  type AuditCommittee,
} from "@/data/audit-2026";
import { AUDIT_LIVE_LINKS, expandAuditDate, formatAuditMd, kstDateKey } from "@/lib/audit-format";

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

function DayList({ title, dateKey, rows }: { title: string; dateKey: string; rows: BoardRow[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold">
        {title}{" "}
        <span className="font-normal text-(--color-text-tertiary)">
          {formatAuditMd(dateKey.slice(5))}
        </span>
      </h3>
      {rows.length === 0 ? (
        <p className="mt-1 text-sm text-(--color-text-secondary)">예정된 감사가 없습니다.</p>
      ) : (
        <ul className="mt-1 divide-y divide-(--color-border-primary) text-sm">
          {rows.map((r, i) => (
            <li key={`${r.committee.name}-${i}`} className="flex gap-3 py-1.5">
              <span className="w-20 shrink-0 font-medium">
                {isAuditCommitteePageReady(r.committee) ? (
                  <Link href={auditCommitteePath(r.committee.name)} className="hover:underline">
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
      )}
    </div>
  );
}

/**
 * 허브 최상단 "오늘의 국감" — 오늘·내일 감사하는 위원회와 기관.
 * 날짜는 KST로 계산한다. 국감 전이면 첫 감사일을, 오늘·내일이 비면 다음 감사일을 보여 준다.
 * 허브 revalidate(900초)만큼 자정 직후 전날 화면이 남을 수 있다.
 */
export default function AuditTodayBoard({ now }: { now: Date }) {
  const d = AUDIT_2026;
  const today = kstDateKey(now);
  if (today > d.extendedEnd) return null;
  const tomorrow = kstDateKey(now, 1);
  const map = rowsByDate();
  const dates = [...map.keys()].sort();
  const beforeStart = today < d.start;
  const next = dates.find((k) => k > tomorrow);

  return (
    <section
      aria-labelledby="today-board-title"
      className="rounded-xl border border-(--color-border-primary) p-4"
    >
      <h2 id="today-board-title" className="text-lg font-bold">
        {beforeStart ? "첫 감사일 일정" : "오늘의 국감"}
      </h2>
      <div className="mt-3 space-y-4">
        {beforeStart ? (
          <DayList title="첫 감사일" dateKey={d.start} rows={map.get(d.start) ?? []} />
        ) : (
          <>
            <DayList title="오늘" dateKey={today} rows={map.get(today) ?? []} />
            <DayList title="내일" dateKey={tomorrow} rows={map.get(tomorrow) ?? []} />
            {(map.get(today) ?? []).length === 0 &&
              (map.get(tomorrow) ?? []).length === 0 &&
              next && <DayList title="다음 감사일" dateKey={next} rows={map.get(next) ?? []} />}
          </>
        )}
      </div>
      <p className="mt-3 text-sm">
        <span className="font-semibold">생중계 보기</span>{" "}
        {AUDIT_LIVE_LINKS.map((l, i) => (
          <span key={l.url}>
            {i > 0 && " · "}
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--color-primary) underline underline-offset-2"
            >
              {l.label}
            </a>
          </span>
        ))}
      </p>
      <p className="mt-2 text-xs text-(--color-text-tertiary)">
        &lsquo;(예정)&rsquo;은 계획서 의결 전 보도된 일정입니다. 실제 회의 시각은 국회 공개 일정에서
        확인하세요.
      </p>
    </section>
  );
}
