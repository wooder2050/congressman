import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import MapSkeleton from "@/components/skeletons/MapSkeleton";
import MapPageInner from "@/components/map/MapDynamic";

export const metadata: Metadata = {
  title: "선거구 지도 - 우리 동네 국회의원 찾기 | 지역구별 의원 검색",
  description:
    "22대 국회 254개 선거구 지도에서 우리 동네 국회의원을 찾아보세요. 전국 시도별 드릴다운, 정당 색상 표시, 지역구별 의원 정보를 한눈에 확인할 수 있습니다.",
  alternates: { canonical: "https://www.lawmake.kr/map" },
};

interface MapPageProps {
  searchParams: Promise<{ term?: string; sido?: string; district?: string }>;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div className="-mx-4 -my-4 lg:-my-6">
      <CongressWrapper key={termId} fallback={<MapSkeleton />}>
        <MapPageInner termId={termId} initialSido={params.sido} initialDistrict={params.district} />
      </CongressWrapper>
    </div>
  );
}
