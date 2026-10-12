import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSlot from "@/components/ads/AdSlot";

export const metadata: Metadata = {
  title: "세금은 어떻게 쓰이나요? — 국가 예산과 국회의 역할 쉽게 알아보기",
  description:
    "국민이 낸 세금은 어디에 쓰일까요? 국가 예산의 구성, 편성 과정, 국회의 심의·확정 역할을 쉽게 설명합니다. 추가경정예산(추경)이란 무엇이고, 결산은 어떻게 하는지 알아보세요.",
  alternates: { canonical: "https://www.lawmake.kr/guide/budget" },
  openGraph: {
    title: "세금은 어떻게 쓰이나요? — 국가 예산과 국회의 역할",
    description:
      "국민의 세금이 어떻게 쓰이는지, 예산 편성부터 결산까지 국회의 역할을 쉽게 설명합니다.",
    url: "https://www.lawmake.kr/guide/budget",
  },
};

const budgetProcess = [
  {
    number: "1",
    title: "정부 예산안 편성 (1~8월)",
    content:
      "각 부처가 사업 계획에 따라 예산 요구서를 기획예산처에 제출하면, 기획예산처가 이를 조정해 정부 예산안을 만듭니다. 국무회의 의결을 거쳐 정부안이 확정됩니다. 2027년도 예산안은 2026년 9월 1일 국무회의에서 의결됐습니다.",
  },
  {
    number: "2",
    title: "국회 제출 (회계연도 개시 120일 전)",
    content:
      "국가재정법에 따라 정부는 회계연도 개시 120일 전(9월 3일)까지 예산안을 국회에 제출해야 합니다. 예산안에는 세입(수입)과 세출(지출) 계획, 기금운용계획 등이 포함됩니다. 2027년도 예산안은 9월 3일 국회에 제출됐습니다.",
  },
  {
    number: "3",
    title: "상임위원회 예비심사 (국정감사 이후)",
    content:
      "상임위원회가 소관 부처의 예산안을 심사합니다. 각 위원회는 예산의 타당성과 효율성을 검토해 증액·감액 의견을 예산결산특별위원회에 보고합니다. 해마다 국정감사가 끝난 뒤 본격적으로 진행되며, 구체적인 회의 날짜는 위원회가 정해 공지합니다.",
  },
  {
    number: "4",
    title: "예결위 종합심사 (11월 30일까지)",
    content:
      "예산결산특별위원회(예결위)가 전체 예산안을 종합 심사합니다. 종합정책질의에서 국무총리와 각 부 장관에게 예산 편성 방향을 묻고, 부별 심사와 소위원회 계수조정을 거칩니다. 국회법에 따라 위원회는 11월 30일까지 심사를 마쳐야 하고, 마치지 못하면 12월 1일 본회의에 부의된 것으로 봅니다(국회의장과 교섭단체 대표가 합의하면 예외). 자동으로 통과되는 것은 아닙니다.",
  },
  {
    number: "5",
    title: "본회의 의결 (12월 2일까지)",
    content:
      "예결위 심사를 마친 예산안은 본회의에 상정되어 재적의원 과반수 출석, 출석의원 과반수 찬성으로 확정됩니다. 헌법 제54조에 따라 회계연도 개시 30일 전(12월 2일)까지 의결해야 합니다. 이 날짜는 법정 기한이며, 실제 처리일은 해마다 다를 수 있습니다.",
  },
];

