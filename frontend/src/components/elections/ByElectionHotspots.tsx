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
      'D-21 · 부산 시민사회 "박민식·한동훈 즉시 만나 단일화 협의" 공개 촉구 — 후보등록 임박(5/14~15)',
    candidates: [
      {
        name: "하정우",
        party: "더불어민주당",
        partyColor: "#152484",
        note: "SBS 3자 38% · KBS 3자 37%로 양대 조사 선두 유지",
      },
      {
        name: "박민식",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note: '"여당 후보 중심 단일화" 고수 · SBS 26%로 韓 첫 추월',
      },
      {
        name: "한동훈",
        party: "무소속",
        partyColor: "#9ca3af",
        note: '"시민 여론이 먼저" · 단일 후보 적합도 41%로 朴(42%)과 비등',
      },
    ],
    context:
      "부산범시민사회단체연합 5/13 기자회견 · 투표용지 인쇄 5/18 · 사전투표 전날 5/28이 단일화 시한",
  },
  {
    region: "경기",
    district: "평택을",
    headline: "D-21 · 5파전 + 황교안 '단일화·합당' 카드 — 김용남 28.8·유의동 22.5·조국 22.2 박빙",
    candidates: [
      {
        name: "김용남",
        party: "더불어민주당",
        partyColor: "#152484",
        note: "3자 선두 28.8% · 민주당 단수 공천",
      },
      {
        name: "유의동",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note: '22.5% · 단일화에 "신중" 입장 유지',
      },
      {
        name: "조국",
        party: "조국혁신당",
        partyColor: "#06275E",
        note: "22.2% · 혁신당 대표 직접 출마",
      },
      {
        name: "황교안",
        party: "자유와혁신",
        partyColor: "#FF7E00",
        note: '前 총리 · "보수 합당까지 각오" 단일화 압박',
      },
      {
        name: "김재연",
        party: "진보당",
        partyColor: "#D6001C",
        note: "진보당 상임대표",
      },
    ],
    context:
      "뉴스토마토 여론조사 · 19~21대 보수 강세 험지 · 황교안 단일화·합당 카드로 보수 재정렬 시도",
  },
];

export default function ByElectionHotspots() {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-(--color-text-primary)">핫스팟 선거구</h2>
        <span className="text-xs text-(--color-text-tertiary)">
          5/13 기준 · 후보등록 내일(5/14)부터 · D-21
        </span>
      </div>
      <p className="text-sm text-(--color-text-secondary)">
        14개 재보궐 선거구 중 가장 주목받는 두 곳입니다. 후보등록 마감 후 전체 후보 정보가 자동
        갱신됩니다.
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
        <span className="font-semibold">📌 안내</span> · 후보등록(5/14~15)이 완료되면 전체 14개
        선거구의 모든 후보 정보가{" "}
        <Link href="/elections/2026-06-03" className="font-medium underline hover:no-underline">
          전체 선거구 현황
        </Link>{" "}
        섹션에 자동 갱신됩니다.
      </div>
    </section>
  );
}
