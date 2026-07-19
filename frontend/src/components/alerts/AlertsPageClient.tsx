"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useWatches, useDeleteWatch } from "@/hooks/useWatches";
import { RADAR_ENABLED } from "@/lib/radar-analytics";
import { BILL_STATUS_MAP } from "@/lib/constants";

export default function AlertsPageClient() {
  const { user, loading } = useAuth();
  const { data: watches, isLoading, isError } = useWatches();
  const deleteWatch = useDeleteWatch();

  if (!RADAR_ENABLED) {
    return <p className="text-sm text-(--color-text-tertiary)">준비 중인 기능입니다.</p>;
  }

  if (loading) return null;

  if (!user) {
    return (
      <p className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-5 text-sm text-(--color-text-secondary)">
        로그인하면 구독한 법안 알림을 관리할 수 있습니다.
      </p>
    );
  }

  const active = watches?.filter((w) => w.enabled) ?? [];

  return (
    <div className="space-y-4">
      {isLoading ? (
        <p className="text-sm text-(--color-text-tertiary)">불러오는 중…</p>
      ) : isError ? (
        <p className="rounded-xl border border-red-300 bg-red-50 p-5 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300">
          알림 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : active.length === 0 ? (
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-5">
          <p className="text-sm text-(--color-text-secondary)">
            아직 구독한 법안 알림이 없습니다. 법안 상세 페이지에서 &ldquo;변경 알림 받기&rdquo;를
            눌러 설정하세요.
          </p>
          <Link
            href="/bills"
            className="mt-2 inline-block text-sm font-semibold text-(--color-primary) no-underline hover:underline"
          >
            법안 목록 보기 →
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {active.map((w) => {
            const statusInfo = w.bill
              ? (BILL_STATUS_MAP[w.bill.status as keyof typeof BILL_STATUS_MAP] ?? null)
              : null;
            return (
              <li
                key={w.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/bills/${w.billId}`}
                    className="line-clamp-1 text-sm font-semibold text-(--color-text-primary) no-underline hover:underline"
                  >
                    {w.bill?.title ?? w.billId}
                  </Link>
                  {statusInfo && (
                    <span className="mt-0.5 inline-block text-xs text-(--color-text-tertiary)">
                      현재 상태: {statusInfo.label}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => deleteWatch.mutate(w.id)}
                  disabled={deleteWatch.isPending}
                  className="shrink-0 rounded-lg border border-(--color-border-primary) px-3 py-1.5 text-xs font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-secondary) disabled:opacity-50"
                >
                  알림 해제
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-(--color-text-tertiary)">
        주 1회, 변경 사항이 있는 경우에만 이메일로 발송됩니다. 언제든 해제할 수 있으며, 자세한
        내용은{" "}
        <Link href="/privacy" className="underline">
          개인정보 처리방침
        </Link>
        을 참고하세요.
      </p>
    </div>
  );
}
