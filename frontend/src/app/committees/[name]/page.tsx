import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import CommitteeDetailInner from "@/components/committees/CommitteeDetailInner";
import RelatedEditorial from "@/components/ui/related-editorial";

interface CommitteeDetailPageProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ term?: string }>;
}

export async function generateMetadata({ params }: CommitteeDetailPageProps): Promise<Metadata> {
  const { name } = await params;
  const committeeName = decodeURIComponent(name);
  const description = `22대 국회 ${committeeName} 소속 위원 명단, 법안 심사·처리 현황, 회의록을 확인하세요. ${committeeName}의 최근 활동과 안건 정보를 제공합니다.`;
  return {
    title: `${committeeName} - 소속 위원·법안·회의록`,
    description,
    alternates: {
      canonical: `https://www.lawmake.kr/committees/${encodeURIComponent(committeeName)}`,
    },
    openGraph: {
      title: `${committeeName} | 국회 위원회`,
      description,
      url: `https://www.lawmake.kr/committees/${encodeURIComponent(committeeName)}`,
    },
    twitter: { card: "summary", title: `${committeeName} 위원회`, description },
  };
}

export default async function CommitteeDetailPage({
  params,
  searchParams,
}: CommitteeDetailPageProps) {
  const [{ name }, sp] = await Promise.all([params, searchParams]);
  const committeeName = decodeURIComponent(name);
  const termId = Number(sp.term) || 22;

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <CongressWrapper key={`${committeeName}-${termId}`} fallback={<CommitteeDetailSkeleton />}>
        <CommitteeDetailInner name={committeeName} termId={termId} />
      </CongressWrapper>
      <RelatedEditorial
        title="위원회 제도를 이해하는 해설"
        links={[
          {
            kind: "분석",
            label: "두 달 멈춘 국회 — 원 구성 협상은 왜 늦어졌나",
            href: "/weekly/2026-07-w2/원-구성-제헌절-시한-도과",
          },
          {
            kind: "용어",
            label: "체계자구심사 — 법사위가 '제2의 관문'인 이유",
            href: "/glossary/체계자구심사",
          },
          {
            kind: "용어",
            label: "안건조정위원회 — 위원회 단계의 지연 카드",
            href: "/glossary/안건조정위원회",
          },
        ]}
      />
    </div>
  );
}

function CommitteeDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded bg-(--color-bg-tertiary)" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-(--color-bg-tertiary)" />
        ))}
      </div>
      <div className="h-6 w-32 rounded bg-(--color-bg-tertiary)" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-(--color-bg-tertiary)" />
        ))}
      </div>
      <div className="h-6 w-32 rounded bg-(--color-bg-tertiary)" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-(--color-bg-tertiary)" />
        ))}
      </div>
    </div>
  );
}
