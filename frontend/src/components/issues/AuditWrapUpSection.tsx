import Link from "next/link";
import AuditSources from "@/components/issues/AuditSources";
import type { AuditFollowUpStatus, AuditWrapUp } from "@/data/audit-2026";
import { formatAuditMd } from "@/lib/audit-format";

const STATUS_STYLE: Record<AuditFollowUpStatus, string> = {
  "조치 확인": "bg-(--color-text-primary) text-(--color-text-inverse)",
  "자료 제출 약속": "border border-(--color-text-primary) text-(--color-text-primary)",
  "검토 약속": "border border-(--color-text-primary) text-(--color-text-primary)",
  "답변만 확인": "border border-(--color-border-primary) text-(--color-text-secondary)",
  "답변 미확인":
    "border border-dashed border-(--color-border-primary) text-(--color-text-tertiary)",
};

interface Props {
  wrapUp: AuditWrapUp;
  committeeShort: string;
}

/**
 * 감사가 끝난 위원회의 "주요 질의·답변과 후속 확인". 질의(누가 무엇을) → 답변 → 현재 확인 상태 →
 * 다음 확인 순서로 고정한다. 약속은 이행으로 표시하지 않는다.
 */
export default function AuditWrapUpSection({ wrapUp, committeeShort }: Props) {
  return (
    <section id="wrapup" aria-labelledby="wrapup-title" className="scroll-mt-32 space-y-4">
      <div className="space-y-1">
        <h2 id="wrapup-title" className="text-2xl font-bold">
          {committeeShort} 국감 결산 — 주요 질의·답변과 후속 확인
        </h2>
        <p className="text-sm text-(--color-text-secondary)">
          {formatAuditMd(wrapUp.closedOn.slice(5))} 감사를 마쳤습니다. 국회 국정감사 결과보고서가
          나오기 전 lawmake가 보도·공개 자료로 정리한 요약이며, 원문 대조일은{" "}
          {formatAuditMd(wrapUp.checkedAt.slice(5))}입니다. 약속은 이행으로 표시하지 않습니다.
        </p>
      </div>
      <ol className="space-y-3">
        {wrapUp.items.map((item) => (
          <li
            key={item.title}
            className="space-y-2 rounded-xl border border-(--color-border-primary) p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold">{item.title}</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[item.status]}`}
              >
                {item.status}
              </span>
            </div>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-semibold text-(--color-text-primary)">질의·주장</dt>
                <dd className="leading-relaxed text-(--color-text-secondary)">{item.question}</dd>
              </div>
              <div>
                <dt className="font-semibold text-(--color-text-primary)">답변</dt>
                <dd className="leading-relaxed text-(--color-text-secondary)">
                  {item.answer ?? "확인한 자료에서 답변을 찾지 못했습니다."}
                </dd>
              </div>
              {(item.next || item.nextLink) && (
                <div>
                  <dt className="font-semibold text-(--color-text-primary)">다음 확인</dt>
                  <dd className="leading-relaxed text-(--color-text-secondary)">
                    {item.next}
                    {item.nextLink && (
                      <>
                        {item.next ? " " : ""}
                        <Link
                          href={item.nextLink.href}
                          className="font-semibold text-(--color-primary) underline underline-offset-2"
                        >
                          {item.nextLink.label}
                        </Link>
                      </>
                    )}
                  </dd>
                </div>
              )}
            </dl>
            <AuditSources sources={item.sources} />
          </li>
        ))}
      </ol>
    </section>
  );
}
