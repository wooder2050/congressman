"use client";

const ELECTION_DAY = new Date(2026, 5, 3); // 6/3 본투표

function daysUntil(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** 본투표까지 남은 일수 기준 진행 상태 문구 (매일 자동 갱신) */
function getStatusLabel(): string {
  const dDay = daysUntil(ELECTION_DAY);
  if (dDay <= 0) return "본투표일";
  return `본투표 D-${dDay}`;
}

interface Hotspot {
  region: string;
  title: string;
  headline: string;
  candidates: { name: string; party: string; partyColor: string; note?: string }[];
  context: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    region: "서울",
    title: "서울시장",
    headline:
      "조사별 0.1%p ~ 11%p 격차 — 전화면접 정원오 우세, ARS는 오차범위 내 초접전",
    candidates: [
      {
        name: "정원오",
        party: "더불어민주당",
        partyColor: "#152484",
        note:
          "성동구청장 출신 · KBS·한국리서치 5/16~20 45% · 채널A 5/17~19 43.9% · 에이스리서치 5/19~20 41.7%",
      },
      {
        name: "오세훈",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note:
          "현직 서울시장 · KBS 34% · 채널A 35.7% · 에이스리서치 41.6%로 정원오와 0.1%p 차",
      },
    ],
    context:
      "전화면접(KBS·한국리서치 11%p, 채널A 8.2%p)에서는 정원오 우위, ARS(에이스리서치 0.1%p, 스트레이트뉴스 0.4%p)에서는 초접전 — 보름 사이 정원오 7.2%p 하락·오세훈 4.6%p 상승하며 격차 급속 축소 · 5/24 부처님오신날 두 후보 종로 조계사 봉축법요식 나란히 참석 · 정원오는 봉축식 뒤 광진·강동·송파 재개발·재건축 간담회와 공공임대 임차인 면담으로 부동산 표심 공략, 오세훈은 사찰 5곳 순회하며 '불심 잡기'에 집중",
  },
  {
    region: "충남",
    title: "충남지사",
    headline:
      "리얼미터 5/18~19 박수현 43.5 vs 김태흠 43.9 — 0.4%p 차 오차범위 내 초접전",
    candidates: [
      {
        name: "박수현",
        party: "더불어민주당",
        partyColor: "#152484",
        note: "前 청와대 국민소통수석 · 리얼미터 43.5% · 서남권 39.2%로 약세",
      },
      {
        name: "김태흠",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note: "현직 충남지사 · 리얼미터 43.9% · 천안 45.0%, 서남권 48.8% 우세",
      },
    ],
    context:
      "리얼미터 5/18~19 충남 거주 18세 이상 806명 · 박수현 43.5% vs 김태흠 43.9%로 0.4%p 차 초접전 · 민주당 우세 지역으로 분류되던 충남에서 현직 김태흠 지사가 천안·서남권 우세를 등에 업고 오차범위 내까지 따라붙음 · 정당 지지도는 민주당 43%·국민의힘 37%로 민주당 우위 · 수도권 한강벨트와 함께 충청권은 여야 모두 최대 격전지로 분류 · 정청래 민주당 대표가 5/21 공식 선거운동 첫날 충북·강원 방문으로 충청권 표심 다지기",
  },
  {
    region: "전북",
    title: "전북지사",
    headline: "전통 민주당 텃밭에 야당 후보 오차범위 내 접근 — 호남권 판세 변화 신호",
    candidates: [
      {
        name: "더불어민주당 후보",
        party: "더불어민주당",
        partyColor: "#152484",
        note: "전통 민주당 우세 지역 · 격차 축소",
      },
      {
        name: "국민의힘 후보",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note: "오차범위 내 접근 · 호남권 균열 시도",
      },
    ],
    context:
      "민주당 텃밭으로 평가되던 전북 지사 선거에서 야당 후보가 오차범위 내로 접근하며 호남권 판세 변화 신호로 해석됨 · 국민의힘은 광역단체장 5인 영남권 연석회의 등 보수 결집과 함께 호남권 균열 시도로 외연 확대 노림 · 광주·전남 일부 지역의 무투표 당선 비율이 높아 '풀뿌리 민주주의 위기' 우려와 맞물려 호남권 투표율이 변수",
  },
];

export default function LocalGovernorHotspots() {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-(--color-text-primary)">광역단체장 격전지</h2>
        <span className="text-xs text-(--color-text-tertiary)">{getStatusLabel()}</span>
      </div>
      <p className="text-sm text-(--color-text-secondary)">
        17개 시·도지사 선거 중 판세가 가장 요동치는 곳을 모았습니다. 서울시장은 조사별로 0.1%p
        초접전부터 11%p 격차까지 큰 폭으로 출렁이고, 민주당 우세 지역이던 충남·전북에서도 야당
        후보가 오차범위 내로 따라붙으며 접전 구도가 형성됐습니다. 5/24 부처님오신날과 맞물린 둘째
        주말 유세에서는 여야 모두 막판 표심 결집에 총력을 기울이고 있습니다.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HOTSPOTS.map((h) => (
          <article
            key={h.region}
            className="overflow-hidden rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary)"
          >
            <header className="border-b border-(--color-border-primary) bg-(--color-bg-secondary) px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5 text-xs font-medium text-(--color-text-secondary)">
                  {h.region}
                </span>
                <h3 className="text-base font-bold text-(--color-text-primary)">{h.title}</h3>
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
    </section>
  );
}
