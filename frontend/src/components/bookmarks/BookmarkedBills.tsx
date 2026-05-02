"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { getBillsBatch } from "@/lib/api";
import { BILL_STATUS_MAP } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import ColorBadge from "@/components/ui/color-badge";
import BookmarkButton from "@/components/ui/BookmarkButton";
import LoginModal from "@/components/auth/LoginModal";

export default function BookmarkedBills() {
  const { user, loading: authLoading } = useAuth();
  const { data: prefs, isLoading: prefsLoading } = useUserPreferences();
  const [loginOpen, setLoginOpen] = useState(false);

  const billIds = prefs?.bookmarkedBills ?? [];

  const {
    data: bills,
    isLoading: billsLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["billsBatch", ...billIds],
    queryFn: () => getBillsBatch(billIds),
    enabled: billIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  if (authLoading || prefsLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary)"
          />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-8 text-center">
        <p className="text-sm text-(--color-text-secondary)">
          로그인하면 법안을 저장할 수 있습니다.
        </p>
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className="mt-3 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white"
        >
          로그인하기
        </button>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    );
  }

  if (billIds.length === 0) {
    return (
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-8 text-center">
        <p className="text-sm text-(--color-text-tertiary)">
          저장한 법안이 없습니다. 법안 목록에서 관심 있는 법안을 저장해보세요.
        </p>
        <Link
          href="/bills"
          className="mt-3 inline-block text-sm font-semibold text-(--color-primary) no-underline"
        >
          법안 목록 보기 →
        </Link>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center dark:border-red-800/40 dark:bg-red-950/20">
        <p className="text-sm font-semibold text-red-800 dark:text-red-200">
          데이터를 불러오지 못했습니다
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 text-sm font-medium text-(--color-primary) hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (billsLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: billIds.length }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary)"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-(--color-text-tertiary)">{billIds.length}건 저장됨</p>
      {bills?.map((bill) => {
        const statusInfo =
          BILL_STATUS_MAP[bill.status as keyof typeof BILL_STATUS_MAP] ?? BILL_STATUS_MAP.pending;
        return (
          <div
            key={bill.id}
            className="flex items-start gap-2 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 transition-colors hover:bg-(--color-bg-hover)"
          >
            <Link href={`/bills/${bill.id}`} className="min-w-0 flex-1 no-underline">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-base font-semibold text-(--color-text-primary)">
                  {bill.title}
                </h3>
                <ColorBadge
                  label={statusInfo.label}
                  color={statusInfo.color}
                  textColor={statusInfo.textColor}
                  size="sm"
                  termHint={statusInfo.termKey}
                />
              </div>
              {bill.simpleSummary && (
                <p className="mt-1 line-clamp-1 text-sm text-(--color-text-secondary)">
                  {bill.simpleSummary}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--color-text-tertiary)">
                <span className="font-semibold text-(--color-text-secondary)">
                  {bill.proposerName} 외 {bill.coProposerCount}인
                </span>
                <span>{formatDate(bill.proposedDate)}</span>
                {bill.committee && <span>{bill.committee}</span>}
              </div>
            </Link>
            <BookmarkButton billId={bill.id} />
          </div>
        );
      })}
    </div>
  );
}
