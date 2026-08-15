import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSlot from "@/components/ads/AdSlot";

export const metadata: Metadata = {
  title: "데이터 수집·산출 방법론",
  description:
    "lawmake.kr이 국회 의정활동 데이터를 수집하는 방법, 출석률·의정활동 점수 등 자체 지표의 산출 공식, AI 요약 생성·검수 절차, 오류 정정 절차를 공개합니다.",
  alternates: { canonical: "https://www.lawmake.kr/about/methodology" },
};

/** 열린국회정보에서 수집하는 원천 데이터 (22대 국회 기준 규모) */
const sources = [
  { label: "국회의원 인적사항", detail: "현직 300명 + 사퇴·승계 이력" },
  { label: "발의 법안", detail: "약 2만 건 (매일 갱신)" },
  { label: "본회의 표결", detail: "안건 1,600건 이상" },
  { label: "의원별 표결 기록", detail: "35만 건 이상" },
  { label: "위원회 회의록", detail: "3만 7천 건 이상" },
  { label: "법안 심사경과", detail: "3만 건 이상" },
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "홈", item: "https://www.lawmake.kr" },
            {
              "@type": "ListItem",
              position: 2,
              name: "서비스 소개",
              item: "https://www.lawmake.kr/about",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "데이터 수집·산출 방법론",
              item: "https://www.lawmake.kr/about/methodology",
            },
          ],
        }}
      />

      {/* 헤더 */}
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">데이터 수집·산출 방법론</h1>
        <p className="mt-4 text-base leading-relaxed text-(--color-text-secondary)">
          lawmake.kr의 모든 숫자에는 근거가 있습니다. 이 페이지는 데이터를 어디서 어떻게 가져오는지,
          사이트가 직접 계산하는 지표는 어떤 공식으로 산출되는지, 오류를 발견했을 때 어떻게 정정을
          요청할 수 있는지를 공개합니다.
        </p>
      </section>

      {/* 1. 데이터 수집 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">1. 데이터 수집</h2>
        <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            원천 데이터는{" "}
            <a
              href="https://open.assembly.go.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-(--color-primary) underline"
            >
              국회 열린국회정보
            </a>{" "}
            공공데이터 API에서 매일 자동으로 수집합니다. 법안의 &lsquo;제안이유 및
            주요내용&rsquo;처럼 API가 제공하지 않는 항목은 의안정보시스템 공개 페이지에서 별도로
            수집해 보완합니다.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {sources.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-lg bg-(--color-bg-secondary) px-3 py-2"
              >
                <span className="text-sm text-(--color-text-secondary)">{s.label}</span>
                <span className="text-xs font-semibold text-(--color-primary)">{s.detail}</span>
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            수집 과정에서 데이터를 임의로 수정하지 않습니다. 다만 API 응답의 형식 오류(타입 불일치,
            표기 불일치 등)는 교정하며, 원본과 다른 값이 의심되는 경우 원본 시스템을 우선합니다.
          </p>
        </div>
      </section>

      {/* 2. 사이트가 직접 계산하는 지표 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">2. 이 사이트가 직접 계산하는 지표</h2>
        <p className="text-sm leading-relaxed text-(--color-text-secondary)">
          아래 지표들은 국회가 발표하는 값이 아니라, lawmake.kr이 원천 데이터에서 자체 공식으로
          산출하는 값입니다. 같은 이름의 수치라도 산출 방식이 다른 다른 매체·기관의 값과 다를 수
          있습니다.
        </p>

        <div className="space-y-3">
          {/* 출석률 */}
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <h3 className="text-base font-bold text-(--color-text-primary)">본회의 출석률</h3>
            <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
              국회는 의원별 출석 통계를 API로 제공하지 않습니다. lawmake.kr은 의원별 표결 기록 35만
              건에서 <strong>불참(absent)이 아닌 표결의 비율</strong>로 출석률을 계산합니다. 표결이
              이루어진 본회의만 집계 대상이 되므로, 국회사무처가 집계하는 회의 출석부 기준
              출석률과는 다를 수 있습니다.
            </p>
          </div>

          {/* 종합 점수 */}
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <h3 className="text-base font-bold text-(--color-text-primary)">
              의정활동 종합 점수 (100점 만점, S~D 등급)
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
              네 가지 영역을 가중 합산합니다.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                { label: "본회의 출석률", weight: "30점", how: "출석률 × 30" },
                { label: "표결 참여율", weight: "25점", how: "참여율 × 25" },
                { label: "대표발의 생산성", weight: "25점", how: "월평균 발의 백분위 × 25" },
                { label: "법안 통과율", weight: "20점", how: "보정 통과율 백분위 × 20" },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-(--color-bg-secondary) px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-(--color-text-primary)">
                      {m.label}
                    </span>
                    <span className="text-xs font-semibold text-(--color-primary)">{m.weight}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-(--color-text-tertiary)">{m.how}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
              등급은 90점 이상 S, 80점 이상 A, 70점 이상 B, 60점 이상 C, 그 미만 D입니다. 발의와
              통과율은 절대 점수가 아니라 <strong>전체 의원 대비 백분위</strong>로 환산합니다 —
              &ldquo;몇 건이면 만점&rdquo;이라는 임의 기준을 두지 않기 위해서입니다.
            </p>
          </div>

          {/* 재직기간 정규화 */}
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <h3 className="text-base font-bold text-(--color-text-primary)">
              재직기간 정규화 — 재보궐·승계 의원 보정
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
              발의 건수를 그대로 비교하면 임기 중간에 합류한 의원(재보궐 당선·비례 승계)이
              구조적으로 불리합니다. 그래서 대표발의는 절대 건수가 아니라{" "}
              <strong>재직 개월수로 나눈 월평균 생산성</strong>으로 비교합니다.
            </p>
            <div className="mt-3 rounded-lg bg-(--color-bg-secondary) px-4 py-3">
              <p className="text-sm text-(--color-text-secondary)">
                월생산성 = (본인 발의 건수 + 전체 평균 월생산성 × 3) ÷ (재직 개월수 + 3)
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
              분자·분모에 &ldquo;전체 평균 3개월분&rdquo;을 더하는 이유는 재직 기간이 아주 짧은
              의원의 수치가 우연에 좌우되는 것을 막기 위해서입니다(사전값 평활). 재직 90일 미만인
              의원의 순위는 표본이 얕아 <strong>&lsquo;잠정&rsquo;</strong>으로 표시합니다.
            </p>
          </div>

          {/* 베이지안 평활 */}
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <h3 className="text-base font-bold text-(--color-text-primary)">
              법안 통과율 — 소표본 보정
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
              발의 2건 중 1건이 통과된 의원(50%)이 발의 60건 중 20건이 통과된 의원(33%)보다 정말
              &ldquo;잘하고 있다&rdquo;고 말할 수 있을까요? 표본이 작을수록 통과율은 우연에
              좌우됩니다. lawmake.kr은 베이지안 평활을 적용해 이 왜곡을 줄입니다.
            </p>
            <div className="mt-3 rounded-lg bg-(--color-bg-secondary) px-4 py-3">
              <p className="text-sm text-(--color-text-secondary)">
                보정 통과율 = (본인 통과 건수 + 전체 통과율 × 10) ÷ (본인 발의 건수 + 10)
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
              가상표본 10건을 전체 평균 통과율로 채워 넣는 방식입니다. 발의가 많은 의원일수록 본인
              실적이, 적은 의원일수록 전체 평균이 더 크게 반영됩니다.
            </p>
          </div>

          {/* 겸직 제외 */}
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <h3 className="text-base font-bold text-(--color-text-primary)">
              국무위원 겸직·사퇴 의원 처리
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
              장관·총리를 겸직 중인 의원은 국회 표결에 참여하기 어려운 기간이 있으므로{" "}
              <strong>평가·순위 산정에서 제외</strong>하고, 상세 페이지에 겸직 사실을 표시합니다.
              과거 겸직 이력이 있는 의원은 겸직 기간을 재직 개월수에서 빼고 계산합니다. 사퇴한
              의원은 다른 의원의 순위·백분위 계산에 영향을 주지 않도록 모수에서 제외합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 3. AI 요약 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">3. AI 요약의 생성과 검수</h2>
        <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            법안 상세 페이지의 &lsquo;AI 요약&rsquo;은 국회에 제출된 원문(제안이유 및 주요내용)을
            바탕으로 AI(Anthropic Claude)가 생성한 해설입니다. 한 줄 요약과 함께
            상황–문제–변화–영향의 4단 구조로 정리하며, 생성 후 사람이 검수한 뒤 게시합니다.
          </p>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
            <li>AI가 생성한 영역에는 &lsquo;AI 요약&rsquo; 표시를 명확히 붙입니다.</li>
            <li>
              요약과 원문이 다르게 읽힌다면 원문이 우선입니다 — 원문을 같은 페이지에 함께
              제공합니다.
            </li>
            <li>오류 제보가 접수되면 확인 후 해당 요약을 수정하거나 내립니다.</li>
          </ul>
        </div>
      </section>

      {/* 4. 한계 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">4. 데이터의 한계</h2>
        <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <ul className="list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
            <li>원천 API의 반영 지연에 따라 실제 국회 상황보다 하루 안팎 늦을 수 있습니다.</li>
            <li>
              출석률은 표결 기록 기반 추정치로, 국회사무처의 출석부 기준 통계와 다를 수 있습니다.
            </li>
            <li>
              종합 점수는 계량 가능한 활동만 반영합니다. 상임위 질의, 지역구 활동, 정책 연구처럼
              수치화되지 않는 의정활동은 점수에 포함되지 않습니다.
            </li>
            <li>
              점수·등급은 의원의 자질에 대한 종합 평가가 아니라, 공개 데이터로 확인 가능한 활동량의
              상대 비교입니다.
            </li>
          </ul>
        </div>
      </section>

      {/* 5. 정정 절차 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">5. 오류 제보와 정정</h2>
        <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            사실과 다른 데이터, 잘못된 요약, 산출 오류를 발견하셨다면 알려주세요. 접수된 제보는 원본
            데이터와 대조해 확인하고, 오류로 확인되면 정정합니다.
          </p>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
            <li>
              이메일:{" "}
              <a
                href="mailto:lawmake.official@gmail.com"
                className="font-semibold text-(--color-primary) underline"
              >
                lawmake.official@gmail.com
              </a>
            </li>
            <li>
              GitHub Issues:{" "}
              <a
                href="https://github.com/wooder2050/congressman/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-(--color-primary) underline"
              >
                wooder2050/congressman
              </a>
            </li>
          </ul>
          <p className="text-sm leading-relaxed text-(--color-text-secondary)">
            산출 로직 자체가 공개되어 있으므로(오픈소스), 공식의 타당성에 대한 문제 제기와 개선
            제안도 환영합니다.
          </p>
        </div>
      </section>

      <AdSlot />

      {/* CTA */}
      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-6">
        <h2 className="text-lg font-bold text-(--color-text-primary)">함께 보기</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/about"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            서비스 소개
          </Link>
          <Link
            href="/guide"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            입법 과정 안내
          </Link>
          <Link
            href="/members"
            className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-primary) px-4 py-2 text-sm font-medium text-(--color-text-primary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            의원 목록
          </Link>
        </div>
      </section>
    </div>
  );
}
