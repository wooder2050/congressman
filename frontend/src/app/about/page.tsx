import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "서비스 소개",
  description:
    "lawmake.kr은 국회의원 300명의 의정활동을 시민이 쉽게 확인할 수 있도록 만든 공익 정보 플랫폼입니다. 서비스의 목적, 데이터 출처, 운영 원칙을 소개합니다.",
  alternates: { canonical: "https://www.lawmake.kr/about" },
};

const features = [
  {
    title: "의원 의정활동 종합 분석",
    description:
      "출석률, 법안 발의 수, 본회의 표결 참여율, 재산 신고 내역까지 — 국회의원의 의정활동을 다양한 지표로 확인할 수 있습니다. 단순 데이터 나열이 아닌, 의원 간 비교와 시각화를 통해 직관적인 이해를 돕습니다.",
  },
  {
    title: "법안 심사 경과 추적",
    description:
      "발의된 법안이 위원회 심사, 본회의 표결을 거쳐 어떤 결과를 맞이했는지 전체 과정을 한눈에 볼 수 있습니다. AI 요약을 통해 복잡한 법안의 핵심 내용을 쉽게 파악할 수 있습니다.",
  },
  {
    title: "투명한 표결 기록",
    description:
      "본회의 표결에서 각 의원이 어떤 선택을 했는지 확인할 수 있습니다. 정당별 투표 경향과 개별 의원의 표결 이력을 분석하여 우리 대표가 어떤 입장을 취하고 있는지 알 수 있습니다.",
  },
  {
    title: "주간 국회 뉴스",
    description:
      "매주 국회에서 일어난 주요 입법 활동을 정리하여 전달합니다. 뉴스 영상과 기사 출처를 함께 제공하여, 시민이 국회 동향을 빠르게 파악하고 관련 보도를 직접 확인할 수 있도록 합니다.",
  },
  {
    title: "선거구 지도",
    description:
      "대한민국 254개 지역구를 지도에서 찾아 우리 동네 국회의원이 누구인지, 어떤 활동을 하고 있는지 바로 확인할 수 있습니다.",
  },
  {
    title: "입법 과정 교육 콘텐츠",
    description:
      "법안 발의부터 공포까지 입법 과정을 알기 쉽게 안내하고, 국회 전문 용어를 풀어 설명합니다. 시민 누구나 국회 활동을 이해할 수 있도록 돕는 교육 자료를 제공합니다.",
  },
];

