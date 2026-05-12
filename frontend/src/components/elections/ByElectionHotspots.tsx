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
      "SBS·넥스트리서치 — 하정우 38 · 박민식 26 · 한동훈 21, 보수 단일화 압박·TV 토론 공방 격화",
    candidates: [
      {
        name: "하정우",
        party: "더불어민주당",
        partyColor: "#152484",
        note: '3자 38%로 선두 · TV 토론은 "쌈박질할 시간 없다" 불참',
      },
      {
        name: "박민식",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note: "3자 26% — 첫 한동훈 추월 · 단일 적합도 42(韓 41) 비등",
      },
      {
        name: "한동훈",
        party: "무소속",
        partyColor: "#9ca3af",
        note: "3자 21% — 박민식에 첫 역전 · KBS 5/22 토론 즉응",
      },
    ],
    context:
      "SBS·넥스트리서치 5/1~3 조사(5/12 공표) · 단일화 전체 찬성 39 vs 반대 34 · 국힘 지지층 71% 찬성",
  },
  {
    region: "경기",
    district: "평택을",
    headline: "조국·유의동·김용남·김재연·황교안 5파전 — 단일화 무산 다자 구도",
    candidates: [
      {
        name: "조국",
        party: "조국혁신당",
        partyColor: "#06275E",
        note: "혁신당 대표 직접 출마",
      },
      {
        name: "유의동",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note: "前 정책위의장",
      },
      {
        name: "김용남",
        party: "더불어민주당",
        partyColor: "#152484",
      },
      {
        name: "김재연",
        party: "진보당",
        partyColor: "#D6001C",
      },
      {
        name: "황교안",
        party: "자유와혁신",
        partyColor: "#FF7E00",
        note: "前 국무총리",
      },
    ],
    context: "민주·국힘 단일화 공식 무산 · 19~21대 보수 강세 험지",
  },
];

export default function ByElectionHotspots() {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-(--color-text-primary)">핫스팟 선거구</h2>
        <span className="text-xs text-(--color-text-tertiary)">
          5/12 기준 · 후보등록 5/14~15 마감
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
