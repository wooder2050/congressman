"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

type EventParams = Record<string, string | number | boolean | undefined | null>;

interface TrackedLinkProps {
  href: string;
  eventName: string;
  eventParams?: EventParams;
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
  className,
  children,
}: TrackedLinkProps) {
  return (
    <Link href={href} onClick={() => trackEvent(eventName, eventParams)} className={className}>
      {children}
    </Link>
  );
}
