import Link from "next/link";
import type { LocalElectionRaceSummary, LocalElectionType } from "@/types";

interface Props {
  number: number;
  ballotLabel: string;
  kind: "person" | "party" | "non-partisan";
  type: LocalElectionType;
  races: LocalElectionRaceSummary[];
  year: string;
  sido: string;
}

/**
 * "투표용지 1장" 단위의 카드.
 * - person: 해당 race(들)의 인물 후보를 표시
 * - party: 정당 비례 후보 (한 race에 여러 정당이 명부로 들어있음)
 * - non-partisan: 교육감 (정당·기호 없음)
 * - races[0]이 단일이면 바로 race 링크, 여러 개면 race 목록 노출
 */
export default function BallotCard({ number, ballotLabel, kind, type, races, year, sido }: Props) {
  const kindBadge =
    kind === "party" ? "정당투표" : kind === "non-partisan" ? "정당·기호 없음" : null;

  // 데이터 없음 — 특히 local-proportional (NEC 미제공) 또는 후보 미등록
  if (races.length === 0) {
    const isLocalProp = type === "local-proportional";
    return (
      <article className="rounded-xl border border-dashed border-(--color-border-primary) bg-(--color-bg-primary) p-4">
        <header className="flex items-baseline gap-2">
          <span className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-xs font-bold text-(--color-text-secondary)">
            {number}번
          </span>
          <h3 className="text-sm font-bold text-(--color-text-primary)">{ballotLabel}</h3>
          {kindBadge && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {kindBadge}
            </span>
          )}
        </header>
        <p className="mt-2 text-xs text-(--color-text-secondary)">
          {isLocalProp ? (
            <>
              NEC Open API에서 제공되지 않는 선거입니다.{" "}
              <Link
                href={`/local-elections/${year}/local-proportional/${encodeURIComponent(sido)}`}
                className="text-(--color-primary) underline hover:no-underline"
              >
                안내 보기 →
              </Link>
            </>
          ) : (
            "이 시·군·구에는 이 선거가 없거나 후보자 데이터가 아직 등록되지 않았습니다."
          )}
        </p>
      </article>
    );
  }

  // 단일 race — 바로 race 상세 링크
  if (races.length === 1) {
    const race = races[0];
    return (
      <article className="overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)">
        <header className="flex items-baseline gap-2 border-b border-(--color-border-primary) bg-(--color-bg-secondary) px-4 py-2.5">
          <span className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-xs font-bold text-(--color-text-secondary)">
            {number}번
          </span>
          <h3 className="text-sm font-bold text-(--color-text-primary)">{ballotLabel}</h3>
          {kindBadge && (
            <span className="ml-auto rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {kindBadge}
            </span>
          )}
        </header>
        <Link
          href={`/local-elections/${year}/races/${race.id}`}
          className="block px-4 py-3 transition-colors hover:bg-(--color-bg-secondary)"
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="truncate text-sm font-semibold text-(--color-text-primary)">
              {race.displayName}
            </h4>
            <span className="shrink-0 text-xs text-(--color-text-tertiary)">
              {race.candidateCount}명
            </span>
          </div>
          {race.topCandidates.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {race.topCandidates.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: c.party?.color
                      ? `${c.party.color}18`
                      : "var(--color-bg-tertiary)",
                    color: c.party?.color ?? "var(--color-text-secondary)",
                  }}
                >
                  {c.candidateNumber != null && (
                    <span className="font-bold">{c.candidateNumber}</span>
                  )}
                  {c.name}
                </span>
              ))}
              {race.candidateCount > race.topCandidates.length && (
                <span className="text-xs text-(--color-text-tertiary)">
                  외 {race.candidateCount - race.topCandidates.length}명
                </span>
              )}
            </div>
          )}
        </Link>
      </article>
    );
  }

  // 여러 race (예: 시군구를 선택 안 하면 광역의원 지역구가 시도 안에 여러 개)
  return (
    <article className="overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)">
      <header className="flex items-baseline gap-2 border-b border-(--color-border-primary) bg-(--color-bg-secondary) px-4 py-2.5">
        <span className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-xs font-bold text-(--color-text-secondary)">
          {number}번
        </span>
        <h3 className="text-sm font-bold text-(--color-text-primary)">{ballotLabel}</h3>
        <span className="ml-auto text-xs text-(--color-text-tertiary)">
          {races.length}개 선거구
        </span>
      </header>
      <ul className="divide-y divide-(--color-border-primary)">
        {races.map((race) => (
          <li key={race.id}>
            <Link
              href={`/local-elections/${year}/races/${race.id}`}
              className="flex items-center justify-between gap-2 px-4 py-2.5 transition-colors hover:bg-(--color-bg-secondary)"
            >
              <span className="min-w-0 truncate text-sm font-medium text-(--color-text-primary)">
                {race.displayName}
              </span>
              <span className="shrink-0 text-xs text-(--color-text-tertiary)">
                {race.candidateCount}명
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
