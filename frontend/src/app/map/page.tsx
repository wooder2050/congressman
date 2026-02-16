import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import MapPageInner from "@/components/map/MapPageInner";
import MapSkeleton from "@/components/skeletons/MapSkeleton";

export const metadata: Metadata = {
  title: "선거구 지도",
  description: "254개 지역구를 지도에서 확인하세요.",
};

interface MapPageProps {
  searchParams: Promise<{ term?: string; sido?: string; district?: string }>;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;

  return (
    <div className="-mx-4 -my-4 lg:-my-6">
      <CongressWrapper fallback={<MapSkeleton />}>
        <MapPageInner termId={termId} initialSido={params.sido} initialDistrict={params.district} />
      </CongressWrapper>
    </div>
  );
}