const principles = [
  {
    title: "객관성",
    description:
      "특정 정당이나 의원에 편향되지 않습니다. 모든 의원의 활동을 동일한 기준으로 보여주며, 주간 뉴스에서도 여야 균형 잡힌 시각을 유지합니다.",
  },
  {
    title: "투명성",
    description:
      "모든 데이터의 출처를 명시하고, 서비스의 소스 코드를 GitHub에 공개합니다. 데이터 갱신 시각을 표시하여 이용자가 정보의 최신성을 직접 확인할 수 있습니다.",
  },
  {
    title: "접근성",
    description:
      "전문 지식이 없는 시민도 국회 활동을 쉽게 이해할 수 있도록 용어 설명과 교육 콘텐츠를 함께 제공합니다. 모바일 환경에서도 동일한 정보에 접근할 수 있습니다.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "홈",
              item: "https://www.lawmake.kr",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "서비스 소개",
              item: "https://www.lawmake.kr/about",
            },
          ],
        }}
      />

      {/* 헤더 */}
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">서비스 소개</h1>
        <p className="mt-4 text-base leading-relaxed text-(--color-text-secondary)">
          <strong>lawmake.kr</strong>은 대한민국 국회의원의 의정활동을 시민이 쉽고 투명하게 확인할
          수 있도록 만든 공익 정보 플랫폼입니다.
        </p>
      </section>

      {/* 왜 만들었나 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">왜 만들었나요?</h2>
        <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            국회의원은 국민의 대표로서 법률을 만들고, 예산을 심의하며, 정부를 감시합니다. 하지만
            우리 지역 의원이 국회에서 실제로 어떤 활동을 하고 있는지 쉽게 알기 어렵습니다.
          </p>
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            열린국회정보 시스템에서 관련 데이터를 공개하고 있지만, 방대한 양의 원시 데이터를 시민이
            직접 분석하기는 쉽지 않습니다. lawmake.kr은 이 공공 데이터를 수집·정리·시각화하여 시민
            누구나 쉽게 의정활동을 파악할 수 있도록 돕고자 합니다.
          </p>
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            알 권리는 민주주의의 기본입니다. 국민이 국회의원의 활동을 쉽게 확인하고 평가할 수 있을
            때, 더 나은 민주주의가 가능합니다.
          </p>
        </div>
      </section>

      {/* 주요 기능 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">주요 기능</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5"
            >
              <h3 className="text-base font-bold text-(--color-text-primary)">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 데이터 출처 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">데이터 출처</h2>
        <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            서비스에서 제공하는 모든 의정활동 데이터는{" "}
            <a
              href="https://open.assembly.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-(--color-primary) underline"
            >
              국회 열린국회정보
            </a>{" "}
            공공데이터 API를 통해 수집됩니다.
          </p>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
            <li>국회의원 인적사항 및 소속 정보</li>
            <li>법안 발의 현황 및 심사 경과</li>
            <li>본회의 표결 결과 및 의원별 투표 내역</li>
            <li>위원회 회의 정보</li>
          </ul>
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            데이터는 매일 자동으로 갱신되며, 마지막 갱신 시각은 페이지 하단에서 확인할 수 있습니다.
            원본 데이터 확인이 필요한 경우 열린국회정보 공식 사이트를 이용하시기 바랍니다.
          </p>
        </div>
      </section>

      {/* 운영 원칙 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">운영 원칙</h2>
        <div className="space-y-3">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5"
            >
              <h3 className="text-base font-bold text-(--color-text-primary)">{principle.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 데이터 갱신 주기 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">데이터 갱신 주기</h2>
        <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            lawmake.kr의 데이터는 국회 열린국회정보 API를 통해 주기적으로 자동 갱신됩니다.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { label: "법안 발의 현황", cycle: "매일" },
              { label: "본회의 표결 결과", cycle: "매일" },
              { label: "의원별 투표 내역", cycle: "매일" },
              { label: "출석 통계", cycle: "매일" },
              { label: "국회 일정", cycle: "매일" },
              { label: "의원 정보·사진", cycle: "매주" },
              { label: "위원회 회의록", cycle: "매주" },
              { label: "주간 국회 뉴스", cycle: "매주" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg bg-(--color-bg-secondary) px-3 py-2"
              >
                <span className="text-sm text-(--color-text-secondary)">{item.label}</span>
                <span className="text-xs font-semibold text-(--color-primary)">{item.cycle}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 오픈소스 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">오픈소스 프로젝트</h2>
        <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            lawmake.kr은 오픈소스 프로젝트입니다. 누구나 코드를 확인하고, 개선 사항을 제안하거나
            직접 기여할 수 있습니다.
          </p>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
            <li>
              소스 코드:{" "}
              <a
                href="https://github.com/wooder2050/congressman"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-(--color-primary) underline"
              >
                GitHub
              </a>
            </li>
            <li>
              버그 신고 및 기능 제안:{" "}
              <a
                href="https://github.com/wooder2050/congressman/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-(--color-primary) underline"
              >
                GitHub Issues
              </a>
            </li>
            <li>
              문의:{" "}
              <a
                href="mailto:lawmake.official@gmail.com"
                className="font-semibold text-(--color-primary) underline"
              >
                lawmake.official@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* 교육 콘텐츠 안내 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">국회를 더 잘 이해하고 싶다면</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/guide"
            className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            <h3 className="text-sm font-bold text-(--color-text-primary)">입법 과정 안내</h3>
            <p className="mt-1 text-xs text-(--color-text-tertiary)">법안이 만들어지는 과정</p>
          </Link>
          <Link
            href="/guide/roles"
            className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            <h3 className="text-sm font-bold text-(--color-text-primary)">국회의원의 역할</h3>
            <p className="mt-1 text-xs text-(--color-text-tertiary)">4대 역할과 국회 운영</p>
          </Link>
          <Link
            href="/guide/budget"
            className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            <h3 className="text-sm font-bold text-(--color-text-primary)">
              세금은 어떻게 쓰이나요?
            </h3>
            <p className="mt-1 text-xs text-(--color-text-tertiary)">국가 예산과 국회의 역할</p>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-6">
        <h2 className="text-lg font-bold text-(--color-text-primary)">직접 확인해 보세요</h2>
        <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
          우리 지역 국회의원이 어떤 활동을 하고 있는지, 관심 있는 법안이 어디까지 진행되었는지 지금
          바로 확인해 보세요.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/members"
            className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
          >
            의원 목록 보기
          </Link>
          <Link
            href="/map"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            내 지역 의원 찾기
          </Link>
          <Link
            href="/weekly"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            주간 뉴스 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
