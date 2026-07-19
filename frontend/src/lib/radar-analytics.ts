/**
 * Lawmake Radar(법안 변경 알림 베타) 분석 이벤트 정의.
 *
 * 계획서 5장 퍼널 이벤트를 상수화한다. GA(GTM dataLayer)로 보내는 프론트 이벤트만 여기 둔다.
 * (watch_created·digest_* 등 서버 원장 기반 이벤트는 백엔드 DB에서 집계하므로 제외)
 *
 * feature flag `NEXT_PUBLIC_RADAR_ENABLED`가 "true"일 때만 Radar UI·이벤트가 활성화된다.
 * flag가 꺼지면 CTA 자체가 렌더링되지 않아 이벤트도 발생하지 않는다.
 */
import { trackEvent } from "./analytics";

/** Radar 기능 활성화 여부(feature flag). 기본 OFF. */
export const RADAR_ENABLED = process.env.NEXT_PUBLIC_RADAR_ENABLED === "true";

/** 프론트에서 GA로 보내는 Radar 퍼널 이벤트 이름. */
export const RADAR_EVENTS = {
  ctaView: "alert_cta_view", // 법안 상세 CTA 노출
  ctaClick: "alert_cta_click", // CTA 클릭
  loginStarted: "login_started", // 알림 흐름에서 로그인 시작
  loginCompleted: "login_completed", // 로그인 후 알림 흐름 복귀
} as const;

interface CtaEventParams {
  billId: string;
  path: string;
  loggedIn: boolean;
}

/** CTA 노출. React 재렌더로 중복 발화되지 않도록 호출부에서 1회만 호출한다. */
export function trackCtaView(p: CtaEventParams): void {
  trackEvent(RADAR_EVENTS.ctaView, {
    bill_id: p.billId,
    path: p.path,
    logged_in: p.loggedIn,
  });
}

/** CTA 클릭. */
export function trackCtaClick(p: CtaEventParams): void {
  trackEvent(RADAR_EVENTS.ctaClick, {
    bill_id: p.billId,
    path: p.path,
    logged_in: p.loggedIn,
  });
}

/** 알림 흐름에서 로그인 시작(비로그인 사용자가 CTA 클릭 → 로그인 유도). */
export function trackLoginStarted(billId: string, returnPath: string): void {
  trackEvent(RADAR_EVENTS.loginStarted, { bill_id: billId, return_path: returnPath });
}

/** 로그인 후 알림 흐름으로 복귀. */
export function trackLoginCompleted(billId: string): void {
  trackEvent(RADAR_EVENTS.loginCompleted, { bill_id: billId });
}
