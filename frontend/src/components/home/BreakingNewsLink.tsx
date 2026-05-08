"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

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
  return (
    <Link
      href={href}
      onClick={() => trackEvent("home_breaking_click", { category, position })}
      className={className}
    >
      {children}
    </Link>
  );
}
