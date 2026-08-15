"use client";

import { useEffect, useRef } from "react";

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
 * 배치 원칙: 색인 기준(isIndexable)과 동일한 판정을 통과한 페이지 + 편집형
 * 페이지(용어사전·가이드·주간뉴스 등)에만 렌더링한다. 판정이 불가능하면
 * 렌더링하지 않는 것이 기본(fail-closed) — 호출부가 책임진다.
 */
export default function AdSlot({ className }: { className?: string }) {
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // StrictMode 이중 실행·SPA 재방문에서 같은 슬롯에 중복 push 방지
    if (pushed.current) return;
    if (ref.current?.getAttribute("data-adsbygoogle-status")) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // 로더 미로드·차단기 환경 — 광고 없이 조용히 지나간다
    }
  }, []);

  return (
    <ins
      ref={ref}
      className={`adsbygoogle block ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client="ca-pub-6439388251426570"
      data-ad-slot="9599985939"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
