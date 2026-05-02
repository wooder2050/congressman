"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { getMembers } from "@/lib/api";
import MemberAvatar from "@/components/members/MemberAvatar";
import MemberBookmarkButton from "@/components/ui/MemberBookmarkButton";
import LoginModal from "@/components/auth/LoginModal";
import { formatDistrict } from "@/lib/utils";

export default function BookmarkedMembers() {
  const { user, loading: authLoading } = useAuth();
  const { data: prefs, isLoading: prefsLoading } = useUserPreferences();
  const [loginOpen, setLoginOpen] = useState(false);

  const memberIds = prefs?.bookmarkedMembers ?? [];

  const TERM_ID = 22; // 현재 대수
  const {
    data: allMembers,
    isLoading: membersLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["members", JSON.stringify(TERM_ID)],
    queryFn: () => getMembers(TERM_ID),
    enabled: memberIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const members = (allMembers ?? []).filter((m) => memberIds.includes(m.id));

  if (authLoading || prefsLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-(--color-bg-tertiary)" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-8 text-center">
        <p className="text-base font-semibold text-(--color-text-primary)">
          로그인하면 의원을 저장할 수 있습니다
        </p>
        <p className="mt-1 text-sm text-(--color-text-tertiary)">
          의원 목록에서 관심 있는 의원을 즐겨찾기 해보세요.
        </p>
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className="mt-3 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white"
        >
          로그인하기
        </button>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    );
  }

  if (memberIds.length === 0) {
    return (
      <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-8 text-center">
        <p className="text-base font-semibold text-(--color-text-primary)">
          저장한 의원이 없습니다
        </p>
        <p className="mt-1 text-sm text-(--color-text-tertiary)">
          의원 목록에서 관심 있는 의원을 즐겨찾기 해보세요.
        </p>
        <Link
          href="/members"
          className="mt-3 inline-block rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white no-underline"
        >
          의원 목록 보기
        </Link>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center dark:border-red-800/40 dark:bg-red-950/20">
        <p className="text-sm font-semibold text-red-800 dark:text-red-200">
          데이터를 불러오지 못했습니다
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 text-sm font-medium text-(--color-primary) hover:underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (membersLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-(--color-bg-tertiary)" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-(--color-text-tertiary)">{members.length}명 저장됨</p>
      {members.map((m) => (
        <div
          key={m.id}
          className="flex items-center gap-3 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-3"
        >
          <Link
            href={`/members/${m.id}?term=22`}
            className="flex min-w-0 flex-1 items-center gap-3 no-underline"
          >
            <MemberAvatar
              name={m.name}
              photoUrl={m.photoUrl}
              size={48}
              bgColor={m.term.party.color}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-(--color-text-primary)">{m.name}</span>
                <span className="text-xs text-(--color-text-tertiary)">{m.term.party.name}</span>
              </div>
              <p className="truncate text-xs text-(--color-text-tertiary)">
                {m.term.proportional ? "비례대표" : formatDistrict(m.term.district)}
              </p>
            </div>
          </Link>
          <MemberBookmarkButton memberId={m.id} />
        </div>
      ))}
    </div>
  );
}
