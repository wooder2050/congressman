import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import CongressWrapper from "@/common/CongressWrapper";
import CandidateCompareInner from "@/components/elections/CandidateCompareInner";
import { getElection } from "@/lib/api";

interface RacePageProps {
  params: Promise<{ id: string; districtId: string }>;
}

export async function generateMetadata({ params }: RacePageProps): Promise<Metadata> {
  const { id, districtId } = await params;
  const election = await getElection(id);
  const district = election?.districts.find((d) => d.id === Number(districtId));

  if (!district) return { title: "선거구 정보 없음" };

  const candidateNames = district.candidates.map((c) => c.name).join(" vs ");
  const title = `${district.district} 후보 비교 — ${candidateNames || "후보 미등록"}`;
  const description = `6·3 재보궐선거 ${district.district} 후보를 비교하세요. ${candidateNames ? candidateNames + "의" : ""} 정당, 경력, 공약, 재산을 한눈에 비교합니다.`;
  const isEmpty = district.candidates.length === 0;

  return {
    title,
    description,
    robots: isEmpty ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: `https://www.lawmake.kr/elections/${id}/races/${districtId}`,
    },
    openGraph: { title, description },
  };
}

export default async function RacePage({ params }: RacePageProps) {
  const { id, districtId } = await params;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <BreadcrumbJsonLd
        items={[
          { name: "홈", href: "/" },
          { name: "6·3 선거", href: `/elections/${id}` },
          { name: "후보 비교", href: `/elections/${id}/races/${districtId}` },
        ]}
      />

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
        <CandidateCompareInner electionId={id} districtId={Number(districtId)} />
      </CongressWrapper>
    </div>
  );
}
