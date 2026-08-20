"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { useImpression } from "@/lib/use-impression";

type EventParams = Record<string, string | number | boolean | undefined | null>;

interface TrackedLinkProps {
  href: string;
  eventName: string;
  eventParams?: EventParams;
  /** 지정하면 링크가 뷰포트에 50% 보일 때 component_impression을 1회 전송 (클릭의 노출 분모) */
  impressionParams?: EventParams;
  className?: string;
  children: React.ReactNode;
}

/**
 * 클릭 시 GA(GTM dataLayer) 이벤트를 보내는 공용 Link.
 * 서버 컴포넌트 안에서 클릭 추적이 필요할 때 사용한다 (BreakingNewsLink의 일반화 버전).
 */
export default function TrackedLink({
  href,
  eventName,
  eventParams,
  impressionParams,
  className,
  children,
}: TrackedLinkProps) {
  const impressionRef = useImpression(impressionParams);
  return (
    <Link
      ref={impressionRef}
      href={href}
      onClick={() => trackEvent(eventName, eventParams)}
      className={className}
    >
      {children}
    </Link>
  );
}
