import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import CongressWrapper from "@/common/CongressWrapper";
import LawmakerCandidatesInner from "@/components/elections/LawmakerCandidatesInner";

export const metadata: Metadata = {
  title: "국회의원 출신 후보 성적표 — 6·3 지방선거 의정활동 비교",
  description:
    "6·3 지방선거에 출마한 전·현직 국회의원의 의정활동 성적표를 비교하세요. 출석률, 표결참여율, 법안 발의·가결 건수, 재산 정보를 한눈에 제공합니다.",
  alternates: {
    canonical: "https://www.lawmake.kr/elections/2026-06-03/lawmaker-candidates",
  },
  openGraph: {
    title: "국회의원 출신 후보 성적표 — 6·3 지방선거",
    description: "출마한 전·현직 국회의원의 출석률, 표결참여율, 법안 발의·가결, 재산을 비교합니다.",
    url: "https://www.lawmake.kr/elections/2026-06-03/lawmaker-candidates",
  },
};

export default async function LawmakerCandidatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <BreadcrumbJsonLd
        items={[
          { name: "홈", href: "/" },
          { name: "6·3 선거", href: `/elections/${id}` },
          { name: "의원 출신 후보 성적표", href: `/elections/${id}/lawmaker-candidates` },
        ]}
      />

      <section>
        <p className="text-sm font-medium text-(--color-primary)">
          <Link href={`/elections/${id}`} className="hover:underline">
            ← 6·3 선거 홈
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">국회의원 출신 후보 성적표</h1>
        <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
          6·3 지방선거에 출마한 전·현직 국회의원의 의정활동 성적을 비교하세요. 의원 시절 출석률,
          표결참여율, 법안 발의·가결 건수, 재산 정보를 한눈에 제공합니다.
        </p>
      </section>

      <CongressWrapper
        fallback={
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-tertiary)"
              />
            ))}
          </div>
        }
      >
        <LawmakerCandidatesInner electionId={id} />
      </CongressWrapper>
    </div>
  );
}
