import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import CongressWrapper from "@/common/CongressWrapper";
import PageIntro from "@/components/ui/page-intro";
import BillListInner from "@/components/bills/BillListInner";
import BillListSkeleton from "@/components/skeletons/BillListSkeleton";

export const metadata: Metadata = {
  title: "국회 법안 발의 검색 — 22대 국회 17,200건+ AI 요약",
  description:
    "22대 국회 법안 발의 17,200건+를 검색하세요. AI가 법안을 한 줄로 요약하고, 원문 PDF와 심사 경과를 한 화면에서 확인할 수 있습니다. 위원회·주제별 필터 제공.",
  alternates: { canonical: "https://www.lawmake.kr/bills" },
  openGraph: {
    title: "국회 법안 발의 검색 — 22대 국회 17,200건+ AI 요약",
    description:
      "AI가 법안을 한 줄로 요약. 22대 국회 법안 발의 17,200건+를 검색하고 심사 경과를 추적하세요.",
    url: "https://www.lawmake.kr/bills",
  },
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
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "22대 국회 발의 법안 데이터",
          description:
            "22대 국회 17,200건 이상의 발의 법안 목록. 법안 제목, 발의자, 심사 상태, AI 요약 포함",
          url: "https://www.lawmake.kr/bills",
          keywords: ["법안", "발의", "국회", "입법", "법률안"],
          license: "https://www.data.go.kr/ugs/selectPublicDataUseGuide.do",
          temporalCoverage: "2024-05-30/..",
          creator: {
            "@type": "Organization",
            name: "lawmake.kr",
            url: "https://www.lawmake.kr",
          },
        }}
      />
      <div className="mb-4 space-y-3">
        <h1 className="text-2xl font-bold sm:text-3xl sm:font-extrabold sm:tracking-tight">
          법안 목록
        </h1>
        <PageIntro
          collapsible
          description="국회의원이 발의한 법안 목록을 검색하고 필터링할 수 있습니다. 법안(법률안)이란 새로운 법률을 만들거나 기존 법률을 고치기 위해 국회에 제출하는 공식 문서입니다. 국회의원 10명 이상의 찬성으로 발의할 수 있으며, 위원회 심사와 본회의 표결을 거쳐 법률로 확정됩니다."
          details={[
            "상태별 필터: 계류(심사 중), 가결(통과), 폐기(종료) 등 법안의 현재 처리 상태를 확인하세요.",
            "위원회별 필터: 법안이 배정된 상임위원회(기획재정, 법제사법, 국방 등)로 분류해 볼 수 있습니다.",
            "각 법안을 클릭하면 발의 배경, 심사 경과, AI 요약 등 상세 정보를 확인할 수 있습니다.",
          ]}
        />
      </div>

      {/* 입법 과정 안내 */}
      <section className="mb-4 space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h2 className="text-lg font-bold">대한민국 입법 과정의 이해</h2>
        <div className="space-y-3 text-sm leading-relaxed text-(--color-text-secondary)">
          <p>
            대한민국의 법안은 국회의원 10인 이상의 찬성 또는 정부 제출로 발의됩니다. 발의된 법안은
            국회의장이 소관 상임위원회에 회부하며, 위원회에서는 전문위원의 검토 보고를 거쳐
            대체토론과 축조심사를 진행합니다. 위원회를 통과한 법안은 법제사법위원회의 체계·자구
            심사를 거쳐 본회의에 상정됩니다.
          </p>
          <p>
            본회의에서는 재적의원 과반수의 출석과 출석의원 과반수의 찬성으로 법안이 의결됩니다. 22대
            국회에서는 현재까지 17,200건 이상의 법안이 발의되었으며, 이 중 약 10%가 위원회 심사를
            통과하여 본회의에서 처리되었습니다. 법안의 심사 진행 상황은 &apos;계류&apos;,
            &apos;위원회 심사 중&apos;, &apos;가결&apos;, &apos;폐기&apos; 등의 상태로 구분됩니다.
          </p>
          <p>
            lawmake에서는 모든 법안에 대해 AI 기술을 활용한 한 줄 요약과 구조화된 분석을 제공하여,
            시민 누구나 복잡한 법안 내용을 쉽게 이해할 수 있도록 돕고 있습니다. 법안 원문 PDF와 심사
            경과를 함께 확인하여 입법 과정을 투명하게 모니터링해 보세요.
          </p>
        </div>
      </section>

      <CongressWrapper
        key={`${termId}-${topic ?? ""}-${committee ?? ""}`}
        fallback={<BillListSkeleton />}
      >
        <BillListInner termId={termId} initialTopic={topic} initialCommittee={committee} />
      </CongressWrapper>
    </div>
  );
}