// 2027년도 정부 예산안 12대 분야별 재원배분(조원). 출처: 기획예산처 「2026~2030년 국가재정운용계획」(2026.9.1)
// 분야별 금액에는 분야 간 중복(R&D 등)이 있어 합계가 총지출(820.9조원)과 정확히 같지 않다.
const budgetCategories = [
  {
    name: "보건·복지·고용",
    amount: "289.0조",
    share: "약 35%",
    description: "기초생활보장, 건강보험, 고용, 연금 등",
  },
  {
    name: "일반·지방행정",
    amount: "149.0조",
    share: "약 18%",
    description: "지방교부세 등 지방 재원, 일반 행정 등",
  },
  {
    name: "교육",
    amount: "110.7조",
    share: "약 13%",
    description: "초중고 교육, 대학 지원, 평생교육 등",
  },
  {
    name: "국방",
    amount: "73.3조",
    share: "약 9%",
    description: "군사력 유지, 방위력 개선, 병력 운영 등",
  },
  {
    name: "산업·중소기업·에너지",
    amount: "41.2조",
    share: "약 5%",
    description: "산업 지원, 중소기업, 에너지 전환 등",
  },
  {
    name: "R&D(연구개발)",
    amount: "39.5조",
    share: "약 5%",
    description: "과학기술 연구, 산업 기술 개발 등",
  },
  {
    name: "그 밖의 6개 분야",
    amount: "121.7조",
    share: "약 15%",
    description:
      "농림·수산·식품 30.7조, SOC 28.9조, 공공질서·안전 28.8조, 환경 14.6조, 문화·체육·관광 11.6조, 외교·통일 7.1조",
  },
];

