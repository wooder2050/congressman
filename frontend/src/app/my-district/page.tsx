import type { Metadata } from "next";
import DistrictWatch from "@/components/district/DistrictWatch";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "내 지역구 의원 — 의정활동 리포트",
  description: "내 지역구 국회의원의 출석률, 법안 발의, 표결 참여 등 의정활동을 한눈에 확인하세요.",
  alternates: { canonical: "https://www.lawmake.kr/my-district" },
  openGraph: {
    title: "내 지역구 의원 — 의정활동 리포트",
    description:
      "내 지역구 국회의원의 출석률, 법안 발의, 표결 참여 등 의정활동을 한눈에 확인하세요.",
    url: "https://www.lawmake.kr/my-district",
  },
};

export default function MyDistrictPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 space-y-1">
        <h1 className="text-2xl font-bold">내 지역구 의원</h1>
        <p className="text-sm text-(--color-text-secondary)">
          지역구를 선택하면 해당 의원의 의정활동 리포트를 확인할 수 있습니다.
        </p>
      </div>
      <DistrictWatch termId={22} />
    </div>
  );
}
