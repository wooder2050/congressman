import type { Metadata } from "next";
import AlertsPageClient from "@/components/alerts/AlertsPageClient";

export const revalidate = 0;

// 폼·기능 중심 페이지라 검색 색인 제외(AdSense thin-content 영향 방지). follow는 유지.
export const metadata: Metadata = {
  title: "법안 변경 알림 — lawmake",
  description: "구독한 법안의 처리 상태가 바뀌면 주간 이메일로 알려드립니다.",
  robots: { index: false, follow: true },
};

export default function AlertsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">법안 변경 알림</h1>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          구독한 법안의 처리 상태가 바뀌면 주 1회, 변경 사항이 있을 때만 이메일로 보내드립니다.
        </p>
      </div>
      <AlertsPageClient />
    </div>
  );
}