export default function BudgetGuidePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "홈",
              item: "https://www.lawmake.kr",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "입법 과정 안내",
              item: "https://www.lawmake.kr/guide",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "세금은 어떻게 쓰이나요?",
              item: "https://www.lawmake.kr/guide/budget",
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "국가 예산은 누가 결정하나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "정부가 예산안을 편성하고, 국회가 심의·확정합니다. 국회는 예산을 삭감할 수 있지만, 정부 동의 없이 증액하거나 새 항목을 만들 수는 없습니다.",
              },
            },
            {
              "@type": "Question",
              name: "추가경정예산(추경)이란 무엇인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "이미 확정된 예산에 변경이 필요할 때 편성하는 수정 예산입니다. 전쟁, 자연재해, 경제위기 등 예상치 못한 상황에 대응하기 위해 편성되며, 본예산과 동일한 절차로 국회의 심의·의결을 거칩니다.",
              },
            },
            {
              "@type": "Question",
              name: "세금은 주로 어디에 쓰이나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "2027년도 정부 예산안(총지출 820조 9천억 원) 기준으로 보건·복지·고용 289조 원(약 35%), 일반·지방행정 149조 원(약 18%), 교육 110.7조 원(약 13%), 국방 73.3조 원(약 9%), 산업·중소기업·에너지 41.2조 원, R&D 39.5조 원 순입니다. 국회 심사에서 바뀔 수 있습니다.",
              },
            },
          ],
        }}
      />

      {/* 헤더 */}
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">세금은 어떻게 쓰이나요?</h1>
        <p className="mt-3 text-base leading-relaxed text-(--color-text-secondary)">
          국민이 낸 세금은 국가 예산이 되어 교육, 복지, 국방, 인프라 등에 사용됩니다. 예산은 정부가
          편성하고 국회가 심의·확정하는 과정을 거칩니다. 이 과정에서 국회의원들이 어떤 역할을 하는지
          알아봅니다.
        </p>
      </section>

      {/* 예산은 어디에 쓰이나 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">국가 예산은 어디에 쓰이나요?</h2>
        <p className="text-sm leading-relaxed text-(--color-text-secondary)">
          국회가 심사 중인 2027년도 정부 예산안의 총지출은 820조 9천억 원으로, 2026년 본예산(727조
          9천억 원)보다 12.8% 늘었습니다. 분야별로는 국민의 건강·복지·고용을 위한 예산이 가장
          큽니다(정부안 기준, 국회 심사에서 바뀔 수 있음).
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {budgetCategories.map((cat) => (
            <div
              key={cat.name}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-bold text-(--color-text-primary)">{cat.name}</h3>
                <span className="text-lg font-extrabold text-(--color-primary)">
                  {cat.amount}
                  <span className="ml-1 text-xs font-medium text-(--color-text-tertiary)">
                    {cat.share}
                  </span>
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-(--color-text-tertiary)">
                {cat.description}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-(--color-text-tertiary)">
          출처:{" "}
          <a
            href="https://www.mpb.go.kr/web/main/bbs/b_0001/2629"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            기획예산처 「2027년도 예산안 및 2026~2030년 국가재정운용계획」
          </a>{" "}
          분야별 재원배분 계획(2026.9.1). 분야 간 중복이 있어 분야별 합계는 총지출과 정확히 같지
          않습니다.
        </p>
      </section>

      <p className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-4 text-sm">
        지금 국회가 심사 중인 2027년도 예산안의 단계·기한·주요 사업은{" "}
        <Link href="/issues/budget-2027" className="font-bold underline">
          2027 예산안 국회 심사
        </Link>
        에서 볼 수 있습니다.
      </p>

      {/* 예산 편성 과정 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">예산은 어떻게 만들어지나요?</h2>
        <p className="text-sm leading-relaxed text-(--color-text-secondary)">
          국가 예산은 정부가 편성하고 국회가 심의·확정합니다. 매년 반복되는 이 과정은 약 1년에 걸쳐
          진행됩니다.
        </p>
        <div className="space-y-4">
          {budgetProcess.map((step) => (
            <div
              key={step.number}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-sm font-bold text-white">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-base font-bold text-(--color-text-primary)">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
                    {step.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 광고 — 완결된 주요 설명 섹션 뒤 1개(하단에서 이동) */}
      <AdSlot placement="guide-inline" />

      {/* 추경이란 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">추가경정예산(추경)이란 무엇인가요?</h2>
        <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            추가경정예산(추경)은 이미 확정된 예산에 변경이 필요할 때 편성하는 수정 예산입니다. 전쟁,
            자연재해, 경제위기 등 예상치 못한 상황에 대응하기 위해 편성됩니다.
          </p>
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            추경은 본예산과 동일하게 국회의 심의·의결을 거쳐야 합니다. 정부가 추경안을 편성하여
            국회에 제출하면, 대통령 시정연설 → 예결위 심사 → 본회의 의결 순서로 처리됩니다.
          </p>
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            2026년에는 중동 전쟁 장기화에 따른 고유가 대응을 위해 26.2조 원 규모의 제1회 추경이
            편성돼 4월 10일 본회의를 통과했습니다(국회 표결 기록 기준 찬성 213·반대 12·기권 19,{" "}
            <Link href="/votes/PRC_J2P6C0A3K3B1T1K9R5C4W5H4W0V6K1" className="underline">
              표결 결과 보기
            </Link>
            ). 추경을 반영한 2026년 총지출은 753조 원입니다.
          </p>
        </div>
      </section>

      {/* 결산이란 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">결산은 무엇인가요?</h2>
        <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            결산은 정부가 한 해 동안 예산을 계획대로 사용했는지 사후 점검하는 과정입니다. 정부가
            결산보고서를 국회에 제출하면, 감사원 감사를 거쳐 국회가 승인합니다.
          </p>
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            결산 심사에서 불용액(쓰지 않고 남은 예산)이 과도하거나, 예산 목적과 다르게 집행된 사항이
            발견되면 국회가 시정을 요구합니다. 이를 통해 국민의 세금이 올바르게 쓰였는지 감시합니다.
          </p>
        </div>
      </section>

      {/* 관련 페이지 */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-6">
        <h2 className="text-lg font-bold">더 알아보기</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/guide/roles"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            국회의원은 무엇을 하나요?
          </Link>
          <Link
            href="/guide"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            입법 과정 안내
          </Link>
          <Link
            href="/glossary"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            국회 용어 사전
          </Link>
        </div>
      </section>
    </div>
  );
}
