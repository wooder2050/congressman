import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "국회의원은 무엇을 하나요? — 국회의원의 역할과 권한 쉽게 알아보기",
  description:
    "국회의원은 법률을 만들고, 정부 예산을 심의하며, 행정부를 감시합니다. 국회의원의 4대 역할(입법, 예산, 국정감사, 국민 대표)을 쉽게 설명합니다. 국회는 어떻게 운영되고, 의원은 하루를 어떻게 보내는지 알아보세요.",
  alternates: { canonical: "https://www.lawmake.kr/guide/national-assembly" },
  openGraph: {
    title: "국회의원은 무엇을 하나요?",
    description:
      "국회의원의 4대 역할 — 입법, 예산 심의, 국정감사, 국민 대표. 국회 운영 방식을 쉽게 설명합니다.",
    url: "https://www.lawmake.kr/guide/national-assembly",
  },
};

const roles = [
  {
    number: "1",
    title: "법률 만들기 (입법)",
    content:
      "국회의원의 가장 핵심적인 역할은 법률을 만드는 것입니다. 국회의원 10명 이상이 동의하면 법안을 발의할 수 있고, 위원회 심사와 본회의 표결을 거쳐 법률이 됩니다. 22대 국회에서는 약 17,000건 이상의 법안이 발의되었으며, 이 중 실제 본회의를 통과하는 법안은 약 10~15%입니다. 법안 하나가 통과되기까지 평균 수개월에서 수년이 걸리기도 합니다.",
  },
  {
    number: "2",
    title: "국가 예산 심의·확정",
    content:
      "정부가 편성한 예산안을 국회가 심의하고 확정합니다. 매년 9월 정부가 예산안을 국회에 제출하면, 상임위원회 예비심사 → 예산결산특별위원회 종합심사 → 본회의 의결 순서로 진행됩니다. 국회는 예산을 삭감할 수는 있지만 정부 동의 없이 증액하거나 새 항목을 만들 수는 없습니다. 2026년 본예산은 약 680조 원 규모이며, 추가경정예산(추경)은 별도로 편성됩니다.",
  },
  {
    number: "3",
    title: "행정부 감시 (국정감사·국정조사)",
    content:
      "국회는 매년 가을 약 20일간 국정감사를 실시하여 정부 부처, 공공기관, 지방자치단체의 업무를 점검합니다. 국정감사에서 의원들은 장관이나 기관장을 국회에 불러 질의하고, 문제점을 지적하며 시정을 요구합니다. 특정 사안에 대해서는 국정조사를 실시할 수도 있습니다. 이를 통해 행정부의 권력 남용을 견제하고 국민의 이익을 보호합니다.",
  },
  {
    number: "4",
    title: "국민 대표 역할",
    content:
      "국회의원은 국민의 대표로서 지역구 주민의 의견을 국정에 반영합니다. 지역구 의원(254명)은 해당 선거구의 현안을 해결하고, 비례대표 의원(46명)은 정당의 정책 방향을 대변합니다. 또한 인사청문회를 통해 대법관, 국무총리 등 고위 공직자의 자질을 검증하고, 조약 비준 동의 등 외교 분야에서도 역할을 수행합니다.",
  },
];

const sessionTypes = [
  {
    title: "정기회",
    period: "매년 9월 1일 ~ 12월 (100일 이내)",
    description:
      "매년 9월 1일에 자동 개회됩니다. 예산안 심의, 결산 승인, 국정감사가 이 기간에 집중적으로 이루어집니다.",
  },
  {
    title: "임시회",
    period: "필요 시 수시 소집 (30일 이내)",
    description:
      "대통령 또는 국회 재적의원 1/4 이상의 요구로 소집됩니다. 긴급 현안 논의, 추경 처리 등이 주로 이루어집니다.",
  },
];

const dailyLife = [
  {
    time: "오전",
    activity: "상임위원회 회의",
    description:
      "소속 상임위원회에 출석하여 법안을 심사하고, 정부 부처의 업무 보고를 받습니다. 전문위원의 검토 보고를 듣고 질의·토론을 진행합니다.",
  },
  {
    time: "오후",
    activity: "본회의 참석 / 소위원회",
    description:
      "본회의가 열리면 법안 표결에 참여합니다. 본회의가 없는 날에는 소위원회 심사, 의원 간 협의, 정당 회의 등에 참여합니다.",
  },
  {
    time: "그 외",
    activity: "지역구 활동 / 정책 연구",
    description:
      "지역구 민원 처리, 주민 간담회, 현장 방문 등을 합니다. 정책 보좌관과 함께 법안을 준비하거나 전문가 자문을 받기도 합니다.",
  },
];

