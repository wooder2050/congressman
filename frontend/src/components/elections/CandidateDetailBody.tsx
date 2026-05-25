import Image from "next/image";
import Link from "next/link";
import type {
  CandidateAssetItem,
  CandidateDisclosure,
  CandidateLawmakerSummary,
  CandidatePledge,
} from "@/types";
import { proxyPhotoUrl } from "@/lib/photo";
import CandidateAssetBreakdown from "./CandidateAssetBreakdown";
import CandidateAssetPdfViewer from "./CandidateAssetPdfViewer";
import CandidateDisclosureSection from "./CandidateDisclosureSection";

/** 두 후보자 타입(재보궐·지방선거)이 공유하는 표시용 필드 */
export interface CandidateView extends CandidateDisclosure {
  name: string;
  party: { id: string; name: string; shortName: string; color: string } | null;
  photoUrl: string | null;
  birthDate: string | null;
  /** 지방선거 후보만 보유 */
  gender?: string | null;
  career: string | null;
  education: string | null;
  slogan: string | null;
  pledges: CandidatePledge[];
  candidateNumber: number | null;
  memberIdRef: string | null;
  /** 지방선거 득표 결과 — 개표 후에만 채워짐 */
  voteCount?: number | null;
  voteRate?: number | null;
  isWinner?: boolean;
  /** 항목별 재산 명세 — 22대 의원 출신은 opengirok 데이터로 채워짐 */
  assetItems?: CandidateAssetItem[];
  /** PDF→PNG 변환 미러 (Supabase Storage) — 인라인 미리보기용 */
  assetPagePngUrls?: string[];
}

/** "19700214" → "1970.02.14", 형식이 다르면 원본 반환 */
function formatBirthDate(value: string | null): string | null {
  if (!value) return null;
  const m = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : value;
}

interface Props {
  candidate: CandidateView;
  /** 선거 유형 라벨 (예: "도지사", "재보궐") */
  electionTypeLabel: string;
  /** 의정활동 요약 (전·현직 국회의원 후보만) */
  member: CandidateLawmakerSummary | null;
}

