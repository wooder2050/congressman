import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "입법 과정 — 법안 발의부터 본회의 통과까지 법이 만들어지는 과정",
  description:
    "법안은 어떻게 통과될까? 국회에서 법률이 만들어지는 과정을 단계별로 설명합니다. 법안 발의 → 위원회 심사 → 본회의 표결 → 법률 공포까지 입법 절차 전체를 알기 쉽게 안내합니다. 의원입법과 정부입법의 차이, 법률 제정 절차, 대안반영폐기의 뜻도 함께 알아보세요.",
  alternates: { canonical: "https://www.lawmake.kr/guide" },
  openGraph: {
    title: "입법 과정 — 법안 발의부터 본회의 통과까지",
    description:
      "법안 발의 → 위원회 심사 → 본회의 표결 → 법률 공포. 국회 입법 절차를 단계별로 쉽게 설명합니다.",
    url: "https://www.lawmake.kr/guide",
  },
};

const steps = [
  {
    number: "1",
    title: "법안 발의",
    content:
      "법률안(법안)은 국회의원 10명 이상의 찬성으로 발의할 수 있습니다. 법안을 처음 제출하는 의원을 '대표발의자', 함께 이름을 올린 의원을 '공동발의자'라고 합니다. 정부도 국무회의 심의를 거쳐 법안을 제출할 수 있으며, 위원회도 소관 사항에 대해 법안을 제안할 수 있습니다. 매 국회(4년 임기)마다 수천~수만 건의 법안이 발의됩니다.",
  },
  {
    number: "2",
    title: "위원회 심사",
    content:
      "발의된 법안은 내용에 따라 해당 상임위원회에 회부됩니다. 위원회에서는 전문위원의 검토 보고를 받은 뒤, 대체토론(법안의 큰 방향 논의), 축조심사(조문별 검토), 찬반투표 순으로 심사합니다. 필요에 따라 공청회나 청문회를 열어 전문가와 이해관계자의 의견을 듣기도 합니다. 여러 법안이 같은 주제를 다루면 하나의 대안으로 통합하여 처리하는 경우도 있으며, 이때 원래 법안들은 '대안반영폐기' 됩니다. 위원회를 통과한 법안은 법제사법위원회에서 체계와 자구를 최종 점검합니다.",
  },
  {
    number: "3",
    title: "본회의 의결",
    content:
      "위원회 심사를 마친 법안은 본회의에 상정됩니다. 본회의는 국회의원 전원이 참석하는 회의로, 재적의원 과반수(151명 이상)가 출석해야 회의를 열 수 있습니다. 법안은 출석의원 과반수의 찬성으로 의결됩니다. 투표는 전자투표 방식으로 이루어지며, 결과는 '원안가결'(수정 없이 통과), '수정가결'(일부 수정 후 통과), '부결'(반대 다수로 미통과)로 나뉩니다.",
  },
  {
    number: "4",
    title: "법률 공포 및 시행",
    content:
      "국회를 통과한 법안은 정부로 이송되어 대통령이 15일 이내에 공포합니다. 대통령은 이의가 있을 경우 거부권(재의요구권)을 행사할 수 있으며, 이 경우 국회에서 재적의원 과반수 출석에 출석의원 3분의 2 이상 찬성으로 재의결하면 법률로 확정됩니다. 공포된 법률은 특별한 규정이 없으면 공포일로부터 20일 후에 시행됩니다.",
  },
];

const committees = [
  {
    name: "기획재정위원회",
    desc: "국가 예산, 세제, 금융, 경제 정책 전반을 다룹니다. 정부의 예산안을 1차로 심사하며, 세금과 관련된 법안을 소관합니다.",
  },
  {
    name: "법제사법위원회",
    desc: "모든 법안의 체계와 자구를 최종 점검하는 '관문' 역할을 합니다. 법원·검찰·법무부 소관 법안도 심사하며, '법사위 심사'는 법안 통과의 마지막 관문으로 불립니다.",
  },
  {
    name: "국방위원회",
    desc: "국방부, 병무청, 방위사업청 등을 관할합니다. 국방 예산, 병역제도, 방위산업 관련 법안을 심사합니다.",
  },
  {
    name: "행정안전위원회",
    desc: "행정안전부, 경찰청, 소방청 등을 관할합니다. 지방자치, 선거, 공무원 제도, 재난 안전 관련 법안을 다룹니다.",
  },
  {
    name: "교육위원회",
    desc: "교육부를 관할하며, 초·중·고·대학 교육 정책, 교원 제도, 학교 안전 등에 관한 법안을 심사합니다.",
  },
  {
    name: "보건복지위원회",
    desc: "보건복지부, 질병관리청 등을 관할합니다. 건강보험, 연금, 사회복지, 저출생 대책 등 국민 생활과 밀접한 법안을 다룹니다.",
  },
  {
    name: "환경노동위원회",
    desc: "환경부와 고용노동부를 관할합니다. 환경 보호, 근로 조건, 최저임금, 산업 안전 등에 관한 법안을 심사합니다.",
  },
  {
    name: "과학기술정보방송통신위원회",
    desc: "과학기술정보통신부, 방송통신위원회 등을 관할합니다. 과학기술 진흥, 정보통신, 방송, 인터넷 관련 법안을 다룹니다.",
  },
];

