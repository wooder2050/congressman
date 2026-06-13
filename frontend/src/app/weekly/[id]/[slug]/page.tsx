import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getWeeklyArticle, getWeeklyArticleIds } from "@/data/weekly";
import JsonLd from "@/components/seo/JsonLd";

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  passed: {
    text: "통과",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  committee: {
    text: "심사중",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  pending: {
    text: "계류",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
  },
  rejected: {
    text: "폐기",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
};

interface Props {
  params: Promise<{ id: string; slug: string }>;
}

export async function generateStaticParams() {
  const ids = getWeeklyArticleIds();
  const params: { id: string; slug: string }[] = [];
  for (const id of ids) {
    const article = getWeeklyArticle(id);
    if (!article) continue;
    for (const bill of article.featuredBills) {
      if (bill.slug && bill.article) {
        params.push({ id, slug: bill.slug });
      }
    }
    for (const hl of article.highlights) {
      if (hl.slug && hl.article) {
        params.push({ id, slug: hl.slug });
      }
    }
  }
  return params;
}

/** featuredBills + highlights에서 slug로 기사 데이터를 찾기 */
function findArticleBySlug(article: ReturnType<typeof getWeeklyArticle>, slug: string) {
  if (!article) return null;
  const bill = article.featuredBills.find((b) => b.slug === slug);
  if (bill?.article) {
    return {
      title: bill.title,
      description: bill.description,
      status: bill.status,
      proposer: bill.proposer,
      voteResult: bill.voteResult,
      sources: bill.sources,
      article: bill.article,
    };
  }
  const hl = article.highlights.find((h) => h.slug === slug);
  if (hl?.article) {
    return {
      title: hl.title,
      description: hl.description,
      status: null,
      proposer: undefined,
      voteResult: undefined,
      sources: hl.sources,
      article: hl.article,
    };
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = await params;
  const article = getWeeklyArticle(id);
  const decodedSlug = decodeURIComponent(slug);
  const found = findArticleBySlug(article, decodedSlug);
  if (!found || !article) return {};
  const title = `${found.title} | ${article.title} 주간 국회 뉴스`;
  const url = `https://www.lawmake.kr/weekly/${id}/${decodedSlug}`;
  return {
    title,
    description: found.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: found.description,
      type: "article",
      url,
      publishedTime: article.publishedDate,
    },
  };
}

export default async function WeeklyArticlePage({ params }: Props) {
  const { id, slug } = await params;
  const weeklyArticle = getWeeklyArticle(id);
  if (!weeklyArticle) notFound();

  const decodedSlug = decodeURIComponent(slug);
  const bill = findArticleBySlug(weeklyArticle, decodedSlug);
  if (!bill || !bill.article) notFound();

  const status = bill.status ? STATUS_LABEL[bill.status] : null;
  const youtubeSources = (bill.sources ?? []).filter((s) => s.type === "youtube");
  const articleSources = (bill.sources ?? []).filter((s) => s.type === "article");

  const articleUrl = `https://www.lawmake.kr/weekly/${id}/${decodedSlug}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: bill.title,
          description: bill.description,
          datePublished: weeklyArticle.publishedDate,
          url: articleUrl,
          author: {
            "@type": "Organization",
            name: "lawmake",
            url: "https://www.lawmake.kr",
          },
          publisher: {
            "@type": "Organization",
            name: "lawmake",
            url: "https://www.lawmake.kr",
          },
          mainEntityOfPage: articleUrl,
        }}
      />
      {/* 네비게이션 */}
      <Link
        href={`/weekly/${id}`}
        className="mb-6 inline-flex items-center text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-primary)"
      >
        ← {weeklyArticle.title} 주간뉴스로 돌아가기
      </Link>

      {/* 헤더 */}
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {status && (
            <span className={`rounded px-2 py-0.5 text-xs font-bold ${status.className}`}>
              {status.text}
            </span>
          )}
          <span className="text-xs text-(--color-text-tertiary)">{weeklyArticle.period}</span>
          {bill.proposer && (
            <span className="text-xs text-(--color-text-tertiary)">{bill.proposer}</span>
          )}
        </div>
        <h1 className="text-2xl leading-tight font-bold text-(--color-text-primary) sm:text-3xl">
          {bill.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-(--color-text-secondary)">
          {bill.description}
        </p>

        {/* 표결 결과 */}
        {bill.voteResult && (
          <div className="mt-4 flex gap-3">
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center dark:bg-emerald-900/20">
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {bill.voteResult.yes}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400">찬성</div>
            </div>
            <div className="rounded-lg bg-red-50 px-3 py-2 text-center dark:bg-red-900/20">
              <div className="text-lg font-bold text-red-700 dark:text-red-300">
                {bill.voteResult.no}
              </div>
              <div className="text-[11px] text-red-600 dark:text-red-400">반대</div>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-center dark:bg-gray-800/50">
              <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                {bill.voteResult.abstain}
              </div>
              <div className="text-[11px] text-gray-600 dark:text-gray-400">기권</div>
            </div>
          </div>
        )}
      </header>

      {/* 기사 본문 */}
      <article className="space-y-8">
        {bill.article.map((section, i) => (
          <section key={i}>
            <h2 className="mb-3 text-xl font-bold text-(--color-text-primary)">
              {section.heading}
            </h2>
            {section.body.split("\n\n").map((para, j) => (
              <p
                key={j}
                className="mt-2 text-base leading-relaxed text-(--color-text-secondary) first:mt-0"
              >
                {para}
              </p>
            ))}
          </section>
        ))}
      </article>

      {/* 출처 */}
      {(youtubeSources.length > 0 || articleSources.length > 0) && (
        <div className="mt-10 border-t border-(--color-border) pt-6">
          <h3 className="mb-3 text-sm font-semibold text-(--color-text-tertiary)">관련 출처</h3>

          {/* 유튜브 영상 */}
          {youtubeSources.length > 0 && (
            <div className="space-y-3">
              {youtubeSources.map((s, i) => {
                const videoId = s.url.match(/(?:watch\?v=|youtu\.be\/)([\w-]+)/)?.[1];
                return videoId ? (
                  <div key={i}>
                    <div className="aspect-video overflow-hidden rounded-lg">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={s.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                    <p className="mt-1 text-xs text-(--color-text-tertiary)">{s.title}</p>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {/* 기사 링크 */}
          {articleSources.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {articleSources.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-(--color-primary) no-underline hover:underline"
                >
                  {s.title} →
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 하단 네비게이션 */}
      <div className="mt-10 border-t border-(--color-border) pt-6">
        <Link
          href={`/weekly/${id}`}
          className="text-sm font-semibold text-(--color-primary) no-underline hover:underline"
        >
          ← {weeklyArticle.title} 주간뉴스 전체 보기
        </Link>
      </div>
    </div>
  );
}
