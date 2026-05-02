"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) return null;

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "사용자";
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-secondary)"
      >
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatarUrl}
            alt=""
            width={28}
            height={28}
            className="rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-(--color-bg-tertiary) text-xs font-bold text-(--color-text-secondary)">
            {displayName[0]}
          </div>
        )}
        <span className="hidden xl:inline">{displayName}</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-48 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) py-1 shadow-lg">
          <div className="border-b border-(--color-border-primary) px-4 py-2.5">
            <p className="truncate text-sm font-semibold text-(--color-text-primary)">
              {displayName}
            </p>
            {user.email && (
              <p className="truncate text-xs text-(--color-text-tertiary)">{user.email}</p>
            )}
          </div>
          <Link
            href="/my-district"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-(--color-text-secondary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            내 지역구
          </Link>
          <Link
            href="/bookmarks"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-(--color-text-secondary) no-underline transition-colors hover:bg-(--color-bg-secondary)"
          >
            즐겨찾기
          </Link>
          <div className="border-t border-(--color-border-primary)" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-secondary)"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
