import type { Metadata } from "next";
import Link from "next/link";
import { getTermsByCategory, getAllTerms } from "@/lib/glossary";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "국회 용어 사전 — 발의 뜻 · 상정 뜻 · 대안반영폐기 · 본회의 뜻 쉽게 설명",
  description:
    "국회 뉴스에 자주 나오는 입법 용어를 쉽게 풀어 설명합니다. 발의, 상정, 대안반영폐기, 본회의, 가결, 부결 등 법안·표결·위원회 관련 용어를 한곳에서 확인하세요.",
  alternates: { canonical: "https://www.lawmake.kr/glossary" },
  openGraph: {
    title: "국회 용어 사전 — 발의 · 상정 · 대안반영폐기 · 본회의 뜻",
    description:
      "국회 뉴스에 자주 나오는 입법 용어 해설. 발의, 상정, 대안반영폐기, 본회의, 가결, 부결 등 핵심 용어를 쉽게 풀어 설명합니다.",
    url: "https://www.lawmake.kr/glossary",
  },
};

export default function GlossaryPage() {
  const categories = [
    { id: "bill", name: "법안 관련", icon: "📜" },
    { id: "vote", name: "표결 관련", icon: "🗳️" },
    { id: "activity", name: "의정활동", icon: "🏛️" },
    { id: "committee", name: "위원회", icon: "👥" },
  ] as const;

  const allTerms = getAllTerms();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: allTerms.map((t) => ({
            "@type": "Question",
            name: `${t.term}이란?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: t.fullDesc || t.shortDesc,
            },
          })),
        }}
      />

      {/* 헤더 */}
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">국회 용어 사전</h1>
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          국회와 의정활동 관련 전문 용어를 쉽게 풀이했습니다.
        </p>
      </section>

      {/* 카테고리별 용어 */}
      {categories.map((category) => {
        const terms = getTermsByCategory(category.id);
        if (terms.length === 0) return null;

        return (
          <section key={category.id} className="space-y-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <span>{category.icon}</span>
              {category.name}
            </h2>

            <div className="space-y-3">
              {terms.map((term) => (
                <Link
                  key={term.term}
                  href={`/glossary/${encodeURIComponent(term.term)}`}
                  className="block rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 no-underline transition-colors hover:bg-(--color-bg-hover)"
                >
                  <h3 className="text-lg font-bold text-(--color-text-primary)">{term.term}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
                    {term.fullDesc || term.shortDesc}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* 안내 */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-6">
        <h3 className="text-lg font-bold text-(--color-text-primary)">
          💡 용어 설명이 필요하신가요?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
          사이트 곳곳에서{" "}
          <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-(--color-bg-tertiary) text-[9px] font-bold text-(--color-text-tertiary)">
            ?
          </span>{" "}
          아이콘을 클릭하시면 해당 용어의 간단한 설명을 확인하실 수 있습니다.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
          더 많은 용어가 필요하거나 설명이 어려우신 경우{" "}
          <a
            href="https://github.com/wooder2050/congressman/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-(--color-primary) underline"
          >
            GitHub 이슈
          </a>
          로 알려주시면 추가하겠습니다.
        </p>
      </section>
    </div>
  );
}
