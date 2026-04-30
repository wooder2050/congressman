import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { getTermBySlug, getAllTermSlugs, getTermsByCategory } from "@/lib/glossary";

interface GlossaryTermPageProps {
  params: Promise<{ term: string }>;
}

export function generateStaticParams() {
  return getAllTermSlugs().map(({ slug }) => ({ term: slug }));
}

export async function generateMetadata({ params }: GlossaryTermPageProps): Promise<Metadata> {
  const { term: slug } = await params;
  const result = getTermBySlug(slug);
  if (!result) return { title: "용어 없음" };

  const { term } = result;
  const title = `${term.term} 뜻 — 국회 용어 쉽게 설명`;
  const rawDesc = `"${term.term}"이란 ${term.shortDesc}${term.fullDesc ? ` ${term.fullDesc}` : ""}`;
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

const CATEGORY_LABELS: Record<string, string> = {
  bill: "법안 관련",
  vote: "표결 관련",
  activity: "의정활동",
  committee: "위원회",
};

export default async function GlossaryTermPage({ params }: GlossaryTermPageProps) {
  const { term: slug } = await params;
  const result = getTermBySlug(slug);
  if (!result) notFound();

  const { term } = result;
  const relatedTerms = getTermsByCategory(term.category).filter((t) => t.term !== term.term);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: `${term.term}이란 무엇인가요?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: term.fullDesc || term.shortDesc,
              },
            },
          ],
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
          <Link
            href="/guide"
            className="rounded-lg bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-hover)"
          >
            법안 통과 절차 알아보기
          </Link>
          <Link
            href="/bills"
            className="rounded-lg bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-hover)"
          >
            법안 검색하기
          </Link>
          <Link
            href="/votes"
            className="rounded-lg bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-hover)"
          >
            표결 현황 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
