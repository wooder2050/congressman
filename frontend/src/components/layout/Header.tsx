"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/members", label: "의원" },
  { href: "/map", label: "지도" },
  { href: "/votes", label: "표결" },
  { href: "/bills", label: "법안" },
  { href: "/compare", label: "비교" },
];

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-(--color-bg-primary) shadow-(--shadow-header)">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 lg:h-16">
        <Link
          href="/"
          className="text-lg font-bold text-(--color-text-primary) no-underline lg:text-xl"
        >
          국회의원 의정활동
        </Link>

        {/* Desktop navigation */}
        <nav className="ml-10 hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${
                  active
                    ? "bg-(--color-text-primary) font-bold text-white"
                    : "text-(--color-text-secondary) hover:bg-(--color-bg-secondary) hover:text-(--color-text-primary)"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
