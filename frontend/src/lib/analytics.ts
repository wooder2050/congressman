/**
 * GTM dataLayer 이벤트 헬퍼.
 *
 * 사용:
 *   trackEvent("home_hero_action", { scope: "members", query_length: 3 });
 *
 * GTM 워크스페이스에서 "Custom Event" 트리거(Event name = home_hero_action 등)와
 * GA4 Event 태그를 만들어 dataLayer 변수를 매핑하면 GA4 이벤트로 전송된다.
 */

type EventParams = Record<string, string | number | boolean | undefined | null>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(eventName: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  // GTM 스크립트가 lazyOnload라 dataLayer 초기화 전 이벤트가 발생할 수 있음 → 직접 보장.
  window.dataLayer = window.dataLayer || [];
  // undefined/null 필드는 보내지 않음.
  const cleaned: Record<string, unknown> = { event: eventName };
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) cleaned[k] = v;
  }
  window.dataLayer.push(cleaned);
}
