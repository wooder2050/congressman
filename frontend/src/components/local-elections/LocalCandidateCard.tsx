import Image from "next/image";
import Link from "next/link";
import type { LocalElectionCandidateDetail } from "@/types";
import CandidateDisclosureSection from "@/components/elections/CandidateDisclosureSection";

interface Props {
  candidate: LocalElectionCandidateDetail;
  /** 후보자 상세 페이지 링크용 연도 (예: "2026"). 없으면 링크 미표시 */
  year?: string;
  /**
   * 개표 모드 — 득표 결과를 강조하고 공약·경력·학력·재산공개 등 부가 정보를 숨긴다.
   * 6/3 개표 시작(election.status === "completed") 이후 race 화면에서 켠다.
   */
  resultMode?: boolean;
  /**
   * 당선(확정 또는 보수적 추정) 여부 — 미전달 시 공식 확정(isWinner)으로 폴백.
   * 추정 당선은 상위에서 getRaceCallStatus로 판정해 전달한다.
   */
  won?: boolean;
}

export default function LocalCandidateCard({ candidate: c, year, resultMode = false, won }: Props) {
  const partyColor = c.party?.color ?? "#999";
  const isWon = won ?? c.isWinner;

  return (
    <div
      className={`rounded-xl border bg-(--color-bg-primary) p-4 ${
        resultMode && isWon
          ? "border-green-500 ring-1 ring-green-500/40 dark:border-green-400"
          : "border-(--color-border-primary)"
      }`}
    >
      {/* 헤더: 사진 + 이름 + 정당 */}
      <div className="flex gap-3">
        <div
          className="relative size-16 shrink-0 overflow-hidden rounded-full border-2"
          style={{ borderColor: partyColor }}
        >
          {c.photoUrl ? (
            <Image src={c.photoUrl} alt={c.name} fill className="object-cover" unoptimized />
          ) : (
            <div
              className="flex size-full items-center justify-center text-lg font-bold text-white"
              style={{ backgroundColor: partyColor }}
            >
              {c.name.slice(0, 1)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {c.candidateNumber != null && (
              <span
                className="flex size-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: partyColor }}
              >
                {c.candidateNumber}
              </span>
            )}
            <h3 className="truncate text-base font-bold text-(--color-text-primary)">{c.name}</h3>
            {isWon && (
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-[11px] font-bold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                당선{!c.isWinner && " (잠정)"}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-(--color-text-secondary)">
            {c.party?.name ?? "무소속"}
          </p>
          {/* 개표 모드에서는 생년월일 등 부가 정보 대신 결과에 집중 */}
          {!resultMode && c.birthDate && (
            <p className="text-xs text-(--color-text-tertiary)">
              {c.birthDate}생{c.gender ? ` · ${c.gender}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* 득표 결과 (개표 후) */}
      {c.voteCount != null && (
        <div
          className={`mt-3 flex items-baseline gap-2 rounded-lg px-3 py-2 ${
            resultMode ? "bg-(--color-bg-tertiary)" : "bg-(--color-bg-secondary)"
          }`}
        >
          <span
            className={`font-bold text-(--color-text-primary) ${
              resultMode ? "text-lg" : "text-sm"
            }`}
          >
            {c.voteCount.toLocaleString()}표
          </span>
          {c.voteRate != null && (
            <span
              className={`text-(--color-text-secondary) ${resultMode ? "text-sm font-medium" : "text-xs"}`}
            >
              {c.voteRate.toFixed(1)}%
            </span>
          )}
        </div>
      )}

      {/* 개표 모드에서는 슬로건·경력·학력·공약·재산공개·상세링크를 숨기고 결과만 노출 */}
      {resultMode ? null : (
        <>
          {/* 슬로건 */}
          {c.slogan && (
            <p className="mt-3 text-sm text-(--color-text-secondary) italic">
              &ldquo;{c.slogan}&rdquo;
            </p>
          )}

          {/* 경력 */}
          {c.career && (
            <div className="mt-3">
              <h4 className="mb-1 text-xs font-bold text-(--color-text-tertiary)">경력</h4>
              <p className="text-xs leading-relaxed whitespace-pre-line text-(--color-text-secondary)">
                {c.career}
              </p>
            </div>
          )}

          {/* 학력 */}
          {c.education && (
            <div className="mt-2">
              <h4 className="mb-1 text-xs font-bold text-(--color-text-tertiary)">학력</h4>
              <p className="text-xs text-(--color-text-secondary)">{c.education}</p>
            </div>
          )}

          {/* 재산 (구 텍스트 — 최신 데이터는 후보자정보공개자료로 대체) */}
          {c.assets && c.assetDeclared === null && (
            <div className="mt-2">
              <h4 className="mb-1 text-xs font-bold text-(--color-text-tertiary)">재산</h4>
              <p className="text-xs text-(--color-text-secondary)">{c.assets}</p>
            </div>
          )}

          {/* 후보자정보공개자료 (공직선거법 제49조) */}
          <CandidateDisclosureSection data={c} />

          {/* 후보자 상세 페이지 */}
          {year && (
            <Link
              href={`/local-elections/${year}/candidates/${c.id}`}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) hover:underline"
            >
              후보자 상세 보기 →
            </Link>
          )}
        </>
      )}

      {/* 개표 모드 — 당선자에 한해 공약을 노출(당선자 공약 확인 요청). 낙선자는 결과만 표시 */}
      {resultMode && isWon && c.pledges.length > 0 && (
        <div className="mt-3">
          <h4 className="mb-1 text-xs font-bold text-(--color-text-tertiary)">주요 공약</h4>
          <ul className="space-y-1">
            {c.pledges.map((p, i) => (
              <li key={i} className="text-xs text-(--color-text-secondary)">
                <span className="font-medium text-(--color-text-primary)">{p.title}</span>
              </li>
            ))}
          </ul>
          {year && (
            <Link
              href={`/local-elections/${year}/candidates/${c.id}`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-(--color-primary) hover:underline"
            >
              공약 자세히 보기 →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
