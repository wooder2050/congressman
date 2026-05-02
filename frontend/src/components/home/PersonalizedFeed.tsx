"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { getRadar } from "@/lib/api";
import { TOPIC_MAP, BILL_STATUS_MAP } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import ColorBadge from "@/components/ui/color-badge";
import InterestPicker from "@/components/home/InterestPicker";
import LoginModal from "@/components/auth/LoginModal";

interface PersonalizedFeedProps {
  termId: number;
}

export default function PersonalizedFeed({ termId }: PersonalizedFeedProps) {
  const { user, loading: authLoading } = useAuth();
  const { data: prefs, isLoading: prefsLoading } = useUserPreferences();
  const [editMode, setEditMode] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const interests = prefs?.interests ?? [];

  const { data: radar, isLoading: radarLoading } = useQuery({
    queryKey: ["radar", termId, ...interests],
    queryFn: () => getRadar({ termId, topics: interests }),
    enabled: !!user && interests.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  if (authLoading) return null;

  if (!user) {
    return (
      <section className="space-y-3">
        <h2 className="text-xl font-bold">내 관심 이슈</h2>
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <p className="text-sm text-(--color-text-secondary)">
            관심 이슈를 설정하고 맞춤 법안을 받아보세요.
          </p>
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="mt-3 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white"
          >
            로그인하기
          </button>
        </div>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </section>
    );
  }

  if (prefsLoading) {
    return (
      <section className="space-y-3">
        <h2 className="text-xl font-bold">내 관심 이슈</h2>
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <div className="h-20 animate-pulse rounded-lg bg-(--color-bg-secondary)" />
        </div>
      </section>
    );
  }

  if (interests.length === 0 || editMode) {
    return (
      <section className="space-y-3">
        <h2 className="text-xl font-bold">내 관심 이슈</h2>
        <InterestPicker initialInterests={interests} onSaved={() => setEditMode(false)} />
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">내 관심 이슈</h2>
        <button
          type="button"
          onClick={() => setEditMode(true)}
          className="text-sm font-semibold text-(--color-primary)"
        >
          관심 주제 수정
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {interests.map((topic) => {
          const info = TOPIC_MAP[topic];
          if (!info) return null;
          return (
            <span
              key={topic}
              className="inline-flex items-center gap-1 rounded-full bg-(--color-bg-tertiary) px-2.5 py-0.5 text-xs font-medium text-(--color-text-secondary)"
            >
              {info.emoji} {info.label}
            </span>
          );
        })}
      </div>

      {radarLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary)"
            />
          ))}
        </div>
      ) : radar?.bills && radar.bills.length > 0 ? (
        <div className="space-y-3">
          {radar.bills.map((bill) => {
            const statusInfo =
              BILL_STATUS_MAP[bill.status as keyof typeof BILL_STATUS_MAP] ??
              BILL_STATUS_MAP.pending;
            return (
              <Link
                key={bill.id}
                href={`/bills/${bill.id}`}
                className="block rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 no-underline transition-colors hover:bg-(--color-bg-hover)"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-base font-semibold text-(--color-text-primary)">
                    {bill.title}
                  </h3>
                  <ColorBadge
                    label={statusInfo.label}
                    color={statusInfo.color}
                    textColor={statusInfo.textColor}
                    size="sm"
                    termHint={statusInfo.termKey}
                  />
                </div>
                {bill.simpleSummary && (
                  <p className="mt-1 line-clamp-2 text-sm text-(--color-text-secondary)">
                    {bill.simpleSummary}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--color-text-tertiary)">
                  {bill.topic && (
                    <span className="rounded-full bg-(--color-bg-tertiary) px-2 py-0.5 font-medium text-(--color-text-secondary)">
                      {TOPIC_MAP[bill.topic]?.emoji} {bill.topic}
                    </span>
                  )}
                  <span className="font-semibold text-(--color-text-secondary)">
                    {bill.proposerName}
                  </span>
                  <span>{formatDate(bill.proposedDate)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
          <p className="text-center text-sm text-(--color-text-tertiary)">
            선택한 주제의 법안이 없습니다.
          </p>
        </div>
      )}
    </section>
  );
}
