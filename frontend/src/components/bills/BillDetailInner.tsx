"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getBill } from "@/lib/api";
import ColorBadge from "@/components/ui/color-badge";
import TermHint from "@/components/ui/term-hint";
import MemberAvatar from "@/components/members/MemberAvatar";
import { formatDate, formatDistrict } from "@/lib/utils";
import { BILL_STATUS_MAP } from "@/lib/constants";
import BillProgressTimeline from "@/components/bills/BillProgressTimeline";
import type { BillStructuredSummary } from "@/types";

interface BillDetailInnerProps {
  id: string;
}

export default function BillDetailInner({ id }: BillDetailInnerProps) {
  const { data: bill } = useCongressSuspenseQuery(getBill, id);

  if (!bill) return notFound();

  const statusInfo = BILL_STATUS_MAP[bill.status];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href={`/bills?term=${bill.termId}`}
        className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
      >
        ← 법안 목록
      </Link>

      <div className="space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-(--color-text-primary) sm:text-2xl">
            {bill.title}
          </h1>
          <ColorBadge
            label={statusInfo.label}
            color={statusInfo.color}
            textColor={statusInfo.textColor}
            termHint={statusInfo.termKey}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--color-text-tertiary)">
          <span className="font-semibold text-(--color-text-secondary)">
            {bill.proposerName}
            {bill.coProposerCount > 0 && ` 외 ${bill.coProposerCount}인`}
          </span>
          <span>{formatDate(bill.proposedDate)}</span>
          {bill.committee && <span>{bill.committee}</span>}
          {bill.topic && (
            <span className="rounded-full bg-(--color-bg-tertiary) px-2.5 py-0.5 text-xs font-medium text-(--color-text-secondary)">
              {bill.topic}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {bill.hasVote && (
            <Link
              href={`/votes/${bill.id}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary) no-underline hover:underline"
            >
              표결 결과 보기 →
            </Link>
          )}
          {bill.pdfUrl && (
            <a
              href={bill.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary) no-underline hover:underline"
            >
              의안원문 PDF ↗
            </a>
          )}
          {bill.detailLink && (
            <a
              href={bill.detailLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:underline"
            >
              의안정보시스템 ↗
            </a>
          )}
        </div>
      </div>

      {/* 법안 현황 해설 */}
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <h2 className="mb-3 text-base font-bold text-(--color-text-primary)">법안 현황 해설</h2>
        <p className="text-sm leading-relaxed text-(--color-text-secondary)">
          {bill.title}은(는) {formatDate(bill.proposedDate)}에{" "}
          {bill.proposerName?.includes("위원장")
            ? "위원회 대안으로 제안"
            : bill.proposerName === "정부"
              ? "정부가 제출"
              : `${bill.proposerName} 의원${bill.coProposerCount > 0 ? ` 외 ${bill.coProposerCount}명` : ""}이 대표발의`}
          한 법안입니다.
          {bill.committee && <> 현재 {bill.committee}에서 소관하고 있습니다.</>}
          {bill.status === "passed" && (
            <>
              {" "}
              본 법안은 본회의를 통과하여 <strong>가결</strong>되었습니다. 가결된 법안은 정부로
              이송되어 대통령이 15일 이내에 공포하며, 특별한 규정이 없으면 공포 후 20일 뒤
              시행됩니다.
            </>
          )}
          {bill.status === "pending" && (
            <>
              {" "}
              본 법안은 현재 <strong>계류</strong> 상태로, 위원회 심사 또는 본회의 상정을 기다리고
              있습니다. 국회의원 임기(4년) 내에 처리되지 않으면 자동으로 폐기됩니다.
            </>
          )}
          {bill.status === "committee" && (
            <>
              {" "}
              본 법안은 현재 <strong>위원회 심사</strong> 단계에 있습니다. 전문위원 검토 보고 →
              대체토론 → 축조심사 → 찬반투표 순서로 진행되며, 통과 시 본회의에 상정됩니다.
            </>
          )}
          {bill.status === "discarded" && (
            <>
              {" "}
              본 법안은 <strong>폐기</strong>되었습니다.
              {bill.progress?.committeeResult?.includes("대안반영")
                ? " 법안의 핵심 내용이 위원회 대안에 반영되어, 원래 법안은 형식적으로 폐기 처리된 것입니다."
                : " 임기 만료, 발의자 철회, 또는 위원회 부결 등의 사유로 더 이상 심사되지 않습니다."}
            </>
          )}
        </p>
        <p className="mt-2 text-xs text-(--color-text-tertiary)">
          위 해설은 열린국회정보 공공데이터를 기반으로 자동 생성되었습니다.
        </p>
      </div>

      {bill.progress && (
        <BillProgressTimeline
          progress={bill.progress}
          proposedDate={bill.proposedDate}
          status={bill.status}
        />
      )}

      {bill.simpleSummary && (
        <div className="space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            AI 요약
            <span className="rounded-full bg-(--color-bg-tertiary) px-2 py-0.5 text-xs font-normal text-(--color-text-tertiary)">
              Beta
            </span>
          </h2>
          <p className="text-base leading-relaxed font-medium text-(--color-text-primary)">
            {bill.simpleSummary}
          </p>
          {bill.structuredSummary &&
            (() => {
              const s = bill.structuredSummary as BillStructuredSummary;
              const items = [
                { label: "현재 상황", emoji: "📋", value: s.situation },
                { label: "문제점", emoji: "⚠️", value: s.problem },
                { label: "개정 내용", emoji: "📝", value: s.change },
                { label: "기대 효과", emoji: "✅", value: s.impact },
              ];
              return (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {items.map((item) => (
                    <div key={item.label} className="rounded-lg bg-(--color-bg-secondary) p-3.5">
                      <dt className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-(--color-text-tertiary)">
                        <span>{item.emoji}</span>
                        {item.label}
                      </dt>
                      <dd className="text-sm leading-relaxed text-(--color-text-secondary)">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </div>
              );
            })()}
        </div>
      )}

      {bill.summary && (
        <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <h2 className="text-lg font-bold">제안이유 및 주요내용</h2>
          <div className="text-sm leading-relaxed whitespace-pre-line text-(--color-text-secondary)">
            {bill.summary}
          </div>
        </div>
      )}

      {bill.proposers.length > 0 ? (
        (() => {
          const reps = bill.proposers.filter((p) => p.role === "representative");
          const coProps = bill.proposers.filter((p) => p.role !== "representative");

          const renderProposerCard = (proposer: (typeof bill.proposers)[0]) => (
            <Link
              key={proposer.memberId}
              href={`/members/${proposer.memberId}?term=${bill.termId}`}
              className="flex items-center gap-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-3 no-underline transition-colors hover:bg-(--color-bg-hover)"
            >
              <MemberAvatar
                name={proposer.memberName}
                photoUrl={proposer.photoUrl}
                size={40}
                bgColor={proposer.partyColor}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-(--color-text-primary)">
                    {proposer.memberName}
                  </span>
                  <span className="text-xs text-(--color-text-tertiary)">{proposer.partyName}</span>
                </div>
                <p className="truncate text-xs text-(--color-text-tertiary)">
                  {formatDistrict(proposer.district)}
                </p>
              </div>
            </Link>
          );

          return (
            <div className="space-y-4">
              {reps.length > 0 && (
                <>
                  <h2 className="flex items-center gap-1 text-lg font-bold">
                    대표발의 ({reps.length}명)
                    <TermHint termKey="chief_proposer" />
                  </h2>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {reps.map(renderProposerCard)}
                  </div>
                </>
              )}
              {coProps.length > 0 && (
                <>
                  <h2 className="flex items-center gap-1 text-lg font-bold">
                    공동발의 ({coProps.length}명)
                    <TermHint termKey="co_proposer" />
                  </h2>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {coProps.map(renderProposerCard)}
                  </div>
                </>
              )}
            </div>
          );
        })()
      ) : (
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <h2 className="flex items-center gap-1 text-lg font-bold">
            발의자 정보
            {bill.proposerName?.includes("위원장") && <TermHint termKey="committee_alternative" />}
          </h2>
          <p className="mt-2 text-sm text-(--color-text-tertiary)">
            {bill.proposerName?.includes("위원장")
              ? "위원회 대안으로 발의된 법안으로, 개별 발의자 정보가 없습니다."
              : bill.proposerName === "정부"
                ? "정부 제출 법안으로, 개별 발의자 정보가 없습니다."
                : "이 법안의 개별 발의자 정보가 제공되지 않습니다."}
          </p>
        </div>
      )}
    </div>
  );
}
