import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year} 지방선거 투표 안내 — 일정·준비물·투표 방법`,
    description: `${year}년 6월 3일 전국동시지방선거 투표 안내. 사전투표 5/29~30, 본투표 6/3. 투표 시간, 준비물, 투표용지 7장 순서를 안내합니다.`,
    alternates: {
      canonical: `https://www.lawmake.kr/local-elections/${year}/vote`,
    },
  };
}

const SCHEDULE = [
  { label: "후보자 등록", date: "5/14(목) ~ 5/15(금)" },
  { label: "선거운동 기간", date: "5/21(목) ~ 6/2(화)" },
  { label: "사전투표", date: "5/29(금) ~ 5/30(토)" },
  { label: "선거일 투표", date: "6/3(수)" },
];

const BALLOTS = [
  { name: "시·도지사", color: "#FFC0CB" },
  { name: "구·시·군의 장", color: "#90EE90" },
  { name: "시·도의회의원 (지역구)", color: "#87CEEB" },
  { name: "시·도의회의원 (비례대표)", color: "#DDA0DD" },
  { name: "구·시·군의회의원 (지역구)", color: "#FFDAB9" },
  { name: "구·시·군의회의원 (비례대표)", color: "#F0E68C" },
  { name: "교육감", color: "#D3D3D3" },
];

const CHECKLIST = [
  "신분증 (주민등록증, 운전면허증, 여권, 관공서 발행 사진이 있는 신분증)",
  "만 18세 이상 대한민국 국민 (2008년 6월 4일 이전 출생)",
  "해당 지역 주민등록이 되어 있는 유권자",
];

const FAQ = [
  {
    q: "투표소는 어디서 확인하나요?",
    a: "선관위 홈페이지(nec.go.kr) 또는 '선거정보' 앱에서 확인할 수 있습니다.",
  },
  {
    q: "사전투표는 아무 곳에서나 할 수 있나요?",
    a: "네, 사전투표는 전국 어디서나 가능합니다. 다만 관외 사전투표소에서는 일부 투표용지만 받을 수 있습니다.",
  },
  {
    q: "투표용지가 7장이면 어떻게 하나요?",
    a: "기표소에서 투표용지를 순서대로 받습니다. 각 투표용지마다 후보자 1명(또는 1개 정당)에 기표한 후 투표함에 넣으면 됩니다.",
  },
  {
    q: "투표 시간은 어떻게 되나요?",
    a: "사전투표: 오전 6시 ~ 오후 6시, 선거일: 오전 6시 ~ 오후 6시입니다.",
  },
];

export default async function VoteGuidePage({ params }: Props) {
  const { year } = await params;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <h1 className="text-2xl font-bold">{year} 지방선거 투표 안내</h1>

      {/* 일정 */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h2 className="mb-4 text-lg font-bold">선거 일정</h2>
        <div className="space-y-3">
          {SCHEDULE.map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-sm font-medium text-(--color-text-primary)">{s.label}</span>
              <span className="text-sm text-(--color-text-secondary)">{s.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 투표용지 */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h2 className="mb-4 text-lg font-bold">투표용지 7장</h2>
        <p className="mb-3 text-sm text-(--color-text-secondary)">
          지방선거에서는 최대 7장의 투표용지를 받습니다.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BALLOTS.map((b, i) => (
            <div
              key={b.name}
              className="flex flex-col items-center gap-1 rounded-lg p-3"
              style={{ backgroundColor: `${b.color}30` }}
            >
              <span className="text-lg font-bold text-(--color-text-primary)">{i + 1}</span>
              <span className="text-center text-xs font-medium text-(--color-text-secondary)">
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 준비물 */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h2 className="mb-4 text-lg font-bold">준비물</h2>
        <ul className="space-y-2">
          {CHECKLIST.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-(--color-text-secondary)">
              <span className="shrink-0 text-(--color-primary)">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h2 className="mb-4 text-lg font-bold">자주 묻는 질문</h2>
        <div className="space-y-4">
          {FAQ.map((f, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-(--color-text-primary)">Q. {f.q}</h3>
              <p className="mt-1 text-sm text-(--color-text-secondary)">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center">
        <Link
          href={`/local-elections/${year}`}
          className="text-sm text-(--color-primary) hover:underline"
        >
          ← 지방선거 메인으로
        </Link>
      </div>
    </div>
  );
}
