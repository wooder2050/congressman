import Link from "next/link";

const TOPICS = [
  {
    emoji: "\u{1F3E5}",
    name: "보건·의료",
    description:
      "건강보험 보장 확대, 의료인력 양성, 공공의료 강화 등 국민 건강을 위한 법안들이 논의되고 있습니다.",
  },
  {
    emoji: "\u{1F3E0}",
    name: "부동산·주거",
    description:
      "주택 공급 확대, 임대차 보호, 재건축·재개발 규제 완화 등 주거 안정을 위한 입법 활동이 활발합니다.",
  },
  {
    emoji: "\u{1F4B0}",
    name: "경제·산업",
    description:
      "기업 규제 완화, 신산업 육성, 공정거래, 소상공인 지원 등 경제 성장과 공정 경쟁을 위한 법안들입니다.",
  },
  {
    emoji: "\u{1F476}",
    name: "육아·교육",
    description:
      "저출생 대응, 보육 지원, 교육 과정 개선, 학생 인권 보호 등 미래 세대를 위한 정책이 추진됩니다.",
  },
  {
    emoji: "\u{1F4BC}",
    name: "노동·고용",
    description:
      "근로시간 조정, 비정규직 보호, 산업안전, 최저임금 등 노동 환경 개선을 위한 법안들이 다뤄지고 있습니다.",
  },
  {
    emoji: "\u{1F331}",
    name: "환경·에너지",
    description:
      "탄소중립, 재생에너지 확대, 환경오염 규제, 기후변화 대응 등 지속가능한 미래를 위한 입법이 진행 중입니다.",
  },
];

export default function TopicGuide() {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">주제별 법안 가이드</h2>
      <p className="text-sm text-(--color-text-secondary)">
        22대 국회에서 활발하게 논의되는 주요 분야별 법안 동향을 살펴보세요.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((topic) => (
          <Link
            key={topic.name}
            href={`/bills?topic=${encodeURIComponent(topic.name)}`}
            className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 no-underline transition-colors hover:bg-(--color-bg-hover)"
          >
            <div className="mb-2 text-2xl">{topic.emoji}</div>
            <h3 className="text-sm font-bold text-(--color-text-primary)">{topic.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-(--color-text-secondary)">
              {topic.description}
            </p>
          </Link>
        ))}
      </div>
      <div className="text-center">
        <Link
          href="/guide/topics"
          className="inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) hover:underline"
        >
          15개 분야별 입법 동향 자세히 보기 →
        </Link>
      </div>
    </section>
  );
}
