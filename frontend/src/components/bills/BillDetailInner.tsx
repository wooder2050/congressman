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

      {bill.topic && (
        <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800/40 dark:bg-amber-950/20">
          <h2 className="flex items-center gap-2 text-lg font-bold text-amber-900 dark:text-amber-200">
            <span>💡</span>이 법안이 왜 중요한가요?
          </h2>
          <div className="space-y-2 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
            <p>
              이 법안은 <strong>{bill.topic}</strong> 분야에 해당하는 법안으로,
              {bill.topic === "보건·의료" &&
                " 국민의 건강권과 의료 접근성에 직접적인 영향을 미칩니다. 건강보험 보장 범위, 의료인력 확충, 공공의료 인프라 등 의료 정책의 방향을 결정짓는 중요한 입법 활동입니다."}
              {bill.topic === "부동산·주거" &&
                " 국민의 주거 안정과 부동산 시장에 영향을 줍니다. 주택 공급, 임대차 보호, 부동산 세제 등 주거 정책은 국민 생활과 밀접하게 연결되어 있습니다."}
              {bill.topic === "경제·산업" &&
                " 국가 경제 성장과 산업 경쟁력에 영향을 미칩니다. 기업 활동, 공정거래, 소비자 보호 등 경제 전반의 규칙을 정하는 중요한 법안입니다."}
              {bill.topic === "노동·고용" &&
                " 근로자의 권리와 고용 환경에 직접적인 영향을 줍니다. 근로조건, 산업안전, 고용보험 등 노동 정책은 수천만 근로자의 삶의 질을 좌우합니다."}
              {bill.topic === "육아·교육" &&
                " 미래 세대의 교육 환경과 보육 정책에 영향을 미칩니다. 교육 과정, 보육 지원, 학생 인권 등 교육 정책은 사회의 미래를 결정짓습니다."}
              {bill.topic === "환경·에너지" &&
                " 기후변화 대응과 지속가능한 발전에 영향을 미칩니다. 탄소중립, 재생에너지, 환경오염 규제 등은 현세대와 미래 세대 모두에게 중요합니다."}
              {bill.topic === "법·사법" &&
                " 법치주의의 근간을 이루는 사법 체계에 영향을 줍니다. 형사·민사 절차, 인권 보호, 사법 접근성 등 국민의 기본권과 직결됩니다."}
              {bill.topic === "교통·물류" &&
                " 국민의 이동권과 물류 인프라에 영향을 미칩니다. 교통안전, 대중교통, 물류 효율화 등 일상생활과 밀접한 분야입니다."}
              {bill.topic === "복지·돌봄" &&
                " 사회적 약자 보호와 복지 체계에 영향을 줍니다. 기초생활보장, 장애인 지원, 노인 돌봄 등 사회 안전망을 강화하는 입법 활동입니다."}
              {bill.topic === "행정·지방자치" &&
                " 정부 운영과 지방자치 제도에 영향을 미칩니다. 행정 효율화, 지방분권, 공무원 제도 등 국가 행정의 기본 틀을 정합니다."}
              {bill.topic === "농업·식품" &&
                " 농업인의 권익과 식품 안전에 영향을 줍니다. 농업 경쟁력 강화, 식품 위생, 농촌 지역 발전 등 1차 산업의 미래를 결정짓습니다."}
              {bill.topic === "문화·체육" &&
                " 국민의 문화생활과 체육 활동에 영향을 미칩니다. 문화 진흥, 예술인 지원, 체육 시설 확충 등 삶의 질을 높이는 정책입니다."}
              {bill.topic === "과학기술·ICT" &&
                " 기술 혁신과 디지털 경제에 영향을 미칩니다. AI·반도체·우주산업 등 첨단 기술 육성과 개인정보 보호 등 디지털 사회의 규범을 정합니다."}
              {bill.topic === "외교·안보" &&
                " 국가 안보와 국제 관계에 영향을 미칩니다. 국방력 강화, 동맹 관계, 통상 정책 등 대한민국의 국제적 위상과 안전에 직결됩니다."}
              {bill.topic === "안전·치안" &&
                " 국민의 안전과 치안 유지에 영향을 줍니다. 재난 대응, 범죄 예방, 소방·경찰 인력 등 안전한 사회를 만드는 기반이 됩니다."}
            </p>
            <p>
              시민으로서 이 법안의 진행 상황을 관심 있게 지켜보고, 국회의원의 입법 활동을 평가하는
              데 참고하시기 바랍니다. 법안의 원문과 심사 경과를 확인하여 보다 깊이 있는 이해를 할 수
              있습니다.
            </p>
          </div>
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
