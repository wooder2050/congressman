"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import LoginModal from "@/components/auth/LoginModal";

/* ── 아이콘 ── */
const HomeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const MembersIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const BillsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);
const VotesIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const MoreIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);
const MapIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);
const CompareIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 3H5a2 2 0 0 0-2 2v4" />
    <path d="M15 3h4a2 2 0 0 1 2 2v4" />
    <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
    <path d="M15 21h4a2 2 0 0 0 2-2v-4" />
    <line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);
const WeeklyIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" />
    <path d="M15 18h-5" />
    <path d="M10 6h8v4h-8z" />
  </svg>
);
const CommitteesIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 3h-8l-2 4h12z" />
  </svg>
);
const GuideIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/* ── 메인 탭 (5개) ── */
const mainTabs = [
  { href: "/", label: "홈", icon: <HomeIcon /> },
  { href: "/members", label: "의원", icon: <MembersIcon /> },
  { href: "/bills", label: "법안", icon: <BillsIcon /> },
  { href: "/votes", label: "표결", icon: <VotesIcon /> },
];

const TodayIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const DistrictIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const BookmarkIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/* ── 더보기 메뉴 항목 ── */
const moreItems = [
  { href: "/today", label: "오늘", icon: <TodayIcon /> },
  { href: "/my-district", label: "내 지역구", icon: <DistrictIcon /> },
  { href: "/bookmarks", label: "즐겨찾기", icon: <BookmarkIcon /> },
  { href: "/map", label: "지도", icon: <MapIcon /> },
  { href: "/compare", label: "비교", icon: <CompareIcon /> },
  { href: "/weekly", label: "주간뉴스", icon: <WeeklyIcon /> },
  { href: "/committees", label: "위원회", icon: <CommitteesIcon /> },
  { href: "/guide", label: "안내", icon: <GuideIcon /> },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, loading: authLoading, signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isMoreActive = moreItems.some((item) => isActive(item.href));

  return (
    <>
      {/* 더보기 바텀시트 */}
      {moreOpen && (
        <>
          {/* 백드롭 */}
          <div
            className="fixed inset-0 z-60 bg-black/40"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          {/* 시트 */}
          <div className="animate-slide-up fixed right-0 bottom-0 left-0 z-60 rounded-t-2xl bg-(--color-bg-primary) px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-(--color-text-primary)">더보기</h2>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-full p-2 text-(--color-text-tertiary) hover:bg-(--color-bg-secondary)"
                aria-label="닫기"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {/* 로그인/유저 정보 */}
            <div className="mb-3 border-b border-(--color-border-primary) pb-3">
              {authLoading ? (
                <div className="flex items-center gap-2.5 py-2">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-(--color-bg-tertiary)" />
                  <div className="h-4 w-24 animate-pulse rounded bg-(--color-bg-tertiary)" />
                </div>
              ) : user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {user.user_metadata?.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={user.user_metadata.avatar_url}
                        alt=""
                        width={32}
                        height={32}
                        className="rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-bg-tertiary) text-xs font-bold text-(--color-text-secondary)">
                        {(user.user_metadata?.full_name || user.email || "U")[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-(--color-text-primary)">
                        {user.user_metadata?.full_name || user.email?.split("@")[0] || "사용자"}
                      </p>
                      {user.email && (
                        <p className="text-xs text-(--color-text-tertiary)">{user.email}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMoreOpen(false);
                      signOut();
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-(--color-text-tertiary) transition-colors hover:bg-(--color-bg-secondary)"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    setLoginOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl py-2 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-secondary)"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-bg-tertiary)">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  로그인하고 맞춤 기능 사용하기
                </button>
              )}
            </div>

            <nav className="grid grid-cols-5 gap-2">
              {moreItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl py-3 no-underline transition-colors ${
                      active
                        ? "bg-(--color-bg-secondary) font-bold text-(--color-text-primary)"
                        : "text-(--color-text-tertiary) hover:bg-(--color-bg-secondary)"
                    }`}
                  >
                    {item.icon}
                    <span className="text-xs">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}

      {/* 메인 탭 바 */}
      <nav className="fixed right-0 bottom-0 left-0 z-50 bg-(--color-bg-primary) pb-[env(safe-area-inset-bottom)] shadow-(--shadow-bottom-nav) lg:hidden">
        <div className="mx-auto flex max-w-5xl">
          {mainTabs.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center py-2 no-underline transition-colors ${
                  active ? "font-bold text-(--color-text-primary)" : "text-(--color-text-tertiary)"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.icon}
                <span className="mt-1 text-xs">{item.label}</span>
              </Link>
            );
          })}
          {/* 더보기 버튼 */}
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-1 flex-col items-center justify-center py-2 transition-colors ${
              isMoreActive || moreOpen
                ? "font-bold text-(--color-text-primary)"
                : "text-(--color-text-tertiary)"
            }`}
            aria-expanded={moreOpen}
            aria-label="더보기 메뉴"
          >
            <MoreIcon />
            <span className="mt-1 text-xs">더보기</span>
          </button>
        </div>
      </nav>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
