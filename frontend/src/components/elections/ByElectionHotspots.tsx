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

const CAMPAIGN_START = new Date(2026, 4, 21); // 5/21 공식 선거운동 개시
const ELECTION_DAY = new Date(2026, 5, 3); // 6/3 본투표

function daysUntil(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** 본투표까지 남은 일수 기준 진행 상태 문구 (매일 자동 갱신) */
function getStatusLabel(): string {
  const dDay = daysUntil(ELECTION_DAY);
  const dCampaign = daysUntil(CAMPAIGN_START);
  if (dDay <= 0) return "본투표일";
  const phase =
    dCampaign > 0
      ? `공식 선거운동 D-${dCampaign}`
      : dCampaign === 0
        ? "공식 선거운동 개시"
        : "공식 선거운동 진행 중";
  return `${phase} · 본투표 D-${dDay}`;
}

const HOTSPOTS: Hotspot[] = [
  {
    region: "부산",
    district: "북구갑",
    headline:
      "박민식 삭발로 단일화 사실상 무산 — 하정우·한동훈 오차범위 내 접전 속 보수표 분산 불가피",
    candidates: [
      {
        name: "하정우",
        party: "더불어민주당",
        partyColor: "#152484",
        note: "MBC 5/16~18 38% · 케이스탯리서치 35% · 보수 분열 굳어지며 민주당 선두 유지",
      },
      {
        name: "한동훈",
        party: "무소속",
        partyColor: "#9ca3af",
        note: "MBC 33% · 케이스탯리서치 31% · 한동훈 단일화 시 하정우와 38% 동률",
      },
      {
        name: "박민식",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note:
          'MBC 20% · 케이스탯리서치 20% · 5/21 삭발 단행하며 "원칙 없는 단일화는 결단코 없다" 완주 의지',
      },
    ],
    context:
      '한국리서치 의뢰 MBC 코리아리서치 5/16~18(선거구민 500명, ±4.4%p) · 박민식 후보가 공식 선거운동 첫날 어머니가 직접 이발기로 머리를 깎는 삭발식을 통해 단일화 거부 의지를 굳히며 한동훈을 "침입자·잔인한 배신자"로 비판 · 한동훈은 "박민식이 하정우 당선을 막지 못하게 하는 것"이라며 반박 · 박민식 측 "실무자 협상도 없다" 입장으로 단일화 사실상 무산 · 보수 단일화가 한동훈으로 이뤄질 경우 케이스탯리서치 조사에서 하·한 38% 동률 · 사전투표 전날 5/28이 정치권이 보는 마지막 단일화 데드라인이지만 협상 동력 사라진 상태',
  },
  {
    region: "경기",
    district: "평택을",
    headline:
      "5파전 · MBC·코리아리서치 5/16~18 김용남 31·조국 27 오차범위 내 접전 — 범여 단일 후보 적합도는 조국 39 우세로 역전",
    candidates: [
      {
        name: "김용남",
        party: "더불어민주당",
        partyColor: "#152484",
        note: "MBC 5/16~18 31% 선두 · 범여 단일 후보 적합도 36%",
      },
      {
        name: "조국",
        party: "조국혁신당",
        partyColor: "#06275E",
        note: "MBC 27% · 김용남과 오차범위 내 접전 · 범여 단일 후보 적합도 39%로 우세",
      },
      {
        name: "유의동",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note: "MBC 17% · 보수 단일 후보 · 김용남·조국과는 오차범위 밖 격차",
      },
      {
        name: "황교안",
        party: "자유와혁신",
        partyColor: "#FF7E00",
        note: "MBC 7% · 前 국무총리 · 보수 합당까지 각오한 단일화 압박",
      },
      {
        name: "김재연",
        party: "진보당",
        partyColor: "#D6001C",
        note: "MBC 2% · 진보당 상임대표",
      },
    ],
    context:
      '한국리서치 의뢰 MBC 코리아리서치 5/16~18(선거구민 500명, ±4.4%p) · 범여권 단일 후보 적합도 조국 39% vs 김용남 36%(진보층은 조국 58% vs 김용남 33%)로 갤럽 조사 대비 역전 · 5/24 fnnews 보도에 따르면 토론회에서 조국·유의동·황교안 후보가 단일화 \'O\'를 택했으나 김용남 캠프는 "내부 논의가 거의 없다"며 부정적 · 조국 "3표 차로 이겨도 이긴다"며 단독 완주 시사, 황교안(자유와혁신) "보수 합당까지 각오" 단일화 압박했으나 유의동 측 신중론 · 19~21대 보수 강세 험지 · 5/18 투표용지 인쇄 후 사퇴해도 후보명 그대로 표시',
  },
];

export default function ByElectionHotspots() {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-(--color-text-primary)">핫스팟 선거구</h2>
        <span className="text-xs text-(--color-text-tertiary)">{getStatusLabel()}</span>
      </div>
      <p className="text-sm text-(--color-text-secondary)">
        14개 재보궐 선거구 중 가장 주목받는 두 곳입니다. 5/21부터 6/2까지 13일간 공식 선거운동이
        진행됩니다. 5/18 투표용지 인쇄가 완료돼 이후 사퇴해도 인쇄된 후보 이름이 그대로 표시되며
        사표 위험이 점차 커지는 상황입니다. 사전투표 전날 5/28이 정치권이 보는 마지막 단일화
        데드라인이며, 한국갤럽 기준 무당층 26%(18~29세 50%·중도층 34%)의 막판 표 이동이 최대
        변수입니다.
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
