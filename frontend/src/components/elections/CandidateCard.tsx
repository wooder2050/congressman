import Image from "next/image";
import Link from "next/link";
import type { ElectionCandidate } from "@/types";
import CandidateDisclosureSection from "@/components/elections/CandidateDisclosureSection";

function CandidateAvatar({
  name,
  photoUrl,
  partyColor,
}: {
  name: string;
  photoUrl: string | null;
  partyColor: string;
}) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={80}
        height={80}
        className="h-16 w-16 shrink-0 rounded-full border-2 object-cover sm:h-20 sm:w-20"
        style={{ borderColor: partyColor }}
      />
    );
  }

  // 이니셜 fallback
  const initials = name.slice(0, 2);
  return (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white sm:h-20 sm:w-20 sm:text-xl"
      style={{ backgroundColor: partyColor || "#9ca3af" }}
    >
      {initials}
    </div>
  );
}

export default function CandidateCard({ candidate }: { candidate: ElectionCandidate }) {
  const partyColor = candidate.party?.color ?? "#9ca3af";
  const careers = candidate.career?.split("\n").filter(Boolean) ?? [];
  const pledges = candidate.pledges ?? [];

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 sm:p-5">
      {/* 상단: 사진 + 기본 정보 */}
      <div className="flex gap-4">
        <CandidateAvatar
          name={candidate.name}
          photoUrl={candidate.photoUrl}
          partyColor={partyColor}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {candidate.candidateNumber && (
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: partyColor }}
              >
                {candidate.candidateNumber}
              </span>
            )}
            <h4 className="text-lg font-bold text-(--color-text-primary)">{candidate.name}</h4>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: partyColor }}
            >
              {candidate.party?.name ?? "무소속"}
            </span>
            {candidate.birthDate && (
              <span className="text-xs text-(--color-text-tertiary)">{candidate.birthDate}생</span>
            )}
          </div>
          {candidate.slogan && (
            <p className="mt-2 text-sm text-(--color-text-secondary) italic">
              &ldquo;{candidate.slogan}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* 경력 */}
      {careers.length > 0 && (
        <div className="mt-4">
          <h5 className="mb-1.5 text-xs font-semibold text-(--color-text-tertiary)">주요 경력</h5>
          <ul className="space-y-0.5 text-sm text-(--color-text-secondary)">
            {careers.slice(0, 5).map((c) => (
              <li key={c} className="flex items-baseline gap-1.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-(--color-text-tertiary)" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 학력 */}
      {candidate.education && (
        <div className="mt-3">
          <h5 className="mb-1 text-xs font-semibold text-(--color-text-tertiary)">학력</h5>
          <p className="text-sm text-(--color-text-secondary)">{candidate.education}</p>
        </div>
      )}

      {/* 재산·병역·전과 등은 아래 CandidateDisclosureSection(중앙선관위 공개자료)에서 표시 */}

      {/* 핵심 공약 */}
      {pledges.length > 0 && (
        <div className="mt-4">
          <h5 className="mb-2 text-xs font-semibold text-(--color-text-tertiary)">핵심 공약</h5>
          <div className="space-y-2">
            {pledges.map((p) => (
              <div key={p.title} className="rounded-lg bg-(--color-bg-secondary) px-3 py-2">
                <div className="flex items-center gap-2">
                  {p.category && (
                    <span className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[10px] font-medium text-(--color-text-tertiary)">
                      {p.category}
                    </span>
                  )}
                  <span className="text-sm font-medium text-(--color-text-primary)">{p.title}</span>
                </div>
                {p.description && (
                  <p className="mt-1 text-xs leading-relaxed text-(--color-text-secondary)">
                    {p.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 후보자정보공개자료 (공직선거법 제49조) */}
      <CandidateDisclosureSection data={candidate} />

      {/* 기존 의원 프로필 링크 */}
      {candidate.memberIdRef && (
        <div className="mt-3 border-t border-(--color-border-primary) pt-3">
          <Link
            href={`/members/${candidate.memberIdRef}`}
            className="text-xs font-medium text-(--color-primary) no-underline hover:underline"
          >
            의정활동 기록 보기 →
          </Link>
        </div>
      )}
    </div>
  );
}
