"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { AD_PLACEMENTS, AD_RESERVED_HEIGHT, type AdPlacementKey } from "@/lib/ad-placements";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** 화면 아래 이 거리 안에 들어오면 실제 <ins>를 마운트한다 — 정확히 진입한 뒤 시작하면 로딩이 늦다 */
const PRELOAD_MARGIN = "300px";
/** 광고 '자리'가 보였다고 볼 기준 — 50% 이상이 1초 연속. AdSense Active View와 같은 측정은 아니다 */
const VIEWABLE_RATIO = 0.5;
const VIEWABLE_MS = 1000;

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
 * 페이지(용어사전·가이드·주간뉴스 등) + 데이터가 충실한 상세 페이지에만 렌더링한다.
 * 판정이 불가능하면 렌더링하지 않는 것이 기본(fail-closed) — 호출부가 책임진다.
 *
 * 2026-09-13(PR 1): placement 키로 단위 ID·높이 예약을 결정하고, 외곽에
 * `data-ad-placement`와 "광고" 라벨을 둔다. 높이를 미리 예약해 CLS를 줄인다
 * (unfilled여도 자리를 0으로 접지 않는다 — 접으면 다시 레이아웃이 밀린다).
 *
 * 2026-09-15(PR 2): 자리(외곽)만 먼저 렌더하고 뷰포트 300px 이내에 들어올 때
 * 실제 `<ins>`를 마운트해 1회 초기화한다. 화면 밖 슬롯이 광고를 요청하지 않으므로
 * 요청 대비 조회 가능 비율이 올라간다. 광고 '자리' 노출은 50%·1초 기준으로 GA4에
 * 보낸다(실제 광고 노출·수익 이벤트가 아니라 자리 도달률 지표).
 */
export default function AdSlot({
  placement,
  className,
}: {
  placement: AdPlacementKey;
  className?: string;
}) {
  const config = AD_PLACEMENTS[placement];
  const boxRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const impressionFired = useRef(false);
  const [mounted, setMounted] = useState(false);

  // 1) 뷰포트 근처에 들어오면 <ins> 마운트
  useEffect(() => {
    if (!config?.slot || mounted) return;
    const node = boxRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      // 관찰자 미지원 환경은 지연 없이 마운트(effect 본문에서 동기 setState 하지 않도록 타이머 경유)
      const t = setTimeout(() => setMounted(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: PRELOAD_MARGIN },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [config?.slot, mounted]);

  // 2) 마운트된 <ins>에 1회만 초기화 — StrictMode 이중 실행·재방문 중복 push 방지.
  //    폭 0(숨김·미연결)에서는 요청하지 않고, 폭이 생기면 재시도한다(availableWidth=0 오류 방지).
  useEffect(() => {
    if (!mounted || pushed.current) return;
    const node = insRef.current;
    if (!node) return;

    const tryPush = () => {
      if (pushed.current) return true;
      if (node.getAttribute("data-adsbygoogle-status")) {
        pushed.current = true;
        return true;
      }
      if (node.getBoundingClientRect().width === 0) return false;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // 차단기·로더 오류 환경 — 광고 없이 조용히 지나간다. 재시도하지 않는다.
        pushed.current = true;
      }
      return true;
    };

    if (tryPush()) return;
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      if (tryPush()) ro.disconnect();
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [mounted]);

  // 3) 광고 자리 노출 이벤트 — 50% 이상이 1초 연속 보일 때 1회
  useEffect(() => {
    if (!config?.slot) return;
    const node = boxRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    // 한 콜백에 진입·이탈이 함께 실려 올 수 있으므로 마지막(가장 최근) 기록만 현재 상태로 본다.
    // some()으로 합치면 이미 화면을 벗어난 자리도 노출로 기록될 수 있다.
    let lastVisible = false;

    const clear = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const stop = () => {
      io.disconnect();
      clear();
      document.removeEventListener("visibilitychange", onVisibility);
    };

    // 조건이 유지되는 동안에만 새 연속 1초를 측정한다. 탭이 숨겨지면 취소하고,
    // 돌아왔을 때 여전히 보이면 다시 처음부터 잰다.
    const sync = () => {
      if (impressionFired.current) return;
      const canCount = lastVisible && document.visibilityState === "visible";
      if (!canCount) {
        clear();
        return;
      }
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        // 타이머가 끝난 시점에도 조건이 유지되는지 재확인한다.
        if (impressionFired.current) return;
        if (!lastVisible || document.visibilityState !== "visible") return;
        impressionFired.current = true;
        trackEvent("component_impression", { component: "ad_placement", placement });
        stop();
      }, VIEWABLE_MS);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (impressionFired.current) return;
        const latest = entries[entries.length - 1];
        if (!latest) return;
        lastVisible = latest.isIntersecting && latest.intersectionRatio >= VIEWABLE_RATIO;
        sync();
      },
      { threshold: [VIEWABLE_RATIO] },
    );

    function onVisibility() {
      sync();
    }

    io.observe(node);
    document.addEventListener("visibilitychange", onVisibility);

    return stop;
  }, [config?.slot, placement]);

  // 단위 ID가 설정되지 않은 배치는 렌더링하지 않는다(기존 ID로 대체하지 않음)
  if (!config?.slot) return null;

  const reserved = AD_RESERVED_HEIGHT[config.sizing];

  return (
    <div
      ref={boxRef}
      data-ad-placement={placement}
      className={`my-2 ${className ?? ""}`}
      style={{ minHeight: reserved }}
      role="group"
      aria-label="광고"
    >
      <p className="mb-1 text-[11px] leading-none text-(--color-text-tertiary)">광고</p>
      {mounted && (
        <ins
          ref={insRef}
          className="adsbygoogle block"
          style={{ display: "block", minHeight: reserved - 30 }}
          data-ad-client="ca-pub-6439388251426570"
          data-ad-slot={config.slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
}
