"use client";

import Link from "next/link";

interface Hotspot {
  region: string;
  district: string;
  headline: string;
  candidates: { name: string; party: string; partyColor: string; note?: string }[];
  context: string;
  newsHref?: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    region: "부산",
    district: "북구갑",
    headline:
      'D-19 · 후보등록 마감 · 보수 단일화 압박 정점 — 부산 의원 17명 중 10명 "단일화 필요", 朴 "절대 안 한다" vs 韓 "민심이 종속변수"',
    candidates: [
      {
        name: "하정우",
        party: "더불어민주당",
        partyColor: "#152484",
        note: "갤럽 39%로 3개 조사 연속 선두 · 양자 vs 韓 46% vs 40% 접전",
      },
      {
        name: "한동훈",
        party: "무소속",
        partyColor: "#9ca3af",
        note: '갤럽 29% · 단일 적합도 韓 45 vs 朴 39 · "정치공학적 단일화는 종속변수"',
      },
      {
        name: "박민식",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note: '갤럽 21% · "절대 안 한다 · 가능성 제로" 고수에 당내 단일화 압박 격화',
      },
    ],
    context:
      '장동혁 대표 "묻지마 단일화로는 시민 선택 못 받아" · 투표용지 인쇄 5/18(1차 시한) · 사전투표 전날 5/28(마지노선)',
  },
  {
    region: "경기",
    district: "평택을",
    headline:
      "D-19 · 5파전 후보등록 마감 — 갤럽 '김용남 29·조국 24·유의동 20', 범진보 단일화 반대 46 vs 찬성 29",
    candidates: [
      {
        name: "김용남",
        party: "더불어민주당",
        partyColor: "#152484",
        note: '갤럽 29% 선두 · "후보 단계 단일화 논의 없다"',
      },
      {
        name: "조국",
        party: "조국혁신당",
        partyColor: "#06275E",
        note: '갤럽 24% · "민심만 믿고 3표 차 승리" 단일화 거부 · 金과 감정의 골',
      },
      {
        name: "유의동",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note: '갤럽 20% · 단일화에 "신중" 입장 유지',
      },
      {
        name: "황교안",
        party: "자유와혁신",
        partyColor: "#FF7E00",
        note: '갤럽 8% · 前 총리 · "보수 합당까지 각오" 단일화 압박',
      },
      {
        name: "김재연",
        party: "진보당",
        partyColor: "#D6001C",
        note: "갤럽 4% · 진보당 상임대표",
      },
    ],
    context:
      "한국갤럽·뉴스1 5/14 발표 · 범진보 단일화 반대 46% vs 찬성 29% · 19~21대 보수 강세 험지",
  },
];

export default function ByElectionHotspots() {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-(--color-text-primary)">핫스팟 선거구</h2>
        <span className="text-xs text-(--color-text-tertiary)">
          5/15 기준 · 후보등록 마감 · D-19
        </span>
      </div>
      <p className="text-sm text-(--color-text-secondary)">
        14개 재보궐 선거구 중 가장 주목받는 두 곳입니다. 5/15 후보등록 마감 — 중앙선관위 데이터 반영
        후 전체 후보 정보가 자동 갱신됩니다.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {HOTSPOTS.map((h) => (
          <article
            key={h.district}
            className="overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)"
          >
            <header className="border-b border-(--color-border-primary) bg-(--color-bg-secondary) px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-xs font-medium text-(--color-text-secondary)">
                  {h.region}
                </span>
                <h3 className="text-base font-bold text-(--color-text-primary)">{h.district}</h3>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-(--color-text-secondary)">
                {h.headline}
              </p>
            </header>

            <ul className="divide-y divide-(--color-border-primary)">
              {h.candidates.map((c) => (
                <li key={c.name} className="flex items-start gap-2.5 px-4 py-2.5">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: c.partyColor }}
                    role="img"
                    aria-label={c.party}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-semibold text-(--color-text-primary)">
                        {c.name}
                      </span>
                      <span className="text-xs text-(--color-text-tertiary)">{c.party}</span>
                    </div>
                    {c.note && (
                      <p className="mt-0.5 text-xs text-(--color-text-secondary)">{c.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-(--color-border-primary) bg-(--color-bg-secondary) px-4 py-2.5">
              <p className="text-xs text-(--color-text-tertiary)">{h.context}</p>
            </footer>
          </article>
        ))}
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <span className="font-semibold">📌 안내</span> · 후보등록(5/14~15) 마감 후 전체 14개
        선거구의 모든 후보 정보가{" "}
        <Link href="/elections/2026-06-03" className="font-medium underline hover:no-underline">
          전체 선거구 현황
        </Link>{" "}
        섹션에 자동 갱신됩니다.
      </div>
    </section>
  );
}
