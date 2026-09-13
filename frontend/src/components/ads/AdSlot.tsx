"use client";

import { useEffect, useRef } from "react";
import { AD_PLACEMENTS, AD_RESERVED_HEIGHT, type AdPlacementKey } from "@/lib/ad-placements";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * 수동 AdSense 광고 단위 (반응형 디스플레이).
 *
 * Auto Ads 대신 수동 단위를 쓰는 이유(codex 설계 검증, 2026-08-15):
 * 페이지별 로더 스크립트는 SPA 전환에서 언로드되지 않아 광고 페이지를 한 번
 * 거치면 비광고 페이지에도 Auto Ads 상태가 남는다. 수동 단위는 로더가 남아도
 * 슬롯을 렌더링한 페이지에서만 광고 요청이 발생하므로, 저가치 페이지(색인 제외
 * 법안 등)를 광고 표면에서 확실히 배제할 수 있다. "게시자 콘텐츠 없는 화면
 * 광고" 정책 리스크 대응.
 *
 * 배치 원칙: 색인 기준(isBillIndexable)과 동일한 판정을 통과한 페이지 + 편집형
 * 페이지(용어사전·가이드·주간뉴스 등)에만 렌더링한다. 판정이 불가능하면
 * 렌더링하지 않는 것이 기본(fail-closed) — 호출부가 책임진다.
 *
 * 2026-09-13(승인 후) 변경: placement 키로 단위 ID·높이 예약을 결정하고, 외곽에
 * `data-ad-placement`와 "광고" 라벨을 둔다. 높이를 미리 예약해 CLS를 줄인다
 * (unfilled여도 자리를 0으로 접지 않는다 — 접으면 다시 레이아웃이 밀린다).
 * 초기화는 마운트 시 1회(StrictMode 이중 실행 방어). 뷰포트 기반 지연 마운트는
 * 후속 PR에서 다룬다.
 */
export default function AdSlot({
  placement,
  className,
}: {
  placement: AdPlacementKey;
  className?: string;
}) {
  const config = AD_PLACEMENTS[placement];
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!config?.slot) return;
    // StrictMode 이중 실행·SPA 재방문에서 같은 슬롯에 중복 push 방지
    if (pushed.current) return;
    if (ref.current?.getAttribute("data-adsbygoogle-status")) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // 차단기·로더 오류 환경 — 광고 없이 조용히 지나간다
    }
  }, [config?.slot]);

  // 단위 ID가 설정되지 않은 배치는 렌더링하지 않는다(기존 ID로 대체하지 않음)
  if (!config?.slot) return null;

  const reserved = AD_RESERVED_HEIGHT[config.sizing];

  return (
    <div
      data-ad-placement={placement}
      className={`my-2 ${className ?? ""}`}
      style={{ minHeight: reserved }}
      aria-label="광고"
    >
      <p className="mb-1 text-[11px] leading-none text-(--color-text-tertiary)">광고</p>
      <ins
        ref={ref}
        className="adsbygoogle block"
        style={{ display: "block", minHeight: reserved - 30 }}
        data-ad-client="ca-pub-6439388251426570"
        data-ad-slot={config.slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
