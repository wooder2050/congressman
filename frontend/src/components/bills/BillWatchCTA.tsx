"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import LoginModal from "@/components/auth/LoginModal";
import {
  RADAR_ENABLED,
  trackCtaView,
  trackCtaClick,
  trackLoginStarted,
} from "@/lib/radar-analytics";

/**
 * 법안 상세 "변경 알림 받기" CTA.
 *
 * Phase 1(측정 기반): 노출·클릭 이벤트만 측정한다. 실제 Watch 생성은 Phase 2에서 연결.
 * feature flag `NEXT_PUBLIC_RADAR_ENABLED`가 켜졌을 때만 렌더링되며, 꺼지면 아무것도
 * 그리지 않아 이벤트도 발생하지 않는다.
 */
export default function BillWatchCTA({ billId }: { billId: string }) {
  const { user, loading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const viewedRef = useRef(false);

  // 노출 이벤트는 마운트당 1회만(React 재렌더 중복 방지). 인증 로딩이 끝난 뒤 발화.
  useEffect(() => {
    if (!RADAR_ENABLED || loading || viewedRef.current) return;
    viewedRef.current = true;
    trackCtaView({ billId, path: window.location.pathname, loggedIn: !!user });
  }, [billId, user, loading]);

  if (!RADAR_ENABLED) return null;

  const handleClick = () => {
    const path = window.location.pathname;
    trackCtaClick({ billId, path, loggedIn: !!user });
    if (!user) {
      trackLoginStarted(billId, path);
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
        className="shrink-0 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
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