const billTypes = [
  {
    type: "일부개정법률안",
    desc: "기존 법률의 특정 조항만 수정·삭제·추가하는 법안입니다. 전체 법안 중 가장 많은 비중(약 90% 이상)을 차지합니다. 예: '근로기준법 일부개정법률안'은 근로기준법의 특정 조항을 고치는 법안입니다.",
  },
  {
    type: "전부개정법률안",
    desc: "법률의 체계나 내용이 크게 달라져야 할 때, 기존 법 전체를 새로 작성하는 법안입니다. 법률 번호는 유지되지만 내용은 완전히 새로워집니다.",
  },
  {
    type: "제정법률안",
    desc: "기존에 없던 완전히 새로운 법률을 만드는 법안입니다. 새로운 사회 현상이나 정책 수요에 대응하기 위해 발의됩니다. 예: 새로운 기술(AI, 드론 등)을 규율하기 위한 법률 등.",
  },
  {
    type: "폐지법률안",
    desc: "더 이상 필요 없는 법률을 없애는 법안입니다. 시대 변화로 실효성을 잃었거나, 다른 법률에 통합된 경우에 발의됩니다.",
  },
];

const terms = [
  {
    term: "계류",
    desc: "법안이 위원회나 본회의에서 아직 처리되지 않고 심사를 기다리는 상태입니다.",
  },
  {
    term: "대안반영폐기",
    desc: "여러 법안의 내용을 하나의 대안으로 통합하면서, 원래 법안들이 자동으로 폐기되는 것을 말합니다.",
  },
  {
    term: "임기만료폐기",
    desc: "국회의원 임기(4년)가 끝날 때까지 처리되지 않은 법안이 자동으로 폐기되는 것입니다. 다수의 법안이 이에 해당합니다.",
  },
];

const faqs = [
  {
    question: "법안이 발의되면 바로 통과되나요?",
    answer:
      "아닙니다. 법안은 발의 → 위원회 심사 → 본회의 표결 → 대통령 공포의 4단계를 거쳐야 법률이 됩니다. 22대 국회에서 발의된 17,000건 이상의 법안 중 실제 본회의를 통과하는 비율은 약 10% 미만입니다. 대부분의 법안은 위원회 심사 단계에서 계류되거나 임기만료로 자동 폐기됩니다.",
  },
  {
    question: "의원입법과 정부입법은 어떻게 다른가요?",
    answer:
      "의원입법은 국회의원 10명 이상이 찬성하여 발의하는 법안이고, 정부입법은 정부(행정부)가 국무회의 심의를 거쳐 국회에 제출하는 법안입니다. 의원입법이 전체의 약 90% 이상을 차지하지만, 정부입법은 행정부의 전문성과 예산이 뒷받침되어 통과율이 상대적으로 높은 편입니다.",
  },
  {
    question: "대안반영폐기는 법안이 폐기된 건가요?",
    answer:
      "형식적으로는 폐기이지만, 실질적으로는 법안의 핵심 내용이 살아남은 것입니다. 같은 주제의 법안이 여러 개 발의되면 위원회에서 이를 하나의 '대안'으로 통합합니다. 이때 원래 법안들은 '대안반영폐기'로 처리되지만, 그 내용은 대안에 반영되어 심사가 계속됩니다.",
  },
  {
    question: "본회의 통과에 필요한 조건은 무엇인가요?",
    answer:
      "국회의원 재적의원 과반수(151명 이상)가 출석해야 회의를 열 수 있고, 출석의원 과반수의 찬성으로 의결됩니다. 헌법 개정안은 재적의원 3분의 2 이상의 찬성이 필요합니다. 대통령이 거부권을 행사한 법안은 재적의원 과반수 출석에 출석의원 3분의 2 이상의 찬성으로 재의결합니다.",
  },
  {
    question: "국회의원은 왜 여러 개의 법안을 동시에 발의하나요?",
    answer:
      "의원들은 자신의 정책 비전이나 지역구 현안을 해결하기 위해 다양한 분야의 법안을 발의합니다. 또한 법안 발의 건수는 의정활동의 중요한 지표 중 하나이기 때문에, 적극적인 입법 활동을 보여주기 위해 많은 법안을 발의하는 경향이 있습니다.",
  },
];

