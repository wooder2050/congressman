import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "지역별 6·3 선거 정보 — 17개 시도",
  description:
    "서울, 부산, 경기 등 17개 시도별 6·3 지방선거 정보를 확인하세요. 지역별 재보궐 선거구, 투표 일정, 투표소 찾기 정보를 제공합니다.",
  alternates: { canonical: "https://www.lawmake.kr/elections/2026-06-03/regions" },
};

const REGIONS = [
  { id: "서울", name: "서울특별시" },
  { id: "부산", name: "부산광역시" },
  { id: "대구", name: "대구광역시" },
  { id: "인천", name: "인천광역시" },
  { id: "광주", name: "광주광역시" },
  { id: "대전", name: "대전광역시" },
  { id: "울산", name: "울산광역시" },
  { id: "세종", name: "세종특별자치시" },
  { id: "경기", name: "경기도" },
  { id: "강원", name: "강원특별자치도" },
  { id: "충북", name: "충청북도" },
  { id: "충남", name: "충청남도" },
  { id: "전북", name: "전북특별자치도" },
  { id: "전남", name: "전라남도" },
  { id: "경북", name: "경상북도" },
  { id: "경남", name: "경상남도" },
  { id: "제주", name: "제주특별자치도" },
];

export default async function RegionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <BreadcrumbJsonLd
        items={[
          { name: "홈", href: "/" },
          { name: "6·3 선거", href: `/elections/${id}` },
          { name: "지역별 선거", href: `/elections/${id}/regions` },
        ]}
      />

      <section>
        <p className="text-sm font-medium text-(--color-primary)">
          <Link href={`/elections/${id}`} className="hover:underline">
            ← 6·3 선거 홈
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">지역별 선거 정보</h1>
        <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
          17개 시도별 6·3 지방선거 정보를 확인하세요. 지역별 재보궐 선거구, 투표 일정을 제공합니다.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {REGIONS.map((r) => (
          <Link
            key={r.id}
            href={`/elections/${id}/regions/${encodeURIComponent(r.id)}`}
            className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-center transition-colors hover:bg-(--color-bg-hover)"
          >
            <p className="text-lg font-bold">{r.id}</p>
            <p className="mt-1 text-xs text-(--color-text-tertiary)">{r.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
