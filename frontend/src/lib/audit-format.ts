// 2026 국정감사 허브·상임위별 페이지가 함께 쓰는 날짜·상태 표시 함수.
import { AUDIT_2026 } from "@/data/audit-2026";

const YEAR = 2026;

/** "10-06" → "2026-10-06" 날짜 키 */
export function auditDayKey(md: string): string {
  return `${YEAR}-${md}`;
}

/** "10-06" → "10월 6일(화)" */
export function formatAuditMd(md: string): string {
  const [m, day] = md.split("-").map(Number);
  // 서버 시간대(UTC)와 무관하게 달력 날짜의 요일을 구한다
  const wd = ["일", "월", "화", "수", "목", "금", "토"][
    new Date(Date.UTC(YEAR, m - 1, day)).getUTCDay()
  ];
  return `${m}월 ${day}일(${wd})`;
}

/** "10-06" 또는 "10-11~10-22" → 표시용 날짜 */
export function formatAuditDate(date: string): string {
  const [first, last] = date.split("~");
  return last ? `${formatAuditMd(first)}~${formatAuditMd(last)}` : formatAuditMd(first);
}

/** 오늘(KST) 기준 국정감사 진행 상태 */
export function auditStatus(now: Date): { label: string; tone: "upcoming" | "live" | "done" } {
  const d = AUDIT_2026;
  const today = new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  if (today < d.start) {
    const days = Math.round(
      (new Date(`${d.start}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime()) /
        86400000,
    );
    return { label: `시작 D-${days}`, tone: "upcoming" };
  }
  // 전체 기간 판정이다. 개별 회의가 지금 열리고 있는지는 알 수 없으므로 "진행 중"이라 쓰지 않는다
  if (today <= d.extendedEnd) return { label: "국감 기간 중", tone: "live" };
  return { label: "종료", tone: "done" };
}

export function auditStatusClass(tone: "upcoming" | "live" | "done"): string {
  return tone === "live"
    ? "bg-(--color-text-primary) text-(--color-text-inverse)"
    : "border border-(--color-border-primary) text-(--color-text-secondary)";
}

/** 회의 안건 전문에서 국정감사 관련 줄만 남긴다(법안 목록이 수십 줄씩 붙어 있다) */
export function auditAgendaText(agenda: string | null | undefined, fallback: string): string {
  const lines = (agenda ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.includes("국정감사"));
  return lines.length > 0 ? lines.join(" · ") : fallback;
}

/**
 * 국정감사 생중계 — 국회 공식 채널만 연결한다(2026-10-05 접속 확인).
 * 의사중계시스템은 위원회별 실시간 영상을, 국회방송은 주요 감사 중계를 낸다.
 */
export const AUDIT_LIVE_LINKS = [
  { label: "국회 인터넷의사중계", url: "https://assembly.webcast.go.kr/main/" },
  { label: "국회방송(NATV)", url: "https://www.natv.go.kr/natv/index.do" },
] as const;

/** 한국 시간(KST) 기준 "YYYY-MM-DD" — 서버 시간대(UTC)와 무관하게 계산한다 */
export function kstDateKey(now: Date, addDays = 0): string {
  return new Date(now.getTime() + 9 * 3600 * 1000 + addDays * 86400000).toISOString().slice(0, 10);
}

/** "10-11~10-22" 같은 기간형 일정을 날짜 키 목록으로 펼친다 */
export function expandAuditDate(date: string): string[] {
  const [first, last] = date.split("~");
  if (!last) return [auditDayKey(first)];
  const out: string[] = [];
  const start = new Date(`${auditDayKey(first)}T00:00:00Z`).getTime();
  const end = new Date(`${auditDayKey(last)}T00:00:00Z`).getTime();
  for (let t = start; t <= end; t += 86400000) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}

/** 일정(단일일·기간형)이 끝나는 날짜 키 — "10-11~10-22"면 10-22 */
function auditDayEndKey(date: string): string {
  const [first, last] = date.split("~");
  return auditDayKey(last ?? first);
}

/** 오늘(KST 날짜 키) 이후에 남은 일정만 — 국감 중반에 지난 첫 일정이 반복 노출되지 않게 한다 */
export function remainingAuditDays<T extends { date: string }>(days: T[], todayKey: string): T[] {
  return days.filter((day) => auditDayEndKey(day.date) >= todayKey);
}
