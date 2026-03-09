import Link from "next/link";
import type { WeeklyArticle, FeaturedBill, WeeklyHighlight } from "@/data/weekly/types";

const STATUS_MAP: Record<string, { label: string; color: string; textColor: string }> = {
  passed: { label: "가결", color: "#0F766E", textColor: "#FFFFFF" },
  pending: { label: "계류", color: "#737373", textColor: "#FFFFFF" },
  committee: { label: "위원회 심사", color: "#111111", textColor: "#FFFFFF" },
  rejected: { label: "부결", color: "#DC2626", textColor: "#FFFFFF" },
};

const CATEGORY_MAP: Record<string, { label: string; emoji: string }> = {
  vote: { label: "표결", emoji: "🗳️" },
  bill: { label: "법안", emoji: "📋" },
  committee: { label: "위원회", emoji: "🏛️" },
  politics: { label: "정치", emoji: "⚡" },
  economy: { label: "경제", emoji: "📈" },
};

interface WeeklyDetailContentProps {
  article: WeeklyArticle;
}

function FeaturedBillCard({ bill }: { bill: FeaturedBill }) {
  const status = STATUS_MAP[bill.status] ?? STATUS_MAP.pending;

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-(--color-text-primary)">{bill.title}</h3>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: status.color, color: status.textColor }}
        >
          {status.label}
        </span>
      </div>

      {bill.proposer && (
        <p className="mt-1.5 text-xs text-(--color-text-tertiary)">{bill.proposer}</p>
      )}

      <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
        {bill.description}
      </p>

      {bill.voteResult && (
        <div className="mt-4">
          <div className="flex gap-4 text-sm">
            <span className="text-(--color-text-secondary)">
              찬성{" "}
              <span className="font-bold text-green-600">{bill.voteResult.yes}</span>
            </span>
            <span className="text-(--color-text-secondary)">
              반대{" "}
              <span className="font-bold text-red-600">{bill.voteResult.no}</span>
            </span>
            <span className="text-(--color-text-secondary)">
              기권{" "}
              <span className="font-bold text-(--color-text-tertiary)">
                {bill.voteResult.abstain}
              </span>
            </span>
          </div>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full">
            <div
              className="bg-green-500"
              style={{
                width: `${(bill.voteResult.yes / (bill.voteResult.yes + bill.voteResult.no + bill.voteResult.abstain)) * 100}%`,
              }}
            />
            <div
              className="bg-red-500"
              style={{
                width: `${(bill.voteResult.no / (bill.voteResult.yes + bill.voteResult.no + bill.voteResult.abstain)) * 100}%`,
              }}
            />
            <div
              className="bg-gray-300"
              style={{
                width: `${(bill.voteResult.abstain / (bill.voteResult.yes + bill.voteResult.no + bill.voteResult.abstain)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {bill.billId && (
        <div className="mt-3">
          <Link
            href={`/bills/${bill.billId}`}
            className="text-sm font-semibold text-(--color-primary) no-underline"
          >
            법안 상세 보기 →
          </Link>
        </div>
      )}

      {bill.sources && bill.sources.length > 0 && (() => {
        const youtubeLinks = bill.sources!.filter((s) => s.type === "youtube");
        const articleLinks = bill.sources!.filter((s) => s.type !== "youtube");

        return (
          <div className="mt-4 border-t border-(--color-border-primary) pt-3">
            {youtubeLinks.length > 0 && (
              <div className="mb-2">
                <p className="mb-1.5 text-xs font-semibold text-(--color-text-tertiary)">
                  관련 영상
                </p>
                <ul className="space-y-1.5">
                  {youtubeLinks.map((source, i) => (
                    <li key={i}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-(--color-primary) no-underline hover:underline"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="shrink-0 text-red-500"
                        >
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {articleLinks.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold text-(--color-text-tertiary)">
                  관련 기사
                </p>
                <ul className="space-y-1">
                  {articleLinks.map((source, i) => (
                    <li key={i}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-(--color-primary) no-underline hover:underline"
                      >
                        {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

function HighlightItem({ highlight }: { highlight: WeeklyHighlight }) {
  const cat = CATEGORY_MAP[highlight.category] ?? CATEGORY_MAP.politics;

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg">{cat.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-(--color-text-primary)">{highlight.title}</h3>
            <span className="shrink-0 rounded-full bg-(--color-bg-secondary) px-2 py-0.5 text-[0.65rem] text-(--color-text-tertiary)">
              {cat.label}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-(--color-text-secondary)">
            {highlight.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WeeklyDetailContent({ article }: WeeklyDetailContentProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* 헤더 */}
      <section>
        <Link
          href="/weekly"
          className="mb-4 inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
        >
          ← 주간 뉴스 목록
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {article.title} 주간 국회 뉴스
        </h1>
        <p className="mt-2 text-sm text-(--color-text-tertiary)">{article.period}</p>
        <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
          {article.summary}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-(--color-bg-secondary) px-2.5 py-0.5 text-xs text-(--color-text-secondary)"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* 주간 통계 */}
      {article.stats && (
        <section>
          <div className="grid grid-cols-3 gap-3">
            {article.stats.billsPassed != null && (
              <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-center">
                <p className="text-2xl font-bold text-teal-600">{article.stats.billsPassed}건</p>
                <p className="mt-1 text-xs text-(--color-text-tertiary)">법안 통과</p>
              </div>
            )}
            {article.stats.votesHeld != null && (
              <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-center">
                <p className="text-2xl font-bold text-(--color-primary)">{article.stats.votesHeld}건</p>
                <p className="mt-1 text-xs text-(--color-text-tertiary)">본회의 표결</p>
              </div>
            )}
            {article.stats.committeeMeetings != null && (
              <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-center">
                <p className="text-2xl font-bold text-(--color-text-primary)">
                  {article.stats.committeeMeetings}건
                </p>
                <p className="mt-1 text-xs text-(--color-text-tertiary)">위원회 회의</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 주목할 만한 법안 */}
      {article.featuredBills.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">주목할 만한 법안</h2>
          <div className="space-y-4">
            {article.featuredBills.map((bill, i) => (
              <FeaturedBillCard key={i} bill={bill} />
            ))}
          </div>
        </section>
      )}

      {/* 주간 하이라이트 */}
      {article.highlights.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">이번 주 하이라이트</h2>
          <div className="space-y-3">
            {article.highlights.map((highlight, i) => (
              <HighlightItem key={i} highlight={highlight} />
            ))}
          </div>
        </section>
      )}

      {/* 하단 CTA */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-6">
        <h2 className="text-lg font-bold text-(--color-text-primary)">직접 확인해 보세요</h2>
        <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
          이번 주 소개된 법안과 표결의 상세 내용을 확인할 수 있습니다.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href="/bills"
            className="inline-flex items-center rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
          >
            법안 목록 보기
          </Link>
          <Link
            href="/votes"
            className="inline-flex items-center rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            표결 현황 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
