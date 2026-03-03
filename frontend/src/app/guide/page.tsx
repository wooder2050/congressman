import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "입법 과정 안내",
  description:
    "대한민국 국회에서 법률이 만들어지는 과정을 알기 쉽게 설명합니다. 법안 발의부터 위원회 심사, 본회의 표결, 법률 공포까지 전체 입법 절차를 안내합니다.",
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
