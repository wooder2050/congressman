import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "6·3 지방선거 투표 안내 — 사전투표·본투표 일정·준비물·절차",
  description:
    "2026년 6월 3일 지방선거 투표 안내입니다. 사전투표는 5월 29~30일, 본투표는 6월 3일입니다. 투표 준비물, 투표 절차, 유의사항, 투표소 찾기 링크를 제공합니다.",
  alternates: { canonical: "https://www.lawmake.kr/elections/2026-06-03/vote" },
  openGraph: {
    title: "6·3 지방선거 투표 안내",
    description: "사전투표 5/29~30, 본투표 6/3. 준비물, 투표 절차, 유의사항, 투표소 찾기 안내.",
    url: "https://www.lawmake.kr/elections/2026-06-03/vote",
  },
};

const SCHEDULE = [
  {
    title: "사전투표",
    date: "5월 29일(금) ~ 30일(토)",
    time: "오전 6시 ~ 오후 6시",
    location: "전국 어디서나 (주소지 관계없이)",
    highlight: true,
  },
  {
    title: "본투표 (선거일)",
    date: "6월 3일(수)",
    time: "오전 6시 ~ 오후 6시",
    location: "주소지 관할 투표소",
    highlight: false,
  },
];

const CHECKLIST = [
  { text: "신분증 지참 (주민등록증, 운전면허증, 여권 등)", required: true },
  { text: "투표용지는 투표소에서 제공 (별도 준비 불필요)", required: false },
  { text: "기표용구는 투표소에 비치 (개인 필기구 사용 불가)", required: false },
];

const STEPS = [
  {
    number: "1",
    title: "신분 확인",
    desc: "투표소 입구에서 신분증을 제시하고 본인 확인을 합니다.",
  },
  {
    number: "2",
    title: "투표용지 수령",
    desc: "본인 확인 후 투표용지를 받습니다. 지방선거는 최대 7장입니다.",
  },
  { number: "3", title: "기표소 입장", desc: "기표소에 혼자 들어가 비밀투표를 합니다." },
  {
    number: "4",
    title: "기표",
    desc: "기표용구로 원하는 후보자 칸에 도장을 찍습니다. 정확히 한 칸에만 찍어야 합니다.",
  },
  {
    number: "5",
    title: "투표함 투입",
    desc: "기표한 투표용지를 접어 투표함에 넣으면 투표가 완료됩니다.",
  },
];

const FAQ = [
  {
    question: "사전투표는 어디서든 할 수 있나요?",
    answer:
      "네. 사전투표 기간(5/29~30)에는 전국 어느 사전투표소에서든 투표할 수 있습니다. 다만 관할 선거구가 아닌 곳에서 투표하면 '관외선거인'으로 처리되어 회송용 봉투에 넣어 투표합니다.",
  },
  {
    question: "대리투표가 가능한가요?",
    answer:
      "아닙니다. 투표는 반드시 본인이 직접 해야 합니다. 거동이 불편한 유권자는 투표소 내에서 가족 등의 도움을 받을 수 있으나, 기표 자체는 본인이 해야 합니다.",
  },
  {
    question: "투표 인증샷을 찍어도 되나요?",
    answer:
      "투표소 안에서는 촬영이 금지됩니다. 기표 내용이 노출되는 사진은 비밀투표 원칙에 위배됩니다. 투표소 밖에서 '투표했습니다' 스티커 등의 인증은 가능합니다.",
  },
  {
    question: "지방선거에서 투표용지는 몇 장인가요?",
    answer:
      "최대 7장입니다. 광역단체장, 기초단체장, 광역의원(지역구·비례), 기초의원(지역구·비례), 교육감을 각각 선출합니다. 재보궐선거 해당 지역은 국회의원 투표용지가 추가됩니다.",
  },
  {
    question: "투표 시간을 놓치면 어떻게 되나요?",
    answer:
      "오후 6시까지 투표소에 도착해 줄을 서 있으면 투표할 수 있습니다. 오후 6시 이후 도착은 투표가 불가능합니다.",
  },
];

