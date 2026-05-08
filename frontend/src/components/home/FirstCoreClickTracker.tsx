"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

const CORE_PREFIXES = ["/members", "/bills", "/votes", "/my-district", "/today"];
const WINDOW_MS = 10_000;

function isCorePath(href: string | null): string | null {
  if (!href) return null;
  // 외부 링크/앵커 무시.
  let pathname: string;
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    pathname = url.pathname;
  } catch {
    return null;
  }
  return CORE_PREFIXES.find((p) => pathname === p || pathname.startsWith(p + "/")) ?? null;
}

/**
 * 홈 진입 후 WINDOW_MS 안에 core 링크(`/members` 등)를 클릭하면
 * `home_first_core_click` 이벤트를 1회 전송한다. 한 번 발화하면 마운트 동안 비활성.
 *
 * 페이지를 벗어나면 unmount → 다음 홈 방문에서 다시 측정.
 */
export default function FirstCoreClickTracker() {
  useEffect(() => {
    const enteredAt = Date.now();
    let fired = false;

    const onClick = (e: MouseEvent) => {
      if (fired) return;
      const elapsed = Date.now() - enteredAt;
      if (elapsed > WINDOW_MS) return;

      const target = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!target) return;
      const href = target.getAttribute("href");
      const target_path = isCorePath(href);
      if (!target_path) return;

      fired = true;
      trackEvent("home_first_core_click", {
        target_path,
        elapsed_ms: elapsed,
      });
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
