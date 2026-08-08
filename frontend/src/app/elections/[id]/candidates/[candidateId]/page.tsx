import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import JsonLd from "@/components/seo/JsonLd";
import CongressWrapper from "@/common/CongressWrapper";
import ByElectionCandidateDetailInner from "@/components/elections/ByElectionCandidateDetailInner";
import { getElectionCandidate } from "@/lib/api";

export const revalidate = 2592000; // 30d — 개표 종료(6/4) 후 데이터 확정. 봇 재크롤링마다 재생성돼 ISR Write가 과다해 상향
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ id: string; candidateId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, candidateId } = await params;
  const candidate = await getElectionCandidate({
    id,
    candidateId: Number(candidateId),
  });

  if (!candidate) return { title: "후보자 정보 없음" };

  const partyName = candidate.party?.name ?? "무소속";
  const title = `${candidate.name} (${partyName}) — ${candidate.district.district} 재보궐 후보`;
  const description = `6·3 재보궐선거 ${candidate.district.district} ${partyName} ${candidate.name} 후보 — 경력·학력·공약·재산·병역 등 후보자 정보를 확인하세요.`;
  const isThin = !candidate.career && candidate.pledges.length === 0;

  return {
    title,
    description,
    robots: isThin ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: `https://www.lawmake.kr/elections/${id}/candidates/${candidateId}`,
    },
    openGraph: { title, description },
  };
}

export default async function ByElectionCandidatePage({ params }: Props) {
  const { id, candidateId } = await params;
  const numericId = Number(candidateId);
  const candidate = await getElectionCandidate({ id, candidateId: numericId });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BreadcrumbJsonLd
        items={[
          { name: "홈", href: "/" },
          { name: "6·3 선거", href: `/elections/${id}` },
          ...(candidate?.district
            ? [
                {
                  name: candidate.district.district,
                  href: `/elections/${id}/races/${candidate.district.id}`,
                },
              ]
            : []),
          {
            name: candidate?.name ?? "후보자",
            href: `/elections/${id}/candidates/${candidateId}`,
          },
        ]}
      />
      {candidate && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Person",
            name: candidate.name,
            ...(candidate.party ? { affiliation: candidate.party.name } : {}),
          }}
        />
      )}

      <section>
        <p className="text-sm font-medium text-(--color-primary)">
          <Link href={`/elections/${id}`} className="hover:underline">
            ← 6·3 선거 홈
          </Link>
        </p>
      </section>

      <CongressWrapper
        fallback={
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-tertiary)"
              />
            ))}
          </div>
        }
      >
        <ByElectionCandidateDetailInner electionId={id} candidateId={numericId} />
      </CongressWrapper>
    </div>
  );
}
