import Link from "next/link";

const ITEMS = [
  {
    emoji: "\u{1F3DB}\uFE0F",
    title: "국회의원의 역할",
    description:
      "국회의원은 국민의 대표로서 법률안을 발의하고 심사하며, 정부 예산안을 심의·확정하고, 행정부를 감시·견제하는 3대 핵심 기능을 수행합니다. 또한 국정감사와 국정조사를 통해 정부 정책의 적정성을 점검합니다.",
  },
  {
    emoji: "\u{1F4CB}",
    title: "법안은 어떻게 만들어질까?",
    description:
      "법안은 국회의원 10인 이상의 찬성으로 발의되며, 소관 상임위원회 심사 → 법제사법위원회 체계·자구 심사 → 본회의 표결의 3단계를 거칩니다. 재적의원 과반수 출석에 출석의원 과반수가 찬성하면 법률로 확정됩니다.",
  },
  {
    emoji: "\u{1F5F3}\uFE0F",
    title: "본회의 표결이란?",
    description:
      "위원회 심사를 통과한 법안이 국회의원 전원이 참석하는 본회의에서 최종 결정되는 절차입니다. 전자투표 방식으로 찬성·반대·기권을 표시하며, 투표 결과는 의원별로 공개됩니다.",
  },
  {
    emoji: "\u{1F4CA}",
    title: "의정활동 평가 기준",
    description:
      "lawmake에서는 출석률, 표결 참여율, 법안 발의 건수, 법안 가결률 등 객관적 데이터를 기반으로 의원의 의정활동을 종합 평가합니다. 모든 데이터는 열린국회정보 공공 API에서 제공됩니다.",
  },
];

export default function CivicKnowledge() {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">알아두면 좋은 국회 상식</h2>
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ITEMS.map((item) => (
            <div key={item.title} className="rounded-lg bg-(--color-bg-secondary) p-4">
              <div className="mb-2 text-2xl">{item.emoji}</div>
              <h3 className="text-sm font-bold text-(--color-text-primary)">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-(--color-text-secondary)">
                {item.description}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/guide"
            className="inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) hover:underline"
          >
            입법 과정 자세히 알아보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}
