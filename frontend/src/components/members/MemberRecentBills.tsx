"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getBills } from "@/lib/api";

interface MemberRecentBillsProps {
  memberId: string;
  memberName: string;
  termId: number;
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  passed: { label: "본회의 통과", className: "bg-green-100 text-green-700" },
  committee: { label: "위원회 심사", className: "bg-blue-100 text-blue-700" },
  pending: { label: "계류 중", className: "bg-amber-100 text-amber-700" },
  discarded: { label: "폐기", className: "bg-gray-100 text-gray-600" },
};

/**
 * 의원 상세 페이지의 "최근 대표발의 법안 Top 3" 섹션.
 *
 * 자동 생성된 데이터 위주의 의원 페이지에 자연어 단락 + 법안별 AI 요약(simpleSummary)
 * 발췌를 노출해 페이지 콘텐츠 깊이를 보강한다. AdSense "가치 있는 콘텐츠" 기준 대응.
 */
export default function MemberRecentBills({
  memberId,
  memberName,
  termId,
}: MemberRecentBillsProps) {
  const { data: billsData } = useCongressSuspenseQuery(getBills, {
    memberId,
    termId,
    role: "representative",
    limit: 3,
  });

  const bills = billsData.bills;
  if (bills.length === 0) return null;

  const topicSet = new Set(bills.map((b) => b.topic).filter(Boolean) as string[]);
  const topicSummary =
    topicSet.size > 0 ? `주로 ${[...topicSet].slice(0, 3).join(" · ")} 분야` : "다양한 분야";

  return (
    <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-base font-bold text-(--color-text-primary)">최근 대표발의 법안</h2>
        <span className="text-xs text-(--color-text-tertiary)">
          총 {billsData.total}건 중 최신 3건
        </span>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-(--color-text-secondary)">
        {memberName} 의원이 제{termId}대 국회에서 대표발의한 법안 가운데 가장 최근 3건입니다.
        {billsData.total >= 3
          ? ` 전체 ${billsData.total}건의 대표발의 법안 중 ${topicSummary}의 입법 활동을 펼쳐왔습니다.`
          : ""}
        각 법안의 AI 요약을 통해 발의 배경과 주요 변경 사항을 한눈에 확인할 수 있습니다.
      </p>
      <ul className="space-y-3">
        {bills.map((b) => {
          const status = STATUS_LABEL[b.status] ?? STATUS_LABEL.committee;
          return (
            <li
              key={b.id}
              className="rounded-lg border border-(--color-border-primary) bg-(--color-bg-secondary) p-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link
                  href={`/bills/${b.id}`}
                  className="text-sm font-semibold text-(--color-text-primary) no-underline hover:underline"
                >
                  {b.title}
                </Link>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${status.className}`}
                >
                  {status.label}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-(--color-text-tertiary)">
                <span>발의 {b.proposedDate}</span>
                {b.committee && <span>{b.committee}</span>}
                {b.topic && (
                  <span className="rounded bg-(--color-bg-tertiary) px-1.5 py-0.5">{b.topic}</span>
                )}
                {b.coProposerCount > 0 && <span>공동발의 {b.coProposerCount}명</span>}
              </div>
              {b.simpleSummary && (
                <p className="mt-2 text-xs leading-relaxed text-(--color-text-secondary)">
                  {b.simpleSummary}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-3 text-right">
        <Link
          href={`/bills?memberId=${memberId}&role=representative&termId=${termId}`}
          className="text-xs font-medium text-(--color-primary) no-underline hover:underline"
        >
          전체 대표발의 법안 보기 →
        </Link>
      </div>
    </section>
  );
}
