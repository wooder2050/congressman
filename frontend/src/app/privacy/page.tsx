import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "국회의원 의정활동 정보 서비스(lawmake.kr)의 개인정보처리방침입니다. 수집하는 개인정보 항목, 이용 목적, 보유 기간 등을 안내합니다.",
  alternates: { canonical: "https://www.lawmake.kr/privacy" },
};

export default function PrivacyPage() {
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
              name: "개인정보처리방침",
              item: "https://www.lawmake.kr/privacy",
            },
          ],
        }}
      />

      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">개인정보처리방침</h1>
        <p className="mt-3 text-sm text-(--color-text-tertiary)">시행일: 2025년 11월 1일</p>
        <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
          국회의원 의정활동 정보(이하 &apos;서비스&apos;)는 이용자의 개인정보를 소중히 여기며,
          「개인정보 보호법」 등 관련 법령을 준수합니다. 본 개인정보처리방침을 통해 수집하는
          개인정보의 항목, 이용 목적, 보유 기간 등을 안내합니다.
        </p>
      </section>

      <section className="space-y-6">
        <article className="space-y-3">
          <h2 className="text-xl font-bold">1. 수집하는 개인정보 항목</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <h3 className="text-base font-bold text-(--color-text-primary)">
              자동으로 수집되는 정보
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
              서비스 이용 과정에서 아래 정보가 자동으로 생성되어 수집될 수 있습니다.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
              <li>접속 기기 정보 (브라우저 종류, 운영체제, 화면 해상도)</li>
              <li>접속 일시 및 이용 기록</li>
              <li>IP 주소</li>
              <li>쿠키 식별자</li>
            </ul>
          </div>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <h3 className="text-base font-bold text-(--color-text-primary)">
              별도로 수집하지 않는 정보
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
              본 서비스는 회원가입 기능을 제공하지 않으며, 이름, 이메일 주소, 전화번호 등 개인을
              직접 식별할 수 있는 정보를 별도로 수집하지 않습니다.
            </p>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">2. 개인정보의 이용 목적</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <ul className="list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
              <li>서비스 이용 통계 분석 및 품질 개선</li>
              <li>서비스 안정성 확보 및 부정 이용 방지</li>
              <li>맞춤형 광고 제공 (Google 애드센스)</li>
            </ul>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">3. 개인정보의 보유 및 파기</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              자동 수집된 이용 기록은 수집일로부터 1년간 보유한 뒤 파기합니다. 법령에 따라 보존이
              필요한 정보는 해당 기간 동안 보관합니다.
            </p>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">4. 쿠키 및 제3자 서비스</h2>
          <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              본 서비스는 아래 제3자 서비스를 이용하며, 각 서비스의 개인정보처리방침이 적용됩니다.
            </p>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
              <li>
                <strong>Google 애널리틱스(Google Tag Manager)</strong> — 서비스 이용 통계 분석 목적.
                쿠키를 통해 익명화된 이용 데이터를 수집합니다.
              </li>
              <li>
                <strong>Google 애드센스</strong> — 맞춤형 광고 제공 목적. 쿠키를 사용하여 이용자의
                관심사에 기반한 광고를 표시할 수 있습니다.
              </li>
            </ul>
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다. 다만, 쿠키를 거부할 경우
              서비스 이용에 일부 제한이 있을 수 있습니다.
            </p>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">5. 이용자의 권리</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제를 요청할 수 있으며, 개인정보
              수집·이용에 대한 동의를 철회할 수 있습니다. 관련 문의는 아래 연락처를 통해 접수해
              주시기 바랍니다.
            </p>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">6. 개인정보의 안전성 확보 조치</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <ul className="list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
              <li>모든 데이터 전송 시 HTTPS(SSL/TLS) 암호화 적용</li>
              <li>개인정보 접근 권한 최소화</li>
              <li>정기적인 보안 점검 실시</li>
            </ul>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">7. 개인정보처리방침의 변경</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              본 개인정보처리방침은 법령, 정책 또는 보안 기술의 변경에 따라 수정될 수 있으며, 변경
              사항은 서비스 내 공지를 통해 안내합니다. 최신 내용은 이 페이지에서 항상 확인하실 수
              있습니다.
            </p>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">8. 문의처</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              개인정보 관련 문의, 불만 처리, 피해 구제 등은 아래 채널을 통해 접수해 주시기 바랍니다.
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
    </div>
  );
}
