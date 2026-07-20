import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "국회의원 의정활동 정보 서비스(lawmake.kr)의 개인정보처리방침입니다. 수집하는 개인정보 항목, 이용 목적, 보유 기간 등을 안내합니다.",
  alternates: { canonical: "https://www.lawmake.kr/privacy" },
  robots: { index: false, follow: true },
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
        <p className="mt-3 text-sm text-(--color-text-tertiary)">
          시행일: 2025년 11월 1일 · 개정일: 2026년 7월 20일
        </p>
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
              로그인·알림 이용 시 수집되는 정보 (선택)
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
              서비스의 기본 열람 기능은 로그인 없이 이용할 수 있습니다. 다만 법안 변경 알림(Lawmake
              Radar), 북마크, 관심사 설정 등 일부 기능을 이용하기 위해 이용자가 직접 Google 계정으로
              로그인하는 경우, 인증 제공자(Supabase)를 통해 아래 정보가 처리됩니다.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
              <li>Google 계정 정보 — 이메일 주소, 이름, 프로필 이미지</li>
              <li>서비스 내 설정 — 표시 이름, 관심 지역구, 관심 토픽</li>
              <li>북마크 — 저장한 법안·의원·속보</li>
              <li>알림 설정 및 이력 — 구독한 법안, 이메일 수신 여부, 알림 이메일 발송·클릭 기록</li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
              위 정보는 이용자가 로그인하거나 해당 기능을 사용할 때에만 처리되며, 전화번호·주소 등
              그 밖의 식별 정보는 수집하지 않습니다.
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
              <li>
                법안 변경 알림(Lawmake Radar) 이메일 발송 — 이용자가 구독한 법안의 처리 상태가 바뀔
                때 주 1회 이메일로 안내 (이용자가 알림을 설정한 경우에 한함)
              </li>
            </ul>
          </div>
        </article>

        <article className="space-y-3">
          <h2 className="text-xl font-bold">3. 개인정보의 보유 및 파기</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <ul className="list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
              <li>자동 수집된 이용 기록: 수집일로부터 1년간 보유 후 파기</li>
              <li>
                로그인 계정 및 알림 설정 정보: 이용자가 회원 탈퇴하거나 알림을 해지할 때까지
                보유하며, 탈퇴·해지 요청 시 지체 없이 파기 (관련 문의는 아래 연락처)
              </li>
              <li>발송한 알림 이메일 이력: 최대 1년간 보유 후 파기</li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
              법령에 따라 보존이 필요한 정보는 해당 기간 동안 보관하며, 보유 기간이 지난 정보는
              복구·재생이 불가능한 방법으로 파기합니다.
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
              <li>
                <strong>Supabase</strong> — 로그인·인증 및 알림 설정 저장 목적. 이용자가 로그인하는
                경우 이메일 주소 등 계정 정보가 처리됩니다.
              </li>
              <li>
                <strong>Resend</strong> — 법안 변경 알림 이메일 발송 목적. 알림을 설정한 이용자의
                이메일 주소로 주간 이메일을 전송합니다.
              </li>
            </ul>
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다. 다만, 쿠키를 거부할 경우
              서비스 이용에 일부 제한이 있을 수 있습니다. 법안 변경 알림 이메일은 발송된 이메일
              하단의 &lsquo;수신 거부&rsquo; 링크를 통해 언제든 전체 수신을 해지할 수 있으며, 알림
              관리 화면(/alerts)에서 개별 법안 알림을 해제할 수 있습니다.
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <h3 className="text-base font-bold text-(--color-text-primary)">
              개인정보의 국외 이전
            </h3>
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              서비스는 아래와 같이 개인정보 처리를 국외 사업자에게 위탁하며, 정보통신망을 통해 해당
              정보가 국외로 이전됩니다. 이용자는 국외 이전을 거부할 수 있으며, 이 경우 로그인이
              필요한 기능(알림·북마크 등)의 이용이 제한될 수 있습니다.
            </p>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-(--color-text-secondary)">
              <li>
                <strong>Supabase, Inc.</strong> (미국) — 이전 항목: 이메일·계정 식별자·설정 정보 /
                이전 목적: 로그인 인증·데이터 저장 / 이전 시점: 로그인 시 네트워크를 통해 전송 /
                보유 기간: 회원 탈퇴 시까지
              </li>
              <li>
                <strong>Resend (Plus Five Five, Inc.)</strong> (미국) — 이전 항목: 이메일 주소·메일
                본문 / 이전 목적: 알림 이메일 발송 / 이전 시점: 알림 발송 시 네트워크를 통해 전송 /
                보유 기간: 발송 처리 후 공급자 정책에 따름
              </li>
            </ul>
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
          <h2 className="text-xl font-bold">8. 개인정보 보호책임자 및 문의처</h2>
          <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
            <p className="text-sm leading-relaxed text-(--color-text-secondary)">
              서비스는 개인정보 처리에 관한 업무를 총괄하여 책임지고, 이용자의 문의·불만 처리 및
              피해 구제를 위해 아래와 같이 개인정보 보호책임자를 지정하고 있습니다. 개인정보 관련
              문의, 열람·정정·삭제 요청 등은 아래 채널로 접수해 주시기 바랍니다.
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
    </div>
  );
}
