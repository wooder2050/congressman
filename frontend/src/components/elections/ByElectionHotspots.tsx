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
      'D-14 · 투표용지 인쇄 완료(5/18) — 단일화 1차 데드라인 지나, 韓 "민심이 길 낸다" vs 朴 "1% 가능성도 없다" 평행선 지속',
    candidates: [
      {
        name: "하정우",
        party: "더불어민주당",
        partyColor: "#152484",
        note: "메트릭스 5/16~17 39% 선두 · 보수 분열 구도 굳어지며 민주당 우위",
      },
      {
        name: "한동훈",
        party: "무소속",
        partyColor: "#9ca3af",
        note: '메트릭스 33% · "이재명 정권 대리인 꺾기 위해 민심이 길 낸다" 대세론',
      },
      {
        name: "박민식",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note: '메트릭스 20% · "정치공학적 단일화는 1%도 없다" 강경 거부',
      },
    ],
    context:
      '5/18 투표용지 인쇄 시한 통과 — 이후 사퇴해도 후보 이름이 그대로 인쇄돼 사표 위험 · 사전투표 전날 5/28이 2차 마지노선 · 박형준 부산시장 후보 "1주~10일" 시한 제시했으나 단일화 협상 미개시',
  },
  {
    region: "경기",
    district: "평택을",
    headline:
      "D-14 · 5파전 · 범진보 단일화 반대 46% vs 찬성 29%, 단일화 협상 미타결 상태로 공식 선거운동 진입",
    candidates: [
      {
        name: "김용남",
        party: "더불어민주당",
        partyColor: "#152484",
        note: "갤럽 29% 선두 · 양자 대결 시 유의동 상대 54 vs 34",
      },
      {
        name: "조국",
        party: "조국혁신당",
        partyColor: "#06275E",
        note: "갤럽 24% · 양자 시 유의동 상대 48 vs 38 · 단일화 거부 · 김용남과 동률(범진보 선호 32%)",
      },
      {
        name: "유의동",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note: '갤럽 20% · 보수 단일 후보 · "보수 단일화 의지 있나" 범여권 단일화 압박',
      },
      {
        name: "황교안",
        party: "자유와혁신",
        partyColor: "#FF7E00",
        note: "갤럽 8% · 前 국무총리 · 보수 합당까지 각오한 단일화 압박",
      },
      {
        name: "김재연",
        party: "진보당",
        partyColor: "#D6001C",
        note: "갤럽 4% · 진보당 상임대표",
      },
    ],
    context:
      "한국갤럽·뉴스1 5/14 · 범진보 단일화 반대 46% vs 찬성 29% · 19~21대 보수 강세 험지 · 5/18 투표용지 인쇄 후 사퇴해도 후보명 그대로 표시",
  },
];

export default function ByElectionHotspots() {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-(--color-text-primary)">핫스팟 선거구</h2>
        <span className="text-xs text-(--color-text-tertiary)">
          5/20 기준 · 공식 선거운동 D-1 · 본투표 D-14
        </span>
      </div>
      <p className="text-sm text-(--color-text-secondary)">
        14개 재보궐 선거구 중 가장 주목받는 두 곳입니다. 내일(5/21)부터 공식 선거운동 13일이
        시작됩니다. 5/18 투표용지 인쇄가 완료돼 이후 사퇴해도 인쇄된 후보 이름이 그대로 표시되며
        사표 위험이 점차 커지는 상황입니다.
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
