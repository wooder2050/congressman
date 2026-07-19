"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import LoginModal from "@/components/auth/LoginModal";
import { useWatches, useCreateWatch } from "@/hooks/useWatches";
import {
  RADAR_ENABLED,
  trackCtaView,
  trackCtaClick,
  trackLoginStarted,
  trackLoginCompleted,
} from "@/lib/radar-analytics";

/** 이 CTA에서 로그인 흐름을 시작했음을 표시하는 sessionStorage 키(법안별). */
const loginFlowKey = (billId: string) => `radar_login_flow:${billId}`;

/**
 * 법안 상세 "변경 알림 받기" CTA.
 *
 * Phase 2: 로그인 사용자가 클릭하면 실제 Watch를 생성(멱등)하고 성공 상태를 표시한다.
 * 비로그인 사용자는 로그인 모달 → 복귀 후 다시 확인해 생성. 퍼널 이벤트도 측정한다.
 * feature flag `NEXT_PUBLIC_RADAR_ENABLED`가 켜졌을 때만 렌더링되며, 꺼지면 아무것도
 * 그리지 않아 이벤트도 발생하지 않는다.
 */
export default function BillWatchCTA({ billId }: { billId: string }) {
  const { user, loading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const { data: watches } = useWatches();
  const createWatch = useCreateWatch();
  // 노출 이벤트를 billId당 1회만 발화(같은 컴포넌트가 다른 법안으로 재사용돼도 재발화).
  const viewedBillRef = useRef<string | null>(null);

  // 이 법안에 대한 활성 알림이 이미 있는지
  const activeWatch = watches?.find((w) => w.billId === billId && w.enabled);

  // 인증 로딩이 끝난 뒤, 현재 billId에 대해 노출 이벤트를 1회 발화.
  useEffect(() => {
    if (!RADAR_ENABLED || loading || viewedBillRef.current === billId) return;
    viewedBillRef.current = billId;
    trackCtaView({ billId, path: window.location.pathname, loggedIn: !!user });
  }, [billId, user, loading]);

  // 로그인 흐름을 시작했던 사용자가 로그인 완료 후 이 법안으로 복귀하면 login_completed 발화.
  useEffect(() => {
    if (!RADAR_ENABLED || loading || !user) return;
    try {
      if (sessionStorage.getItem(loginFlowKey(billId)) === "1") {
        sessionStorage.removeItem(loginFlowKey(billId));
        trackLoginCompleted(billId);
      }
    } catch {
      // sessionStorage 접근 불가(프라이버시 모드 등) 시 무시
    }
  }, [billId, user, loading]);

  if (!RADAR_ENABLED) return null;

  const handleClick = () => {
    if (loading) return; // 인증 판정 전 클릭은 무시(로그인 사용자를 비로그인으로 오기록 방지)
    const path = window.location.pathname;
    trackCtaClick({ billId, path, loggedIn: !!user });
    if (!user) {
      trackLoginStarted(billId, path);
      try {
        sessionStorage.setItem(loginFlowKey(billId), "1"); // 복귀 시 login_completed 판정용
      } catch {
        // 무시
      }
      setLoginOpen(true);
      return;
    }
    // 로그인 사용자: 실제 Watch 생성(멱등)
    createWatch.mutate(billId);
  };

  // 이미 알림을 설정한 상태 — 성공 안내 + 관리 링크
  if (activeWatch) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-(--color-primary)/30 bg-(--color-primary)/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-(--color-text-primary)">
          ✓ 알림을 설정했습니다. 변경 사항이 있을 때 주간 이메일로 보내드려요.
        </p>
        <Link
          href="/alerts"
          className="shrink-0 text-sm font-semibold text-(--color-primary) no-underline hover:underline"
        >
          알림 관리 →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-(--color-text-primary)">
          이 법안의 처리 상태가 바뀌면 주 1회 알려드릴게요.
        </p>
        <p className="mt-0.5 text-xs text-(--color-text-tertiary)">
          변경 사항이 있을 때만 이메일로 보내드립니다.
        </p>
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || createWatch.isPending}
        className="shrink-0 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {createWatch.isPending ? "설정 중…" : "변경 알림 받기"}
      </button>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        returnTo={`/bills/${billId}`}
      />
    </div>
  );
}
