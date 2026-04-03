import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "앱 지원",
  description:
    "국회의원 의정활동 정보 앱에 대한 지원 정보입니다. 문의, 버그 신고, 기능 요청은 이 페이지를 통해 안내받으실 수 있습니다.",
  alternates: { canonical: "https://www.lawmake.kr/support" },
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-2xl py-12">
      <h1 className="text-3xl font-bold">앱 지원</h1>
      <p className="mt-3 text-base leading-relaxed text-(--color-text-secondary)">
        국회의원 의정활동 정보 앱을 이용해 주셔서 감사합니다. 아래에서 도움이 필요한 내용을 확인해
        주세요.
      </p>

      {/* 앱 소개 */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">앱 소개</h2>
        <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
          lawmake.kr은 대한민국 국회의원 300명의 의정활동 데이터를 시민이 쉽게 확인할 수 있도록 만든
          공익 정보 플랫폼입니다. 열린국회정보 공공데이터를 기반으로 출석률, 법안 발의, 본회의 표결,
          재산 신고 등의 정보를 제공합니다.
        </p>
      </section>

      {/* 주요 기능 */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">주요 기능</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-(--color-text-secondary)">
          <li>• 국회의원 의정활동 종합 분석 (출석률, 표결 참여율, 법안 발의)</li>
          <li>• 법안 검색 및 AI 요약</li>
          <li>• 본회의 표결 결과 조회</li>
          <li>• 선거구 지도에서 우리 동네 의원 찾기</li>
          <li>• 의원 비교 기능</li>
          <li>• 주간 국회 뉴스 및 기사 상세</li>
          <li>• 위원회 활동 및 회의록</li>
          <li>• 국회 일정 확인</li>
        </ul>
      </section>

      {/* 문의 및 지원 */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">문의 및 지원</h2>
        <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
          앱 이용 중 문제가 발생하거나 개선 사항을 제안하고 싶으시면 아래 방법으로 연락해 주세요.
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-secondary) p-4">
            <h3 className="text-sm font-semibold">이메일 문의</h3>
            <a
              href="mailto:lawmake.official@gmail.com"
              className="mt-1 block text-sm text-(--color-primary) no-underline hover:underline"
            >
              lawmake.official@gmail.com
            </a>
          </div>
          <div className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-secondary) p-4">
            <h3 className="text-sm font-semibold">버그 신고 및 기능 요청</h3>
            <a
              href="https://github.com/wooder2050/congressman/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-sm text-(--color-primary) no-underline hover:underline"
            >
              GitHub Issues →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">자주 묻는 질문</h2>
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-(--color-text-primary)">
              Q. 데이터는 어디에서 가져오나요?
            </h3>
            <p className="mt-1 text-sm text-(--color-text-secondary)">
              열린국회정보(open.assembly.go.kr) 공공데이터 API를 기반으로 수집하며, 매일 자동으로
              업데이트됩니다.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-(--color-text-primary)">
              Q. 앱 사용에 비용이 있나요?
            </h3>
            <p className="mt-1 text-sm text-(--color-text-secondary)">
              아니요, 완전 무료입니다. 시민의 알 권리를 위한 공익 프로젝트로 운영됩니다.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-(--color-text-primary)">
              Q. 특정 의원이나 법안 정보가 없어요.
            </h3>
            <p className="mt-1 text-sm text-(--color-text-secondary)">
              데이터는 열린국회정보 API를 통해 제공되므로, API에 등록되지 않은 정보는 표시되지 않을
              수 있습니다. 누락된 정보가 있으면 이메일로 알려주세요.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-(--color-text-primary)">
              Q. 개인정보는 안전한가요?
            </h3>
            <p className="mt-1 text-sm text-(--color-text-secondary)">
              본 앱은 회원가입이 필요 없으며, 사용자의 개인정보를 별도로 수집하지 않습니다. 자세한
              내용은{" "}
              <Link href="/privacy" className="text-(--color-primary) no-underline hover:underline">
                개인정보처리방침
              </Link>
              을 참고해 주세요.
            </p>
          </div>
        </div>
      </section>

      {/* 관련 링크 */}
      <section className="mt-10 border-t border-(--color-border-primary) pt-8">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/about" className="text-(--color-primary) no-underline hover:underline">
            서비스 소개
          </Link>
          <Link href="/privacy" className="text-(--color-primary) no-underline hover:underline">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="text-(--color-primary) no-underline hover:underline">
            이용약관
          </Link>
        </div>
      </section>
    </div>
  );
}
