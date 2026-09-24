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
  if (today <= d.extendedEnd) return { label: "진행 중", tone: "live" };
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
