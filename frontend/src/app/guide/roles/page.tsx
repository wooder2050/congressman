import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "국회의원은 무슨 일을 할까? — 입법·예산·감시 3대 역할 완벽 해설",
  description:
    "국회의원의 역할을 쉽게 설명합니다. 법률을 만드는 입법 활동, 국가 예산을 심의하는 재정 활동, 정부를 견제하는 감시 활동까지 — 국민의 대표가 국회에서 하는 일을 알아보세요. 본회의 출석, 법안 발의, 표결 참여, 국정감사 등 구체적인 활동도 함께 안내합니다.",
  alternates: { canonical: "https://www.lawmake.kr/guide/roles" },
  openGraph: {
    title: "국회의원은 무슨 일을 할까?",
    description: "입법·예산·감시 — 국회의원의 3대 역할과 구체적인 활동을 쉽게 설명합니다.",
    url: "https://www.lawmake.kr/guide/roles",
  },
};

const roles = [
  {
    number: "1",
    title: "입법 활동 — 법률을 만듭니다",
    content:
      "국회의원의 가장 핵심적인 역할은 법률을 만드는 것입니다. 국회의원 10명 이상이 찬성하면 법안을 발의할 수 있으며, 발의된 법안은 소관 상임위원회에서 심사를 거쳐 본회의에서 최종 의결됩니다. 22대 국회에서는 약 15,000건 이상의 법안이 발의되었습니다. 법안을 처음 제출하는 의원을 '대표발의자', 함께 서명한 의원을 '공동발의자'라고 합니다.",
    details: [
      "법안 발의: 국회의원 10명 이상의 찬성으로 법률안을 국회에 제출합니다.",
      "위원회 심사: 소관 상임위원회에서 전문위원 검토, 대체토론, 축조심사를 거칩니다.",
      "본회의 의결: 출석의원 과반수 찬성으로 법안이 통과됩니다.",
      "의원 평균 발의 건수: 22대 국회 기준 의원 1인당 약 50건 이상입니다.",
    ],
  },
  {
    number: "2",
    title: "예산 심의 — 국민의 세금 사용을 결정합니다",
    content:
      "정부가 편성한 예산안을 심의·확정하는 것은 국회의 고유 권한입니다. 매년 9월 정부가 제출한 예산안을 상임위원회와 예산결산특별위원회에서 심사하고, 12월 2일까지 본회의에서 확정합니다. 국민이 낸 세금이 어디에 얼마나 쓰이는지를 결정하는 매우 중요한 과정입니다.",
    details: [
      "예산안 심사: 정부 예산안을 상임위원회에서 부별로 심사합니다.",
      "예산결산특별위원회: 전체 예산안을 종합 심사하고 조정합니다.",
      "결산 심사: 전년도 예산이 제대로 집행되었는지 확인합니다.",
      "추가경정예산: 긴급한 재정 수요가 있을 때 추경안을 심의합니다.",
    ],
  },
  {
    number: "3",
    title: "행정부 감시 — 정부를 견제합니다",
    content:
      "국회는 행정부가 국민을 위해 올바르게 일하고 있는지 감시하고 견제하는 역할을 합니다. 매년 국정감사를 통해 정부 부처와 공공기관의 업무를 점검하고, 대정부질문을 통해 국무총리와 국무위원에게 직접 질의합니다. 이를 통해 권력 남용을 방지하고 정부의 책임성을 높입니다.",
    details: [
      "국정감사: 매년 9~10월 정부 부처·공공기관을 대상으로 업무 점검을 실시합니다.",
      "국정조사: 특정 사안에 대해 국회가 직접 조사할 수 있습니다.",
      "대정부질문: 국무총리·국무위원에게 정책에 관해 직접 질의합니다.",
      "탄핵소추: 대통령 등 고위 공직자의 헌법·법률 위반 시 탄핵을 의결할 수 있습니다.",
    ],
  },
  {
    number: "4",
    title: "국민 대표 활동 — 민의를 전달합니다",
    content:
      "국회의원은 지역구 주민 또는 국민 전체의 대표로서 민의를 국정에 반영합니다. 지역구 의원(254명)은 해당 선거구 주민의 목소리를, 비례대표 의원(46명)은 정당 정책을 통해 다양한 국민의 의견을 국회에 전달합니다. 청원 심사, 민원 처리, 지역 현안 해결도 의원의 중요한 역할입니다.",
    details: [
      "지역구 활동: 주민과의 간담회, 현장 방문, 지역 현안 해결에 나섭니다.",
      "청원 심사: 국민이 제출한 청원을 심사하고 정책에 반영합니다.",
      "교섭단체 활동: 같은 정당 소속 의원들이 모여 정책 방향을 결정합니다.",
      "외교 활동: 국제 교류와 의원 외교를 통해 국익을 증진합니다.",
    ],
  },
];

const metrics = [
  {
    title: "출석률",
    description:
      "본회의에 얼마나 성실하게 참석하는지를 보여줍니다. 본회의는 법안을 최종 의결하는 회의로, 출석은 의원의 가장 기본적인 의무입니다. lawmake.kr에서는 의원별 출석률을 백분율로 보여주며, 결석 사유도 확인할 수 있습니다.",
  },
  {
    title: "법안 발의 건수",
    description:
      "의원이 대표발의하거나 공동발의한 법안의 수입니다. 법안 발의는 의원의 가장 핵심적인 입법 활동이며, 발의 건수와 함께 어떤 분야의 법안을 주로 발의하는지도 중요한 평가 기준입니다.",
  },
  {
    title: "표결 참여율",
    description:
      "본회의 표결에 얼마나 적극적으로 참여하는지를 보여줍니다. 찬성·반대·기권 등 의원의 표결 내역을 통해 특정 법안에 대한 입장을 확인할 수 있습니다. 표결 불참은 곧 국민의 의사를 대변하지 않는 것이므로 중요한 지표입니다.",
  },
  {
    title: "재산 신고",
    description:
      "국회의원은 매년 재산을 공개해야 합니다. 부동산, 예금, 증권 등 자산 내역을 통해 의원의 경제적 이해관계를 확인할 수 있습니다. lawmake.kr에서는 2024년 재산신고 기준 데이터를 제공합니다.",
  },
];

