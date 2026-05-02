"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useUserPreferences, useToggleMemberBookmark } from "@/hooks/useUserPreferences";
import LoginModal from "@/components/auth/LoginModal";

interface MemberBookmarkButtonProps {
  memberId: string;
}

export default function MemberBookmarkButton({ memberId }: MemberBookmarkButtonProps) {
  const { user } = useAuth();
  const { data: prefs } = useUserPreferences();
  const { mutate, isPending } = useToggleMemberBookmark();
  const [loginOpen, setLoginOpen] = useState(false);

  const bookmarked = prefs?.bookmarkedMembers?.includes(memberId) ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setLoginOpen(true);
      return;
    }

    mutate({ memberId, bookmarked });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-(--color-bg-secondary) disabled:opacity-50"
        aria-label={bookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        title={bookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={bookmarked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={bookmarked ? "text-amber-500" : "text-(--color-text-tertiary)"}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
