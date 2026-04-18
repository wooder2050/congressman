import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "이용약관",
  description:
    "국회의원 의정활동 정보 서비스(lawmake.kr)의 이용약관입니다. 서비스 이용 조건, 데이터 출처, 면책 사항 등을 안내합니다.",
  alternates: { canonical: "https://www.lawmake.kr/terms" },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
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
              name: "이용약관",
              item: "https://www.lawmake.kr/terms",
            },
          ],
        }}
      />

      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">이용약관</h1>
        <p className="mt-3 text-sm text-(--color-text-tertiary)">시행일: 2025년 11월 1일</p>
        <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
          본 약관은 국회의원 의정활동 정보(이하 &apos;서비스&apos;)의 이용에 관한 기본적인 사항을
          규정합니다.
        </p>
      </section>

      <section className="space-y-6">
        <article className="space-y-3">
          <h2 className="text-xl font-bold">제1조 (목적)</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              본 약관은 lawmake.kr에서 제공하는 국회의원 의정활동 정보 서비스의 이용 조건 및 절차,
              이용자와 서비스 운영자 간의 권리·의무 및 책임 사항을 규정하는 것을 목적으로 합니다.
            </p>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">제2조 (서비스의 내용)</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              서비스는 대한민국 국회 의정활동 데이터를 시민에게 알기 쉽게 제공하는 비영리 목적의
              공익 정보 플랫폼으로, 다음과 같은 기능을 포함합니다.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
              <li>국회의원 프로필, 출석률, 법안 발의 현황, 표결 기록 조회</li>
              <li>발의 법안 검색 및 심사 경과 확인</li>
              <li>본회의 표결 결과 및 의원별 투표 내역 조회</li>
              <li>위원회 활동 현황 및 회의 정보</li>
              <li>선거구 지도를 통한 지역구 의원 검색</li>
              <li>의원 비교 기능</li>
              <li>주간 국회 뉴스 및 입법 과정 안내 등 교육 콘텐츠</li>
            </ul>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">제3조 (데이터 출처 및 정확성)</h2>
          <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              서비스에서 제공하는 의정활동 데이터는 국회 열린국회정보 공공데이터 API를 기반으로
              합니다.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
              <li>
                데이터는 정기적으로 갱신되며, 국회 원본 데이터와 일시적인 차이가 발생할 수 있습니다.
              </li>
              <li>
                서비스에서 제공하는 AI 요약, 주간 뉴스 등 가공 콘텐츠는 참고용이며, 정확성을
                보장하지 않습니다.
              </li>
              <li>
                공식 데이터 확인이 필요한 경우{" "}
                <a
                  href="https://open.assembly.go.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-(--color-primary) underline"
                >
                  열린국회정보
                </a>
                를 이용하시기 바랍니다.
              </li>
            </ul>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">제4조 (이용자의 의무)</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              이용자는 서비스를 이용함에 있어 다음 행위를 해서는 안 됩니다.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>
                자동화된 수단(크롤링, 스크래핑 등)을 이용하여 서비스에 과도한 부하를 주는 행위
              </li>
              <li>서비스에서 제공하는 데이터를 왜곡하여 유포하는 행위</li>
              <li>타인의 명예를 훼손하거나 법령에 위반되는 행위</li>
            </ul>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">제5조 (지식재산권)</h2>
          <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              서비스의 소스 코드는{" "}
              <a
                href="https://github.com/wooder2050/congressman"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-(--color-primary) underline"
              >
                GitHub
              </a>
              에 공개되어 있으며, 해당 저장소의 라이선스 조건에 따라 이용할 수 있습니다.
            </p>
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              국회 공공데이터는 「공공데이터의 제공 및 이용 활성화에 관한 법률」에 따라 제공되며,
              서비스에서 별도로 작성한 주간 뉴스, 용어 사전, 가이드 등의 콘텐츠 저작권은 서비스
              운영자에게 있습니다.
            </p>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">제6조 (면책 조항)</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <ul className="list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
              <li>
                서비스는 공공 데이터를 가공하여 제공하는 것으로, 데이터의 완전성·정확성·최신성을
                보장하지 않습니다.
              </li>
              <li>
                서비스 이용으로 발생한 직간접적 손해에 대해 서비스 운영자는 법적 책임을 지지
                않습니다.
              </li>
              <li>
                천재지변, 서버 장애, 외부 API 중단 등 불가항력적 사유로 인한 서비스 중단에 대해
                책임을 지지 않습니다.
              </li>
            </ul>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">제7조 (광고 게재)</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              서비스는 운영 비용 충당을 위해 Google 애드센스 등을 통한 광고를 게재할 수 있습니다.
              광고 콘텐츠에 대한 책임은 해당 광고주에게 있으며, 서비스는 광고의 내용에 대해 보증하지
              않습니다.
            </p>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">제8조 (약관의 변경)</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              본 약관은 관련 법령이나 서비스 정책의 변경에 따라 수정될 수 있으며, 변경 시 서비스
              내에 공지합니다. 변경된 약관에 동의하지 않는 이용자는 서비스 이용을 중단할 수
              있습니다.
            </p>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">제9조 (문의)</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              서비스 이용에 관한 문의, 의견, 불만 사항은 아래 채널을 통해 접수해 주시기 바랍니다.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
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
                GitHub 이슈:{" "}
                <a
                  href="https://github.com/wooder2050/congressman/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-(--color-primary) underline"
                >
                  github.com/wooder2050/congressman/issues
                </a>
              </li>
            </ul>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-6">
        <p className="text-sm leading-relaxed text-(--color-text-secondary)">
          개인정보 수집 및 이용에 관한 자세한 내용은{" "}
          <Link href="/privacy" className="font-semibold text-(--color-primary) underline">
            개인정보처리방침
          </Link>
          을 참고하시기 바랍니다.
        </p>
      </section>
    </div>
  );
}