export default function RolesPage() {
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
              name: "국회의원의 역할",
              item: "https://www.lawmake.kr/guide/roles",
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
              name: "국회의원은 무슨 일을 하나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "국회의원은 크게 입법 활동(법률 제정·개정), 예산 심의(국가 재정 결정), 행정부 감시(국정감사·대정부질문), 국민 대표 활동(민의 전달·청원 심사) 4가지 역할을 합니다.",
              },
            },
            {
              "@type": "Question",
              name: "국회의원의 의정활동을 어떻게 평가할 수 있나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "출석률, 법안 발의 건수, 표결 참여율, 재산 신고 내역 등을 종합적으로 확인하면 됩니다. lawmake.kr에서 의원별 의정활동 데이터를 확인할 수 있습니다.",
              },
            },
            {
              "@type": "Question",
              name: "지역구 의원과 비례대표 의원의 차이는 무엇인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "지역구 의원(254명)은 특정 선거구에서 주민의 직접 투표로 선출되며, 비례대표 의원(46명)은 정당 득표율에 따라 배분됩니다. 지역구 의원은 해당 지역 주민의 대표로, 비례대표 의원은 정당 정책을 통해 다양한 국민의 의견을 대변합니다.",
              },
            },
          ],
        }}
      />

      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">국회의원은 무슨 일을 할까?</h1>
        <p className="mt-4 text-base leading-relaxed text-(--color-text-secondary)">
          국회의원은 국민의 대표로서 법률을 만들고, 예산을 심의하며, 정부를 감시합니다. 22대 국회는
          300명의 국회의원으로 구성되어 있으며, 지역구 의원 254명과 비례대표 의원 46명이 4년 임기
          동안 활동합니다.
        </p>
      </section>

      {/* 4대 역할 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">국회의원의 4대 역할</h2>
        {roles.map((role) => (
          <div
            key={role.number}
            className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-sm font-bold text-white">
                {role.number}
              </span>
              <h3 className="text-lg font-bold">{role.title}</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
              {role.content}
            </p>
            <ul className="mt-3 space-y-1.5">
              {role.details.map((detail) => (
                <li key={detail} className="text-sm leading-relaxed text-(--color-text-secondary)">
                  • {detail}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* 의정활동 평가 지표 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">의정활동 평가 지표</h2>
        <p className="text-sm leading-relaxed text-(--color-text-secondary)">
          국회의원의 의정활동을 어떻게 평가할 수 있을까요? 다음 지표들을 종합적으로 살펴보면 의원의
          활동을 객관적으로 파악할 수 있습니다.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {metrics.map((metric) => (
            <div
              key={metric.title}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5"
            >
              <h3 className="text-base font-bold">{metric.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 국회 구성 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">22대 국회 구성</h2>
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <div className="space-y-3 text-sm leading-relaxed text-(--color-text-secondary)">
            <p>
              제22대 국회는 2024년 5월 30일 개원하여 2028년 5월 29일까지 4년간 운영됩니다. 총
              300명의 국회의원으로 구성되며, 지역구 254석과 비례대표 46석으로 이루어져 있습니다.
            </p>
            <p>
              국회의 의사결정은 본회의와 위원회에서 이루어집니다. 본회의는 국회의원 전원이 참석하는
              회의로, 법안의 최종 의결이 이루어집니다. 상임위원회는 소관 분야의 법안을 전문적으로
              심사하는 곳으로, 실질적인 입법 논의의 대부분이 위원회에서 이루어집니다.
            </p>
            <p>
              국회는 매년 9월 1일부터 12월 31일까지 100일간 정기회를 열며, 필요할 때 임시회를
              소집합니다. 정기회에서는 예산안 심의, 국정감사 등 핵심 업무를 처리합니다.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-6">
        <h2 className="text-lg font-bold">우리 지역 의원은 어떤 활동을 하고 있을까요?</h2>
        <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
          lawmake.kr에서 국회의원의 출석률, 법안 발의, 표결 이력을 직접 확인해 보세요.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/members"
            className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
          >
            의원 목록 보기
          </Link>
          <Link
            href="/map"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            내 지역 의원 찾기
          </Link>
          <Link
            href="/members/scorecard"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            의원 성적표 보기
          </Link>
        </div>
      </section>

      {/* 관련 페이지 */}
      <section className="border-t border-(--color-border-primary) pt-6">
        <h2 className="mb-3 text-sm font-semibold text-(--color-text-tertiary)">관련 페이지</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/guide" className="text-(--color-primary) no-underline hover:underline">
            입법 과정 안내
          </Link>
          <Link
            href="/guide/budget"
            className="text-(--color-primary) no-underline hover:underline"
          >
            국가 예산의 이해
          </Link>
          <Link href="/glossary" className="text-(--color-primary) no-underline hover:underline">
            국회 용어 사전
          </Link>
        </div>
      </section>
    </div>
  );
}
