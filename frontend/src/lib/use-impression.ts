"use client";

import { useCallback, useRef } from "react";
import { trackEvent } from "./analytics";

type ImpressionParams = Record<string, string | number | boolean | undefined | null>;

/**
 * 요소가 뷰포트에 50% 이상 처음 보일 때 component_impression 이벤트를 1회 전송하는 ref 훅.
 *
 * 클릭 이벤트(editors_pick_click 등)에 노출 분모를 만들어 CTR을 계산할 수 있게 한다
 * — weekly_article_click "3주 2회"가 품질 문제인지 노출 부족인지 판별 불가였던 문제의 해소.
 * params에는 component(자리)·article_id(콘텐츠)·position(순번)을 넣는 것이 규약.
 */
export function useImpression(params: ImpressionParams | undefined) {
  const fired = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  return useCallback((node: Element | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!params || !node || fired.current) return;
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        if (fired.current) return;
        if (entries.some((e) => e.isIntersecting)) {
          fired.current = true;
          trackEvent("component_impression", params);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(node);
    observerRef.current = io;
    // params는 카드별 정적 값 — 최초 렌더 시점 값을 의도적으로 고정한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