export default function NationalAssemblyGuidePage() {
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
              item: "https://www.lawmake.kr/guide/national-assembly",
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
              name: "국회의원은 무엇을 하나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "국회의원은 법률을 만들고(입법), 국가 예산을 심의·확정하며, 행정부를 감시(국정감사)하고, 국민의 의견을 국정에 반영하는 4가지 역할을 수행합니다.",
              },
            },
            {
              "@type": "Question",
              name: "국회는 언제 열리나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "정기회는 매년 9월 1일부터 12월까지(100일 이내), 임시회는 필요 시 수시로 소집됩니다(30일 이내). 대통령 또는 재적의원 1/4 이상이 요구하면 임시회가 열립니다.",
              },
            },
            {
              "@type": "Question",
              name: "국회의원은 몇 명인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "대한민국 국회는 300명의 국회의원으로 구성됩니다. 지역구 의원 254명과 비례대표 의원 46명이 있으며, 임기는 4년입니다.",
              },
            },
          ],
        }}
      />

      {/* 헤더 */}
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">국회의원은 무엇을 하나요?</h1>
        <p className="mt-3 text-base leading-relaxed text-(--color-text-secondary)">
          대한민국 국회는 300명의 국회의원으로 구성되며, 국민을 대표하여 법률을 만들고, 예산을
          심의하며, 정부를 감시합니다. 국회의원의 역할과 국회가 어떻게 운영되는지 알아봅니다.
        </p>
      </section>

      {/* 국회의원의 4대 역할 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">국회의원의 4대 역할</h2>
        <div className="space-y-4">
          {roles.map((role) => (
            <div
              key={role.number}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-sm font-bold text-white">
                  {role.number}
                </span>
                <div>
                  <h3 className="text-base font-bold text-(--color-text-primary)">{role.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
                    {role.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 국회 운영 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">국회는 언제 열리나요?</h2>
        <p className="text-sm leading-relaxed text-(--color-text-secondary)">
          국회의 회기는 크게 정기회와 임시회로 나뉩니다. 각 회기마다 다루는 안건과 성격이 다릅니다.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sessionTypes.map((session) => (
            <div
              key={session.title}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5"
            >
              <h3 className="text-base font-bold text-(--color-text-primary)">{session.title}</h3>
              <p className="mt-1 text-xs font-semibold text-(--color-primary)">{session.period}</p>
              <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
                {session.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 국회의원의 하루 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">국회의원의 하루</h2>
        <p className="text-sm leading-relaxed text-(--color-text-secondary)">
          국회의원은 본회의와 위원회 참석 외에도 다양한 활동을 합니다.
        </p>
        <div className="space-y-3">
          {dailyLife.map((item) => (
            <div
              key={item.time}
              className="flex gap-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5"
            >
              <div className="w-16 shrink-0">
                <span className="text-xs font-bold text-(--color-primary)">{item.time}</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-(--color-text-primary)">{item.activity}</h3>
                <p className="mt-1 text-sm leading-relaxed text-(--color-text-secondary)">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 숫자로 보는 국회 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">숫자로 보는 22대 국회</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "국회의원", value: "295명" },
            { label: "상임위원회", value: "18개" },
            { label: "발의 법안", value: "17,000건+" },
            { label: "본회의 표결", value: "1,290건+" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-center"
            >
              <div className="text-xl font-extrabold text-(--color-primary)">{stat.value}</div>
              <div className="mt-1 text-xs text-(--color-text-tertiary)">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 관련 페이지 */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-6">
        <h2 className="text-lg font-bold">더 알아보기</h2>
        <div className="mt-3 flex flex-wrap gap-2">
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
          <Link
            href="/guide/budget"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            세금은 어떻게 쓰이나요?
          </Link>
          <Link
            href="/members"
            className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
          >
            의원 목록 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
