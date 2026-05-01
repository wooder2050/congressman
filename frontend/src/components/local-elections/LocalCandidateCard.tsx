import Image from "next/image";
import type { LocalElectionCandidateDetail } from "@/types";

interface Props {
  candidate: LocalElectionCandidateDetail;
}

export default function LocalCandidateCard({ candidate: c }: Props) {
  const partyColor = c.party?.color ?? "#999";

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
      {/* 헤더: 사진 + 이름 + 정당 */}
      <div className="flex gap-3">
        <div
          className="relative size-16 shrink-0 overflow-hidden rounded-full border-2"
          style={{ borderColor: partyColor }}
        >
          {c.photoUrl ? (
            <Image
              src={c.photoUrl}
              alt={c.name}
              fill
              className="object-cover"
              unoptimized
            />
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
            <h3 className="truncate text-base font-bold text-(--color-text-primary)">
              {c.name}
            </h3>
            {c.isWinner && (
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-[11px] font-bold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                당선
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-(--color-text-secondary)">
            {c.party?.name ?? "무소속"}
          </p>
          {c.birthDate && (
            <p className="text-xs text-(--color-text-tertiary)">
              {c.birthDate}생{c.gender ? ` · ${c.gender}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* 득표 결과 (개표 후) */}
      {c.voteCount != null && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-(--color-bg-secondary) px-3 py-2">
          <span className="text-sm font-bold text-(--color-text-primary)">
            {c.voteCount.toLocaleString()}표
          </span>
          {c.voteRate != null && (
            <span className="text-xs text-(--color-text-secondary)">
              ({c.voteRate.toFixed(1)}%)
            </span>
          )}
        </div>
      )}

      {/* 슬로건 */}
      {c.slogan && (
        <p className="mt-3 text-sm italic text-(--color-text-secondary)">
          &ldquo;{c.slogan}&rdquo;
        </p>
      )}

      {/* 경력 */}
      {c.career && (
        <div className="mt-3">
          <h4 className="mb-1 text-xs font-bold text-(--color-text-tertiary)">
            경력
          </h4>
          <p className="whitespace-pre-line text-xs leading-relaxed text-(--color-text-secondary)">
            {c.career}
          </p>
        </div>
      )}

      {/* 학력 */}
      {c.education && (
        <div className="mt-2">
          <h4 className="mb-1 text-xs font-bold text-(--color-text-tertiary)">
            학력
          </h4>
          <p className="text-xs text-(--color-text-secondary)">{c.education}</p>
        </div>
      )}

      {/* 공약 */}
      {c.pledges.length > 0 && (
        <div className="mt-3">
          <h4 className="mb-1 text-xs font-bold text-(--color-text-tertiary)">
            주요 공약
          </h4>
          <ul className="space-y-1">
            {c.pledges.map((p, i) => (
              <li key={i} className="text-xs text-(--color-text-secondary)">
                <span className="font-medium text-(--color-text-primary)">
                  {p.title}
                </span>
                {p.description && (
                  <span className="text-(--color-text-tertiary)">
                    {" "}— {p.description}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 재산 */}
      {c.assets && (
        <div className="mt-2">
          <h4 className="mb-1 text-xs font-bold text-(--color-text-tertiary)">
            재산
          </h4>
          <p className="text-xs text-(--color-text-secondary)">{c.assets}</p>
        </div>
      )}
    </div>
  );
}
