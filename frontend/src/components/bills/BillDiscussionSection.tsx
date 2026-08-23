import type { BillDiscussionData } from "@/types";

/**
 * 법안 상세 페이지의 "위원회 논의" 섹션 (서버 컴포넌트).
 *
 * 국회 회의록 원문에서 편집자가 검수해 선별한 발언 인용과 해설을 보여준다.
 * 인용은 회의록 원문 그대로이며(저작권법 제37조에 따른 출처·발언자 표시),
 * 해설(쟁점·의미·다음 절차)은 편집자가 작성하고 검토일을 함께 표기한다.
 * 데이터가 없는 법안은 상위에서 렌더링하지 않는다.
 */
export default function BillDiscussionSection({ discussion }: { discussion: BillDiscussionData }) {
  const { quotes, note } = discussion;
  if (quotes.length === 0) return null;

  return (
    <section className="space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <div>
        <h2 className="text-lg font-bold">위원회 논의 — 회의록에서</h2>
        <p className="mt-1 text-sm text-(--color-text-tertiary)">
          국회 회의록 원문에서 이 법안 심사의 핵심 발언을 선별했습니다. 인용은 회의록 표현
          그대로입니다.
        </p>
      </div>

      {note && (
        <div className="space-y-3 rounded-lg bg-(--color-bg-secondary) p-4 text-sm leading-relaxed">
          <div>
            <h3 className="mb-1 font-semibold">무엇이 다퉈졌나</h3>
            <p className="text-(--color-text-secondary)">{note.issue}</p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold">왜 중요한가</h3>
            <p className="text-(--color-text-secondary)">{note.why}</p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold">경과</h3>
            <p className="text-(--color-text-secondary)">{note.next}</p>
          </div>
        </div>
      )}

      <ul className="space-y-4">
        {quotes.map((q, i) => (
          <li
            key={i}
            className="border-l-2 border-(--color-border-primary) pl-4 text-sm leading-relaxed"
          >
            <blockquote className="text-(--color-text-secondary)">
              &ldquo;{q.quote}&rdquo;
            </blockquote>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-(--color-text-tertiary)">
              <span className="font-medium text-(--color-text-primary)">
                {q.speaker} {q.speakerPos}
              </span>
              <span>·</span>
              <span>
                {q.meetingTitle} ({q.confDate})
              </span>
              <span>·</span>
              <a
                href={q.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-(--color-text-primary)"
              >
                회의록 원문
              </a>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs text-(--color-text-tertiary)">
        출처: 국회사무처 회의록 (열람: 국회회의록시스템)
        {note ? ` · 편집자 검토일 ${note.reviewedAt}` : ""} · 인용은 발언 원문이며 발언의 일부일 수
        있습니다.
      </p>
    </section>
  );
}