export default function CandidateDetailBody({ candidate: c, electionTypeLabel, member }: Props) {
  const partyColor = c.party?.color ?? "#9ca3af";
  const birth = formatBirthDate(c.birthDate);

  return (
    <div className="space-y-5">
      {/* 프로필 헤더 — 정당 컬러 배너 */}
      <section className="overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)">
        <div className="h-16" style={{ backgroundColor: partyColor }} />
        <div className="px-4 pb-4 sm:px-5">
          <div className="-mt-10 flex items-end gap-4">
            <div
              className="size-20 shrink-0 overflow-hidden rounded-full border-4 border-(--color-bg-primary) bg-(--color-bg-secondary)"
              style={{ borderColor: "var(--color-bg-primary)" }}
            >
              {c.photoUrl ? (
                <Image
                  src={proxyPhotoUrl(c.photoUrl)}
                  alt={c.name}
                  width={80}
                  height={80}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                <div
                  className="flex size-full items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: partyColor }}
                >
                  {c.name.slice(0, 1)}
                </div>
              )}
            </div>
            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-(--color-text-primary)">{c.name}</h1>
                {c.candidateNumber != null && (
                  <span
                    className="flex size-6 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: partyColor }}
                  >
                    {c.candidateNumber}
                  </span>
                )}
                {c.isWinner && (
                  <span className="rounded bg-green-100 px-1.5 py-0.5 text-[11px] font-bold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    당선
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span
              className="rounded px-2 py-0.5 text-xs font-bold text-white"
              style={{ backgroundColor: partyColor }}
            >
              {c.party?.name ?? "무소속"}
            </span>
            <span className="text-(--color-text-tertiary)">{electionTypeLabel} 후보</span>
            {birth && (
              <span className="text-(--color-text-secondary)">
                {birth}생{c.gender ? ` · ${c.gender}` : ""}
              </span>
            )}
          </div>

          {c.slogan && (
            <p
              className="mt-3 border-l-2 pl-3 text-sm text-(--color-text-secondary) italic"
              style={{ borderColor: partyColor }}
            >
              &ldquo;{c.slogan}&rdquo;
            </p>
          )}
        </div>
      </section>

      {/* 득표 결과 (개표 후) */}
      {c.voteCount != null && (
        <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 sm:p-5">
          <h2 className="mb-2 text-sm font-bold text-(--color-text-tertiary)">개표 결과</h2>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-(--color-text-primary)">
              {c.voteCount.toLocaleString()}표
            </span>
            {c.voteRate != null && (
              <span className="text-sm text-(--color-text-secondary)">
                득표율 {c.voteRate.toFixed(1)}%
              </span>
            )}
          </div>
        </section>
      )}

      {/* 의정활동 요약 — 전·현직 국회의원 후보 */}
      {member && member.hasActivity && (
        <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-(--color-text-primary)">
              국회의원 의정활동 요약
            </h2>
            <span className="text-xs text-(--color-text-tertiary)">22대 국회</span>
          </div>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryStat label="출석률" value={`${member.attendanceRate}%`} />
            <SummaryStat label="표결 참여율" value={`${member.voteParticipationRate}%`} />
            <SummaryStat label="대표발의" value={`${member.billCount}건`} />
            <SummaryStat
              label="발의안 가결률"
              value={member.billCount > 0 ? `${member.passRate}%` : "-"}
            />
          </dl>
          <Link
            href={`/members/${member.memberId}`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) hover:underline"
          >
            의정활동 상세 보기 →
          </Link>
        </section>
      )}

      {/* 핵심 공약 */}
      {c.pledges.length > 0 && (
        <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 sm:p-5">
          <h2 className="mb-3 text-base font-bold text-(--color-text-primary)">핵심 공약</h2>
          <ul className="space-y-2.5">
            {c.pledges.map((p, i) => (
              <li key={i} className="rounded-lg bg-(--color-bg-secondary) px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {p.category && (
                    <span className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-[10px] font-medium text-(--color-text-tertiary)">
                      {p.category}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-(--color-text-primary)">
                    {p.title}
                  </span>
                </div>
                {p.description && (
                  <p className="mt-1 text-xs leading-relaxed text-(--color-text-secondary)">
                    {p.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 경력 */}
      {c.career && (
        <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 sm:p-5">
          <h2 className="mb-2 text-base font-bold text-(--color-text-primary)">경력</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line text-(--color-text-secondary)">
            {c.career}
          </p>
        </section>
      )}

      {/* 학력 */}
      {c.education && (
        <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 sm:p-5">
          <h2 className="mb-2 text-base font-bold text-(--color-text-primary)">학력</h2>
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">{c.education}</p>
        </section>
      )}

      {/* 후보자정보공개자료 (공직선거법 제49조) */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 sm:p-5">
        <h2 className="text-base font-bold text-(--color-text-primary)">후보자정보공개자료</h2>
        <CandidateDisclosureSection data={c} />

        {/* 항목별 재산 명세 — opengirok 등 외부 데이터 매칭 시 */}
        {c.assetItems && c.assetItems.length > 0 && (
          <CandidateAssetBreakdown items={c.assetItems} declaredTotal={c.assetDeclared} />
        )}

        {/* 재산신고서 원문 — PNG 미러가 있으면 인라인 미리보기, 없으면 PDF 링크 폴백 */}
        {c.assetPagePngUrls && c.assetPagePngUrls.length > 0 ? (
          <CandidateAssetPdfViewer pageImageUrls={c.assetPagePngUrls} pdfUrls={c.assetPdfUrls} />
        ) : (
          c.assetPdfUrls &&
          c.assetPdfUrls.length > 0 && (
            <div className="mt-3 rounded-lg border border-(--color-border-secondary) bg-(--color-bg-secondary) p-3">
              <div className="flex items-center gap-1.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  className="text-(--color-text-tertiary)"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <h3 className="text-xs font-bold text-(--color-text-tertiary)">
                  재산신고서 원문 (중앙선관위 제출 서류)
                </h3>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.assetPdfUrls.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-(--color-border-primary) bg-(--color-bg-primary) px-2.5 py-1 text-xs font-medium text-(--color-primary) transition-colors hover:bg-(--color-bg-hover)"
                  >
                    {i + 1}쪽
                  </a>
                ))}
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-(--color-text-tertiary)">
                1쪽은 신고 항목 표지이며, 2쪽부터 항목별 금액 내역이 있습니다.
              </p>
            </div>
          )
        )}
      </section>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-(--color-bg-secondary) px-3 py-2.5 text-center">
      <dt className="text-xs text-(--color-text-tertiary)">{label}</dt>
      <dd className="mt-0.5 text-lg font-bold text-(--color-text-primary)">{value}</dd>
    </div>
  );
}