const CAUTIONS = [
  "투표소 100m 이내에서 특정 후보를 지지하거나 반대하는 행위는 금지됩니다.",
  "기표소 안에서 투표용지를 촬영하면 처벌 대상입니다.",
  "투표용지에 후보자 이름 외에 다른 표시를 하면 무효표가 됩니다.",
  "음주 상태에서의 투표소 출입은 제한될 수 있습니다.",
];

export default function VoteGuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <BreadcrumbJsonLd
        items={[
          { name: "홈", href: "/" },
          { name: "6·3 선거", href: "/elections/2026-06-03" },
          { name: "투표 안내", href: "/elections/2026-06-03/vote" },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: "제9회 전국동시지방선거",
          startDate: "2026-06-03T06:00:00+09:00",
          endDate: "2026-06-03T18:00:00+09:00",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: "전국 투표소",
            address: { "@type": "PostalAddress", addressCountry: "KR" },
          },
          description: "2026년 제9회 전국동시지방선거 본투표",
          organizer: {
            "@type": "Organization",
            name: "중앙선거관리위원회",
            url: "https://www.nec.go.kr",
          },
        }}
      />

      {/* 헤더 */}
      <section>
        <p className="text-sm font-medium text-(--color-primary)">
          <Link href="/elections/2026-06-03" className="hover:underline">
            ← 6·3 선거 홈
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">투표 안내</h1>
        <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
          2026년 6월 3일 지방선거 투표 일정을 확인하세요. 사전투표는 5월 29일부터 30일까지, 본투표는
          6월 3일입니다. 준비물, 투표 절차, 유의사항을 안내합니다.
        </p>
      </section>

      {/* 일정 카드 */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SCHEDULE.map((s) => (
          <div
            key={s.title}
            className={`rounded-xl border p-5 ${
              s.highlight
                ? "border-blue-300 bg-blue-50"
                : "border-(--color-border-primary) bg-(--color-bg-primary)"
            }`}
          >
            <p className="text-sm font-semibold text-(--color-text-tertiary)">{s.title}</p>
            <p className="mt-1 text-xl font-bold">{s.date}</p>
            <p className="mt-2 text-sm text-(--color-text-secondary)">{s.time}</p>
            <p className="text-sm text-(--color-text-secondary)">{s.location}</p>
          </div>
        ))}
      </section>

      {/* 투표소 찾기 CTA */}
      <section>
        <a
          href="https://www.nec.go.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-(--color-primary-hover)"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          투표소 찾기 (선관위 바로가기)
        </a>
      </section>

      {/* 준비물 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">준비물</h2>
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
          <ul className="space-y-3">
            {CHECKLIST.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                    item.required
                      ? "bg-(--color-primary) text-white"
                      : "bg-(--color-bg-tertiary) text-(--color-text-tertiary)"
                  }`}
                >
                  {item.required ? "✓" : "—"}
                </span>
                <span className={item.required ? "font-medium" : "text-(--color-text-secondary)"}>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 투표 절차 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">투표 절차</h2>
        <div className="space-y-3">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex gap-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-sm font-bold text-white">
                {step.number}
              </span>
              <div>
                <p className="font-semibold">{step.title}</p>
                <p className="mt-1 text-sm text-(--color-text-secondary)">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 유의사항 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">유의사항</h2>
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <ul className="space-y-2">
            {CAUTIONS.map((caution, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <span className="mt-0.5 shrink-0">⚠️</span>
                {caution}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">자주 묻는 질문</h2>
        <div className="divide-y divide-(--color-border-primary) rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)">
          {FAQ.map((faq, i) => (
            <details key={i} className="group">
              <summary className="flex cursor-pointer items-center justify-between p-4 text-sm font-medium hover:bg-(--color-bg-secondary)">
                {faq.question}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="shrink-0 transition-transform group-open:rotate-180"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-(--color-text-secondary)">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 하단 CTA 반복 */}
      <section className="space-y-3">
        <a
          href="https://www.nec.go.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-(--color-primary-hover)"
        >
          투표소 찾기 (선관위 바로가기)
        </a>
        <Link
          href="/elections/2026-06-03"
          className="flex w-full items-center justify-center rounded-xl border border-(--color-border-primary) px-6 py-3 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-secondary)"
        >
          ← 6·3 선거 홈으로 돌아가기
        </Link>
      </section>
    </div>
  );
}
