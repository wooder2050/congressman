import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "광고 정책",
  description:
    "국회의원 의정활동 정보 서비스(lawmake.kr)의 광고 게재 정책입니다. Google 애드센스를 통한 광고 운영 방식, 이용자 데이터 처리, 광고 관련 권리를 안내합니다.",
  alternates: { canonical: "https://www.lawmake.kr/ads-policy" },
};

export default function AdsPolicyPage() {
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
              name: "광고 정책",
              item: "https://www.lawmake.kr/ads-policy",
            },
          ],
        }}
      />

      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">광고 정책</h1>
        <p className="mt-3 text-sm text-(--color-text-tertiary)">시행일: 2026년 3월 26일</p>
        <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
          lawmake.kr(이하 &apos;서비스&apos;)은 무료로 제공되는 비영리 공익 서비스로, 운영 비용을
          충당하기 위해 Google 애드센스를 통한 광고를 게재합니다. 본 정책은 광고 운영 방식과 이용자의
          권리를 안내합니다.
        </p>
      </section>

      <section className="space-y-6">
        <article className="space-y-3">
          <h2 className="text-xl font-bold">1. 광고 유형</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              본 서비스에는 Google 애드센스를 통해 아래와 같은 유형의 광고가 표시될 수 있습니다.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
              <li>디스플레이 광고 (배너 형태의 이미지 또는 텍스트 광고)</li>
              <li>인피드 광고 (콘텐츠 목록 사이에 자연스럽게 배치되는 광고)</li>
              <li>콘텐츠 내 광고 (기사 본문 사이에 삽입되는 광고)</li>
            </ul>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">2. 광고와 콘텐츠의 구분</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              모든 광고는 서비스의 자체 콘텐츠와 명확하게 구분됩니다. 광고 영역에는 &apos;광고&apos;
              또는 &apos;스폰서&apos; 표시가 포함되며, 서비스에서 제공하는 국회 의정활동 데이터와
              광고 콘텐츠는 완전히 분리되어 운영됩니다. 광고 내용은 서비스의 편집 방향이나 데이터
              분석 결과에 영향을 미치지 않습니다.
            </p>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">3. 맞춤형 광고와 쿠키</h2>
          <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              Google 애드센스는 쿠키를 사용하여 이용자의 관심사와 이전 방문 기록을 기반으로 관련성
              높은 광고를 표시할 수 있습니다. 이 과정에서 수집되는 데이터는 Google의 개인정보처리방침에
              따라 관리됩니다.
            </p>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
              <li>
                <strong>DoubleClick 쿠키</strong> — Google이 광고 게재 및 성과 측정에 사용하는
                쿠키입니다.
              </li>
              <li>
                <strong>Google 애널리틱스 쿠키</strong> — 서비스 이용 패턴 분석에 사용됩니다.
              </li>
            </ul>
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              Google의 광고 관련 쿠키 사용에 대한 자세한 내용은{" "}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-(--color-primary) underline"
              >
                Google 광고 정책
              </a>
              에서 확인하실 수 있습니다.
            </p>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">4. 맞춤형 광고 비활성화</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              이용자는 아래 방법을 통해 맞춤형 광고를 비활성화할 수 있습니다.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
              <li>
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-(--color-primary) underline"
                >
                  Google 광고 설정
                </a>
                에서 맞춤형 광고를 끌 수 있습니다.
              </li>
              <li>
                <a
                  href="https://optout.aboutads.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-(--color-primary) underline"
                >
                  Digital Advertising Alliance (DAA)
                </a>
                에서 관심 기반 광고를 옵트아웃할 수 있습니다.
              </li>
              <li>
                브라우저 설정에서 쿠키를 차단하거나 삭제할 수 있습니다. 다만, 쿠키를 차단할 경우
                일부 서비스 이용에 제한이 있을 수 있습니다.
              </li>
            </ul>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">5. 광고 수익의 사용</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              광고를 통해 발생하는 수익은 전액 서비스 운영 및 개선에 사용됩니다. 구체적으로 서버
              비용, 데이터 처리 비용, 서비스 품질 개선 등에 활용됩니다. lawmake.kr은 영리를
              목적으로 하지 않으며, 시민의 알 권리 보장과 의정활동 투명성 제고라는 공익적 가치를
              최우선으로 합니다.
            </p>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">6. 제3자 광고주 면책</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              광고 콘텐츠는 제3자 광고주에 의해 제작되며, 서비스는 광고의 정확성, 적법성, 품질에
              대해 보증하지 않습니다. 광고를 통해 이동하는 외부 사이트의 개인정보처리방침 및
              이용약관은 해당 사이트의 정책이 적용됩니다.
            </p>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">7. 정책 변경</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              본 광고 정책은 광고 운영 방식 변경, 관련 법령 개정 등에 따라 수정될 수 있습니다.
              변경 시 서비스 내 공지를 통해 안내하며, 최신 내용은 이 페이지에서 항상 확인하실 수
              있습니다.
            </p>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">8. 문의</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              광고 관련 문의, 부적절한 광고 신고 등은 아래 채널을 통해 접수해 주시기 바랍니다.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
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

      <section className="space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-6">
        <h2 className="text-lg font-bold">관련 정책</h2>
        <ul className="list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
          <li>
            <a href="/privacy" className="font-semibold text-(--color-primary) underline">
              개인정보처리방침
            </a>
          </li>
          <li>
            <a href="/terms" className="font-semibold text-(--color-primary) underline">
              이용약관
            </a>
          </li>
          <li>
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-(--color-primary) underline"
            >
              Google 개인정보처리방침
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
