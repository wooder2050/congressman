import type { Metadata } from "next";
import CongressWrapper from "@/common/CongressWrapper";
import PageIntro from "@/components/ui/page-intro";
import BillListInner from "@/components/bills/BillListInner";
import BillListSkeleton from "@/components/skeletons/BillListSkeleton";

export const metadata: Metadata = {
  title: "법안 목록",
  description:
    "국회의원이 발의한 법안을 검색하고, 상태·위원회·주제별로 필터링하세요. 법안의 심사 경과와 AI 요약을 확인할 수 있습니다.",
};

interface BillsPageProps {
  searchParams: Promise<{ term?: string; topic?: string; committee?: string }>;
}

export default async function BillsPage({ searchParams }: BillsPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;
  const topic = params.topic || undefined;
  const committee = params.committee || undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 space-y-3">
        <h1 className="text-2xl font-bold">법안 목록</h1>
        <PageIntro
          description="국회의원이 발의한 법안 목록을 검색하고 필터링할 수 있습니다. 법안(법률안)이란 새로운 법률을 만들거나 기존 법률을 고치기 위해 국회에 제출하는 공식 문서입니다. 국회의원 10명 이상의 찬성으로 발의할 수 있으며, 위원회 심사와 본회의 표결을 거쳐 법률로 확정됩니다."
          details={[
            "상태별 필터: 계류(심사 중), 가결(통과), 폐기(종료) 등 법안의 현재 처리 상태를 확인하세요.",
            "위원회별 필터: 법안이 배정된 상임위원회(기획재정, 법제사법, 국방 등)로 분류해 볼 수 있습니다.",
            "각 법안을 클릭하면 발의 배경, 심사 경과, AI 요약 등 상세 정보를 확인할 수 있습니다.",
          ]}
        />
      </div>
      <CongressWrapper
        key={`${termId}-${topic ?? ""}-${committee ?? ""}`}
        fallback={<BillListSkeleton />}
      >
        <BillListInner termId={termId} initialTopic={topic} initialCommittee={committee} />
      </CongressWrapper>
    </div>
  );
}
