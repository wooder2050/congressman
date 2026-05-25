import type { Metadata } from "next";
import PollAdminInner from "@/components/polls/PollAdminInner";

export const metadata: Metadata = {
  title: "여론조사 race 매칭 관리",
  robots: { index: false, follow: false },
};

export default function PollAdminPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <h1 className="text-xl font-bold">여론조사 race 매칭 관리</h1>
      <p className="text-sm text-(--color-text-secondary)">
        PDF에서 추출된 후보별 지지율 중 race 자동 매칭에 실패한 항목을 수동으로 지정합니다. 지정된
        race로 PollResponse가 일괄 업데이트됩니다.
      </p>
      <PollAdminInner />
    </div>
  );
}
