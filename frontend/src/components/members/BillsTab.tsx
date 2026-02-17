"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SlidersHorizontalIcon, XIcon } from "lucide-react";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getBills } from "@/lib/api";
import ColorBadge from "@/components/ui/color-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { BILL_STATUS_MAP } from "@/lib/constants";
import type { Bill } from "@/types";

interface BillsTabProps {
  memberId: string;
  termId: number;
}

function getYearMonth(dateStr: string) {
  return dateStr.slice(0, 7); // "2024-03"
}

function formatYearMonth(ym: string) {
  const [year, month] = ym.split("-");
  return `${year}년 ${Number(month)}월`;
}

const roleOptions = [
  { id: "representative" as const, label: "대표발의" },
  { id: "co" as const, label: "공동발의" },
];

export default function BillsTab({ memberId, termId }: BillsTabProps) {
  const [selectedRole, setSelectedRole] = useState<"representative" | "co">("representative");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedCommittee, setSelectedCommittee] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: billsResult } = useCongressSuspenseQuery(getBills, {
    memberId,
    termId,
    role: selectedRole,
    limit: 100,
  });
  const bills = billsResult.bills;
  const total = billsResult.total;

  const committees = useMemo(() => {
    const set = new Set<string>();
    for (const bill of bills) {
      if (bill.committee && !bill.committee.includes("특별위원회")) {
        set.add(bill.committee);
      }
    }
    return [...set].sort();
  }, [bills]);

  const months = useMemo(() => {
    const map = new Map<string, number>();
    for (const bill of bills) {
      const ym = getYearMonth(bill.proposedDate);
      map.set(ym, (map.get(ym) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([ym, count]) => ({ ym, count }));
  }, [bills]);

  const filtered = useMemo(() => {
    let result = bills;
    if (selectedCommittee) result = result.filter((b) => b.committee === selectedCommittee);
    if (selectedMonth)
      result = result.filter((b) => getYearMonth(b.proposedDate) === selectedMonth);
    return result;
  }, [bills, selectedMonth, selectedCommittee]);

  const grouped = useMemo(() => {
    const map = new Map<string, Bill[]>();
    for (const bill of filtered) {
      const ym = getYearMonth(bill.proposedDate);
      const list = map.get(ym) ?? [];
      list.push(bill);
      map.set(ym, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  if (bills.length === 0) {
    return (
      <div className="space-y-4 py-4" role="tabpanel">
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {roleOptions.map((opt) => (
            <Button
              key={opt.id}
              variant={selectedRole === opt.id ? "chipActive" : "chip"}
              size="sm"
              onClick={() => {
                setSelectedRole(opt.id);
                setSelectedMonth(null);
                setSelectedCommittee(null);
              }}
              className="shrink-0 rounded-full px-4 text-sm font-semibold"
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <div className="py-8 text-center text-(--color-text-tertiary)">
          {selectedRole === "representative" ? "대표발의" : "공동발의"} 법안이 없습니다.
        </div>
      </div>
    );
  }

  const activeFilterCount = (selectedCommittee ? 1 : 0) + (selectedMonth ? 1 : 0);

  return (
    <div className="space-y-4 py-4" role="tabpanel">
      {/* 대표발의 / 공동발의 토글 */}
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {roleOptions.map((opt) => (
          <Button
            key={opt.id}
            variant={selectedRole === opt.id ? "chipActive" : "chip"}
            size="sm"
            onClick={() => {
              setSelectedRole(opt.id);
              setSelectedMonth(null);
              setSelectedCommittee(null);
            }}
            className="shrink-0 rounded-full px-4 text-sm font-semibold"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* 건수 + 필터 토글 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-(--color-text-tertiary)">
          {selectedRole === "representative" ? "대표발의" : "공동발의"} {total}건
        </p>
        <Button
          variant={showFilters ? "chipActive" : "chip"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="relative shrink-0 rounded-full px-3"
          aria-label="필터"
        >
          <SlidersHorizontalIcon className="size-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* 접이식 필터 */}
      {showFilters && (
        <div className="space-y-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-(--color-text-primary)">필터</span>
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setSelectedCommittee(null);
                  setSelectedMonth(null);
                }}
                className="flex items-center gap-1 text-xs text-(--color-text-tertiary) hover:text-(--color-text-primary)"
              >
                <XIcon className="size-3" />
                초기화
              </button>
            )}
          </div>

          {committees.length > 1 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-(--color-text-tertiary)">위원회</p>
              <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
                <Button
                  variant={selectedCommittee === null ? "chipActive" : "chip"}
                  size="xs"
                  onClick={() => setSelectedCommittee(null)}
                  className="shrink-0 rounded-full px-3 text-xs font-semibold"
                >
                  전체
                </Button>
                {committees.map((c) => (
                  <Button
                    key={c}
                    variant={selectedCommittee === c ? "chipActive" : "chip"}
                    size="xs"
                    onClick={() => setSelectedCommittee(c)}
                    className="shrink-0 rounded-full px-3 text-xs font-semibold"
                  >
                    {c.replace("위원회", "")}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-xs font-medium text-(--color-text-tertiary)">기간</p>
            <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
              <Button
                variant={selectedMonth === null ? "chipActive" : "chip"}
                size="xs"
                onClick={() => setSelectedMonth(null)}
                className="shrink-0 rounded-full px-3 text-xs font-semibold"
              >
                전체
              </Button>
              {months.map((m) => (
                <Button
                  key={m.ym}
                  variant={selectedMonth === m.ym ? "chipActive" : "chip"}
                  size="xs"
                  onClick={() => setSelectedMonth(m.ym)}
                  className="shrink-0 rounded-full px-3 text-xs font-semibold"
                >
                  {formatYearMonth(m.ym)} ({m.count})
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 월별 그룹 */}
      {grouped.map(([ym, groupBills]) => (
        <div key={ym}>
          {!selectedMonth && (
            <h4 className="mb-2 text-sm font-semibold text-(--color-text-secondary)">
              {formatYearMonth(ym)} ({groupBills.length}건)
            </h4>
          )}
          <div className="divide-y divide-(--color-border-primary) overflow-hidden rounded-xl border border-(--color-border-primary)">
            {groupBills.map((bill) => {
              const statusInfo = BILL_STATUS_MAP[bill.status];
              return (
                <Link
                  key={bill.id}
                  href={`/bills/${bill.id}`}
                  className="block bg-(--color-bg-primary) p-4 no-underline transition-colors hover:bg-(--color-bg-hover)"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h4 className="line-clamp-2 text-base font-semibold">{bill.title}</h4>
                    <ColorBadge
                      label={statusInfo.label}
                      color={statusInfo.color}
                      textColor={statusInfo.textColor}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-(--color-text-tertiary)">
                    <span>{formatDate(bill.proposedDate)}</span>
                    {bill.committee && <span>{bill.committee}</span>}
                    <span>외 {bill.coProposerCount}인</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
