"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { useImpression } from "@/lib/use-impression";

interface BreakingNewsLinkProps {
  href: string;
  category: string;
  position: "lead" | "compact";
  className?: string;
  children: React.ReactNode;
}

export default function BreakingNewsLink({
  href,
  category,
  position,
  className,
  children,
}: BreakingNewsLinkProps) {
  const impressionRef = useImpression({ component: "home_breaking", category, position });
  return (
    <Link
      ref={impressionRef}
      href={href}
      onClick={() => trackEvent("home_breaking_click", { category, position })}
      className={className}
    >
      {children}
    </Link>
  );
}
