"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import LoginModal from "@/components/auth/LoginModal";
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
 * Phase 1(측정 기반): 노출·클릭·로그인 퍼널 이벤트만 측정한다. 실제 Watch 생성은 Phase 2에서 연결.
 * feature flag `NEXT_PUBLIC_RADAR_ENABLED`가 켜졌을 때만 렌더링되며, 꺼지면 아무것도
 * 그리지 않아 이벤트도 발생하지 않는다.
 */
export default function BillWatchCTA({ billId }: { billId: string }) {
  const { user, loading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  // 노출 이벤트를 billId당 1회만 발화(같은 컴포넌트가 다른 법안으로 재사용돼도 재발화).
  const viewedBillRef = useRef<string | null>(null);

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
    // Phase 2에서 실제 Watch 생성으로 대체. 현재는 측정만.
    setLoginOpen(false);
  };

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
        disabled={loading}
        className="shrink-0 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        변경 알림 받기
      </button>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        returnTo={`/bills/${billId}`}
      />
    </div>
  );
}
