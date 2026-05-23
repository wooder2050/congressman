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
      "조사별 0.1%p ~ 11%p 격차 — MBC 정원오 43 vs 오세훈 35, 에이스리서치 41.7 vs 41.6 초접전",
    candidates: [
      {
        name: "정원오",
        party: "더불어민주당",
        partyColor: "#152484",
        note: "성동구청장 출신 · MBC 5/16~17 43% · 케이스탯리서치 5/17~19 45%",
      },
      {
        name: "오세훈",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note: "현직 서울시장 · MBC 35% · 에이스리서치 5/19~20 41.6%로 정원오와 0.1%p 차",
      },
    ],
    context:
      "MBC·케이스탯리서치 등 조사에서는 정원오 우위(8~11%p), 에이스리서치·메트릭스 등에서는 오차범위 내 초접전 · 정원오 측은 '주폭·철근 누락' 등 오세훈 시정 비판, 오세훈 측은 인물 경쟁론·시정 연속성 강조 · 5/23 첫 주말 유세에서 정원오 노무현 17주기 추모 중계 시청 후 도봉·서대문·마포 순회, 오세훈 한강 러닝 행사로 시민 접촉 확대",
  },
  {
    region: "충남",
    title: "충남지사",
    headline: "민주당 우세 지역에서 야당 후보 오차범위 내 접근 — 5/22 보도 일제히 접전 구도 형성",
    candidates: [
      {
        name: "더불어민주당 후보",
        party: "더불어민주당",
        partyColor: "#152484",
        note: "기존 민주당 우세 지역 · 최근 조사에서 격차 좁혀짐",
      },
      {
        name: "국민의힘 후보",
        party: "국민의힘",
        partyColor: "#E61E2B",
        note: "오차범위 내 접근 · 보수 결집 효과",
      },
    ],
    context:
      "민주당이 전통적으로 우세를 보였던 충남에서 야당 후보가 오차범위 내로 따라붙었다는 보도가 5월 22일 일제히 나오며 판세가 흔들렸다 · 수도권 한강벨트와 함께 충청권은 여야 모두 최대 격전지로 분류 · 정청래 민주당 대표가 5/21 공식 선거운동 첫날 충북·강원을 우선 방문하며 충청권 표심 다지기에 나선 배경",
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
        후보가 오차범위 내로 따라붙으며 접전 구도가 형성됐습니다.
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
