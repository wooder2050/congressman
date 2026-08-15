import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "@/components/ads/AdSlot";
import JsonLd from "@/components/seo/JsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { getTermBySlug, getAllTermSlugs, getTermsByCategory } from "@/lib/glossary";

interface GlossaryTermPageProps {
  params: Promise<{ term: string }>;
}

export function generateStaticParams() {
  return getAllTermSlugs().map(({ slug }) => ({ term: slug }));
}

const TERM_SEO_OVERRIDES: Record<string, { title: string; description: string }> = {
  alternative_discard: {
    title: "대안반영폐기 뜻, 의미, 사례 — 국회 법안 용어 쉽게 설명",
    description:
      "대안반영폐기란 법안의 핵심 내용이 위원회 대안에 반영되어, 원래 법안만 형식적으로 폐기 처리된 것입니다. 부정적 폐기가 아닌 긍정적 결과입니다.",
  },
  filibuster: {
    title: "필리버스터 뜻, 종결 요건, 실제 사례 — 무제한토론 쉽게 설명",
    description:
      "필리버스터(무제한토론)는 소수당이 표결을 늦추는 합법적 의사진행 방해입니다. 시작 요건, 종결 요건(재적 5분의 3), 회기 종료 시 자동 종결과 2026년 실제 사례까지 정리했습니다.",
  },
  fast_track: {
    title: "패스트트랙(신속처리안건) 뜻, 기간, 지정 요건 — 국회 용어 쉽게 설명",
    description:
      "패스트트랙은 쟁점 법안을 최장 330일 안에 본회의 표결까지 보내는 신속처리안건 제도입니다. 지정 요건(재적 5분의 3)과 단계별 기간, 2026년 기간 단축 개정 논의까지 정리했습니다.",
  },
  negotiating_group: {
    title: "교섭단체 뜻, 요건 20인, 권한 — 국회 용어 쉽게 설명",
    description:
      "교섭단체는 소속 의원 20인 이상으로 구성되어 국회 의사일정과 위원장 배분을 협상하는 단위입니다. 왜 20석이 소수 정당에 사활이 걸린 숫자인지 설명합니다.",
  },
  parliamentary_audit: {
    title: "국정감사와 국정조사의 차이 — 국회 용어 쉽게 설명",
    description:
      "국정감사는 매년 정기회 전 국정 전반을 점검하는 정례 절차, 국정조사는 특정 사안을 요구가 있을 때 조사하는 절차입니다. 두 제도의 차이를 쉽게 정리했습니다.",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  bill: "법안 관련",
  vote: "표결 관련",
  activity: "의정활동",
  committee: "위원회",
};

export async function generateMetadata({ params }: GlossaryTermPageProps): Promise<Metadata> {
  const { term: slug } = await params;
  const result = getTermBySlug(slug);
  if (!result) return { title: "용어 없음" };

  const { key, term } = result;
  const override = TERM_SEO_OVERRIDES[key];

  const title = override?.title ?? `${term.term} 뜻 — 국회 용어 쉽게 설명`;
  const rawDesc =
    override?.description ??
    `"${term.term}"이란 ${term.shortDesc}${term.fullDesc ? ` ${term.fullDesc}` : ""}`;
  const description = rawDesc.slice(0, 155) + (rawDesc.length > 155 ? "…" : "");

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.lawmake.kr/glossary/${encodeURIComponent(term.term)}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.lawmake.kr/glossary/${encodeURIComponent(term.term)}`,
    },
  };
}

export default async function GlossaryTermPage({ params }: GlossaryTermPageProps) {
  const { term: slug } = await params;
  const result = getTermBySlug(slug);
  if (!result) notFound();

  const { term } = result;
  const relatedTerms = getTermsByCategory(term.category).filter((t) => t.term !== term.term);

  const faqEntities = [
    {
      "@type": "Question",
      name: `${term.term}이란 무엇인가요?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: term.fullDesc || term.shortDesc,
      },
    },
  ];
  if (term.whyItMatters) {
    faqEntities.push({
      "@type": "Question",
      name: `${term.term}은 왜 중요한가요?`,
      acceptedAnswer: { "@type": "Answer", text: term.whyItMatters },
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqEntities,
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "홈", href: "/" },
          { name: "국회 용어 사전", href: "/glossary" },
          { name: term.term, href: `/glossary/${encodeURIComponent(term.term)}` },
        ]}
      />

      <Link
        href="/glossary"
        className="inline-flex items-center gap-1 text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
      >
        <span>&#8592;</span> 용어 사전으로 돌아가기
      </Link>

      <article>
        <span className="mb-2 inline-block rounded-full bg-(--color-bg-secondary) px-3 py-1 text-xs font-medium text-(--color-text-secondary)">
          {CATEGORY_LABELS[term.category]}
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight">{term.term}</h1>
        <p className="mt-2 text-lg text-(--color-text-secondary)">{term.shortDesc}</p>
        {term.fullDesc && (
          <div className="mt-6 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-6 text-base leading-relaxed text-(--color-text-primary)">
            {term.fullDesc}
          </div>
        )}
      </article>

      {term.whyItMatters && (
        <section>
          <h2 className="text-lg font-bold">왜 중요한가</h2>
          <p className="mt-3 rounded-xl border-l-4 border-(--color-primary) bg-(--color-bg-secondary) p-5 text-base leading-relaxed text-(--color-text-primary)">
            {term.whyItMatters}
          </p>
        </section>
      )}

      {term.example && (
        <section>
          <h2 className="text-lg font-bold">실제 사례</h2>
          <div className="mt-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="font-semibold text-(--color-text-primary)">{term.example.title}</p>
            <p className="mt-2 text-base leading-relaxed text-(--color-text-secondary)">
              {term.example.description}
            </p>
            {term.example.href && (
              <Link
                href={term.example.href}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) hover:underline"
              >
                관련 페이지 보기 →
              </Link>
            )}
          </div>
        </section>
      )}

      {term.confusedWith && term.confusedWith.length > 0 && (
        <section>
          <h2 className="text-lg font-bold">혼동하기 쉬운 용어</h2>
          <div className="mt-3 space-y-2">
            {term.confusedWith.map((c) => (
              <div key={c.term} className="rounded-lg border border-(--color-border-primary) p-4">
                <Link
                  href={`/glossary/${encodeURIComponent(c.term)}`}
                  className="font-semibold text-(--color-primary) no-underline hover:underline"
                >
                  {c.term}
                </Link>
                <p className="mt-1 text-sm leading-relaxed text-(--color-text-secondary)">
                  {c.note}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {relatedTerms.length > 0 && (
        <section>
          <h2 className="text-lg font-bold">관련 용어</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {relatedTerms.map((rt) => (
              <Link
                key={rt.term}
                href={`/glossary/${encodeURIComponent(rt.term)}`}
                className="rounded-lg border border-(--color-border-primary) p-3 no-underline transition-colors hover:bg-(--color-bg-hover)"
              >
                <p className="font-semibold text-(--color-text-primary)">{rt.term}</p>
                <p className="mt-1 text-sm text-(--color-text-secondary)">{rt.shortDesc}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl bg-(--color-bg-secondary) p-6">
        <h2 className="text-lg font-bold">더 알아보기</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {(
            term.relatedLinks ?? [
              { label: "법안 통과 절차 알아보기", href: "/guide" },
              { label: "법안 검색하기", href: "/bills" },
              { label: "표결 현황 보기", href: "/votes" },
            ]
          ).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-hover)"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      {(term.sources?.length || term.reviewedAt) && (
        <footer className="border-t border-(--color-border-primary) pt-4 text-sm text-(--color-text-tertiary)">
          {term.sources && term.sources.length > 0 && (
            <p>
              공식 출처:{" "}
              {term.sources.map((s, i) => (
                <span key={s.href}>
                  {i > 0 && " · "}
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-(--color-text-secondary)"
                  >
                    {s.label}
                  </a>
                </span>
              ))}
            </p>
          )}
          {term.reviewedAt && (
            <p className="mt-1">
              최종 검토 {term.reviewedAt} · lawmake 편집팀이 법령 원문을 확인해 작성했습니다.
            </p>
          )}
        </footer>
      )}
      {/* 광고: 편집형 페이지(수작업 콘텐츠)라 광고 표면에 포함 */}
      <AdSlot />
    </div>
  );
}
