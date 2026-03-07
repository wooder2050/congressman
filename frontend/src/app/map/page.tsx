import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import MapSkeleton from "@/components/skeletons/MapSkeleton";
import MapPageInner from "@/components/map/MapDynamic";

export const metadata: Metadata = {
  title: "선거구 지도 - 우리 동네 국회의원 찾기",
  description:
    "22대 국회 254개 지역구를 지도에서 확인하세요. 내 지역구 국회의원이 누구인지, 어떤 정당 소속인지 한눈에 볼 수 있습니다.",
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
