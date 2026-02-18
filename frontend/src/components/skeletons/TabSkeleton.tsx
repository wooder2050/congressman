/** 출석 탭 — 도넛+출석률 / 4칸 메트릭 / 링크 / 월별 바차트 */
export function AttendanceTabSkeleton() {
  return (
    <div className="animate-pulse space-y-6 py-4">
      {/* 도넛 + 출석률 */}
      <div className="flex items-center gap-6">
        <div className="h-32 w-32 shrink-0 rounded-full bg-(--color-bg-tertiary)" />
        <div className="space-y-2">
          <div className="h-8 w-20 rounded bg-(--color-bg-tertiary)" />
          <div className="h-4 w-12 rounded bg-(--color-bg-tertiary)" />
        </div>
      </div>
      {/* 4칸 메트릭 */}
      <div className="grid grid-cols-2 divide-x divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary) sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1 p-3">
            <div className="mx-auto h-6 w-10 rounded bg-(--color-bg-tertiary)" />
            <div className="mx-auto h-3 w-14 rounded bg-(--color-bg-tertiary)" />
          </div>
        ))}
      </div>
      {/* 출석 상세 보기 링크 */}
      <div className="h-11 w-36 rounded-lg bg-(--color-bg-tertiary)" />
      {/* 월별 출석 추이 */}
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-(--color-bg-tertiary)" />
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
          <div className="flex items-end gap-2">
            {[70, 90, 55, 80, 60, 75].map((h, i) => (
              <div key={i} className="flex-1">
                <div className="rounded-t bg-(--color-bg-tertiary)" style={{ height: `${h}px` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** 법안 탭 — 대표/공동 토글 / 건수+필터 / 월별 법안카드 */
export function BillsTabSkeleton() {
  return (
    <div className="animate-pulse space-y-4 py-4">
      {/* 대표발의/공동발의 토글 */}
      <div className="flex gap-2">
        <div className="h-8 w-20 rounded-full bg-(--color-bg-tertiary)" />
        <div className="h-8 w-20 rounded-full bg-(--color-bg-tertiary)" />
      </div>
      {/* 건수 + 필터 */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-(--color-bg-tertiary)" />
        <div className="h-8 w-8 rounded-full bg-(--color-bg-tertiary)" />
      </div>
      {/* 월별 그룹 */}
      {Array.from({ length: 2 }).map((_, gi) => (
        <div key={gi}>
          <div className="mb-2 h-4 w-32 rounded bg-(--color-bg-tertiary)" />
          <div className="divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary)">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-(--color-bg-primary) p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="h-5 flex-1 rounded bg-(--color-bg-tertiary)" />
                  <div className="h-5 w-14 shrink-0 rounded-full bg-(--color-bg-tertiary)" />
                </div>
                <div className="flex gap-3">
                  <div className="h-3 w-20 rounded bg-(--color-bg-tertiary)" />
                  <div className="h-3 w-16 rounded bg-(--color-bg-tertiary)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** 표결 탭 — 도넛+범례 / 필터 / 건수 / 표결카드 */
export function VotesTabSkeleton() {
  return (
    <div className="animate-pulse space-y-4 py-4">
      {/* 요약 도넛 */}
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
        <div className="flex items-center gap-6">
          <div className="h-35 w-35 shrink-0 rounded-full bg-(--color-bg-tertiary)" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-(--color-bg-tertiary)" />
                <div className="h-4 w-16 rounded bg-(--color-bg-tertiary)" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 결과 필터 */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-14 rounded-full bg-(--color-bg-tertiary)" />
        ))}
      </div>
      {/* 건수 */}
      <div className="h-4 w-16 rounded bg-(--color-bg-tertiary)" />
      {/* 월별 그룹 */}
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, gi) => (
          <div key={gi}>
            <div className="mb-2 h-4 w-32 rounded bg-(--color-bg-tertiary)" />
            <div className="divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary)">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-(--color-bg-primary) p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="h-5 flex-1 rounded bg-(--color-bg-tertiary)" />
                    <div className="flex gap-1">
                      <div className="h-5 w-12 rounded-full bg-(--color-bg-tertiary)" />
                      <div className="h-5 w-12 rounded-full bg-(--color-bg-tertiary)" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-3 w-20 rounded bg-(--color-bg-tertiary)" />
                    <div className="h-3 w-16 rounded bg-(--color-bg-tertiary)" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 위원회 탭 — 직책카드 / 위원회 이력 / 활동카드 */
export function CommitteeTabSkeleton() {
  return (
    <div className="animate-pulse space-y-6 py-4">
      {/* 직책 카드 */}
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-14 rounded-lg bg-(--color-bg-tertiary)" />
          <div className="h-4 flex-1 rounded bg-(--color-bg-tertiary)" />
        </div>
      </div>
      {/* 위원회 이력 */}
      <div>
        <div className="mb-3 h-4 w-20 rounded bg-(--color-bg-tertiary)" />
        <div className="space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
          {Array.from({ length: 2 }).map((_, si) => (
            <div key={si} className="space-y-2">
              <div className="h-3 w-12 rounded bg-(--color-bg-tertiary)" />
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-28 rounded bg-(--color-bg-tertiary)" />
                  <div className="h-3 w-32 rounded bg-(--color-bg-tertiary)" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* 상임위원회 활동 */}
      <div>
        <div className="mb-3 h-4 w-28 rounded bg-(--color-bg-tertiary)" />
        <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 rounded bg-(--color-bg-tertiary)" />
            <div className="h-4 w-16 rounded bg-(--color-bg-tertiary)" />
          </div>
          <div className="h-2.5 w-full rounded-full bg-(--color-bg-tertiary)" />
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-3 w-14 rounded bg-(--color-bg-tertiary)" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** 재산 탭 — 연도별 바차트 / 항목별 비율 / 상세 아코디언 */
export function AssetsTabSkeleton() {
  return (
    <div className="animate-pulse space-y-6 py-4">
      {/* 연도별 총 재산 */}
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-(--color-bg-tertiary)" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-10 rounded bg-(--color-bg-tertiary)" />
              <div className="h-7 flex-1 rounded-md bg-(--color-bg-tertiary)" />
              <div className="h-4 w-16 rounded bg-(--color-bg-tertiary)" />
            </div>
          ))}
        </div>
      </div>
      {/* 항목별 비율 */}
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-(--color-bg-tertiary)" />
        <div className="h-6 w-full rounded-full bg-(--color-bg-tertiary)" />
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-(--color-bg-tertiary)" />
              <div className="h-3 w-20 rounded bg-(--color-bg-tertiary)" />
            </div>
          ))}
        </div>
      </div>
      {/* 상세 내역 아코디언 */}
      <div className="space-y-3">
        <div className="h-4 w-20 rounded bg-(--color-bg-tertiary)" />
        <div className="divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary)">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-(--color-bg-primary) px-4 py-3"
            >
              <div className="h-5 w-16 rounded bg-(--color-bg-tertiary)" />
              <div className="h-4 w-20 rounded bg-(--color-bg-tertiary)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 기존 default export 유지 (다른 곳에서 import할 수도 있으므로) */
export default function TabContentSkeleton() {
  return <AttendanceTabSkeleton />;
}