export default function GuidePage() {
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
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }}
      />

      {/* 헤더 */}
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">입법 과정 안내</h1>
        <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
          대한민국의 법률은 국회에서 만들어집니다. 국민의 대표인 국회의원이 법안을 제출하고, 전문
          위원회의 심사와 전체 회의(본회의)의 표결을 거쳐 법률이 됩니다. 이 과정을 이해하면 뉴스에
          나오는 &apos;법안 발의&apos;, &apos;위원회 통과&apos;, &apos;본회의 가결&apos; 같은 표현의
          의미를 정확히 알 수 있습니다.
        </p>
      </section>

      {/* 단계별 설명 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">법률이 만들어지는 4단계</h2>
        {steps.map((step) => (
          <div
            key={step.number}
            className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-sm font-bold text-white">
                {step.number}
              </span>
              <div>
                <h3 className="text-lg font-bold text-(--color-text-primary)">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
                  {step.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 위원회 역할 안내 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">국회 위원회의 역할</h2>
        <p className="text-sm leading-relaxed text-(--color-text-secondary)">
          국회에는 17개의 상임위원회가 있으며, 각 위원회는 특정 분야의 법안을 전문적으로 심사합니다.
          모든 법안은 본회의 표결 전에 반드시 소관 상임위원회의 심사를 거쳐야 합니다. 각 의원은
          하나의 상임위원회에 소속되어 활동합니다.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {committees.map((committee) => (
            <div
              key={committee.name}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
            >
              <h3 className="text-base font-bold text-(--color-text-primary)">{committee.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--color-text-secondary)">
                {committee.desc}
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-(--color-text-tertiary)">
          이 외에도 국토교통, 농림축산식품해양수산, 산업통상자원중소벤처기업, 문화체육관광,
          외교통일, 국회운영, 정보, 여성가족 위원회 등이 있습니다.{" "}
          <Link href="/committees" className="font-semibold text-(--color-primary) underline">
            위원회 현황
          </Link>
          에서 각 위원회의 활동과 소속 의원을 확인할 수 있습니다.
        </p>
      </section>

      {/* 법안의 유형 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">법안의 유형</h2>
        <p className="text-sm leading-relaxed text-(--color-text-secondary)">
          법안은 기존 법률을 어떻게 다루느냐에 따라 여러 유형으로 나뉩니다. 법안 제목에 포함된
          유형을 보면 해당 법안이 어떤 성격인지 빠르게 파악할 수 있습니다.
        </p>
        <div className="space-y-3">
          {billTypes.map((item) => (
            <div
              key={item.type}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
            >
              <h3 className="text-base font-bold text-(--color-text-primary)">{item.type}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--color-text-secondary)">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 알아두면 좋은 용어 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">알아두면 좋은 용어</h2>
        <div className="space-y-3">
          {terms.map((item) => (
            <div
              key={item.term}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
            >
              <h3 className="text-base font-bold text-(--color-text-primary)">{item.term}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--color-text-secondary)">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-(--color-text-tertiary)">
          더 많은 용어는{" "}
          <Link href="/glossary" className="font-semibold text-(--color-primary) underline">
            용어 사전
          </Link>
          에서 확인하세요.
        </p>
      </section>

      {/* 자주 묻는 질문 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">자주 묻는 질문</h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)"
            >
              <summary className="cursor-pointer list-none p-4 text-base font-bold text-(--color-text-primary) [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <span className="text-sm text-(--color-primary) transition-transform group-open:rotate-90">
                    ▶
                  </span>
                  {faq.question}
                </span>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-(--color-text-secondary)">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 더 알아보기 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">더 알아보기</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/guide/roles"
            className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5 no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            <h3 className="text-base font-bold text-(--color-text-primary)">
              국회의원은 무엇을 하나요?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
              국회의원의 4대 역할, 국회 운영 방식, 국회의원의 하루를 알아봅니다.
            </p>
          </Link>
          <Link
            href="/guide/budget"
            className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5 no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            <h3 className="text-base font-bold text-(--color-text-primary)">
              세금은 어떻게 쓰이나요?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
              국가 예산의 구성, 편성 과정, 국회의 심의·확정 역할을 알아봅니다.
            </p>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-6">
        <h2 className="text-lg font-bold text-(--color-text-primary)">직접 확인해 보세요</h2>
        <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
          위에서 설명한 입법 과정을 실제 데이터로 살펴볼 수 있습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/bills"
            className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
          >
            법안 목록 보기
          </Link>
          <Link
            href="/votes"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            표결 현황 보기
          </Link>
          <Link
            href="/members"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            내 지역 의원 찾기
          </Link>
        </div>
      </section>
    </div>
  );
}
