"use client";

import { useState, useCallback, useMemo } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useCongressQuery } from "@/hooks/useCongressQuery";
import { getSchedules } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import { formatDate } from "@/lib/utils";
import type { Schedule } from "@/types";
import { ScheduleListSkeleton } from "@/components/skeletons/ScheduleSkeleton";

interface ScheduleListInnerProps {
  termId: number;
}

const LIMIT = 30;

const typeOptions = [
  { id: null, label: "전체" },
  { id: "plenary", label: "본회의" },
  { id: "committee", label: "위원회" },
];

function ScheduleItem({ schedule }: { schedule: Schedule }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                schedule.type === "plenary"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              }`}
            >
              {schedule.type === "plenary" ? "본회의" : schedule.committeeName || "위원회"}
            </span>
            <span className="text-xs text-(--color-text-tertiary)">
              {formatDate(schedule.meetingDate)}
              {schedule.meetingTime && ` ${schedule.meetingTime}`}
            </span>
            {schedule.session && (
              <span className="text-xs text-(--color-text-tertiary)">{schedule.session}</span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-(--color-text-primary)">
            {schedule.title}
            {schedule.degree && (
              <span className="ml-1 text-xs font-normal text-(--color-text-tertiary)">
                {schedule.degree}
              </span>
            )}
          </h3>
        </div>
        {schedule.agenda && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 rounded-lg p-1 text-(--color-text-tertiary) hover:bg-(--color-bg-secondary)"
            aria-label={expanded ? "안건 접기" : "안건 펼치기"}
          >
            {expanded ? (
              <ChevronUpIcon className="size-4" />
            ) : (
              <ChevronDownIcon className="size-4" />
            )}
          </button>
        )}
      </div>
      {expanded && schedule.agenda && (
        <div className="mt-3 rounded-lg bg-(--color-bg-secondary) p-3 text-xs whitespace-pre-line text-(--color-text-secondary)">
          {schedule.agenda}
        </div>
      )}
      {schedule.linkUrl && (
        <a
          href={schedule.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs text-(--color-primary) no-underline hover:underline"
        >
          상세 보기 →
        </a>
      )}
    </div>
  );
}

export default function ScheduleListInner({ termId }: ScheduleListInnerProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const handleTypeChange = useCallback((v: string | null) => {
    setSelectedType(v);
    setPage(1);
  }, []);

  const queryParams = useMemo(
    () => ({
      termId,
      page,
      limit: LIMIT,
      ...(selectedType ? { type: selectedType } : {}),
    }),
    [termId, page, selectedType],
  );

  const { data, isLoading, isError, error } = useCongressQuery(getSchedules, queryParams);

  const schedules = data?.schedules ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  if (isError) throw error;

  // 날짜별 그룹핑
  const grouped = useMemo(() => {
    const items = data?.schedules ?? [];
    const map = new Map<string, Schedule[]>();
    for (const s of items) {
      const key = s.meetingDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return [...map.entries()];
  }, [data]);

  return (
    <div className="space-y-4">
      {/* 타입 필터 */}
      <div className="flex gap-2">
        {typeOptions.map((opt) => (
          <Button
            key={opt.id ?? "all"}
            variant={selectedType === opt.id ? "chipActive" : "chip"}
            size="sm"
            onClick={() => handleTypeChange(opt.id)}
            className="shrink-0 rounded-full px-4 text-sm font-semibold"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <p className="text-sm text-(--color-text-tertiary)">
        {isLoading ? "\u00A0" : `총 ${total.toLocaleString()}건`}
      </p>

      {isLoading ? (
        <ScheduleListSkeleton />
      ) : schedules.length === 0 ? (
        <div className="py-8 text-center text-(--color-text-tertiary)">일정 데이터가 없습니다.</div>
      ) : (
        <>
          <div className="space-y-6">
            {grouped.map(([date, items]) => (
              <div key={date}>
                <h3 className="mb-2 text-sm font-bold text-(--color-text-secondary)">
                  {formatDate(date)}
                </h3>
                <div className="space-y-3">
                  {items.map((schedule) => (
                    <ScheduleItem key={schedule.id} schedule={schedule} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
