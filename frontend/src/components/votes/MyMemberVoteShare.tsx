"use client";

import { useAuth } from "@/lib/auth-context";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import ShareButton from "@/components/ui/ShareButton";
import type { VoteMemberResult } from "@/types";

interface MyMemberVoteShareProps {
  voteId: string;
  billName: string;
  memberVotes: VoteMemberResult[];
}

const RESULT_LABEL: Record<string, string> = {
  yes: "찬성",
  no: "반대",
  abstain: "기권",
  absent: "불참",
};

export default function MyMemberVoteShare({
  voteId,
  billName,
  memberVotes,
}: MyMemberVoteShareProps) {
  const { user } = useAuth();
  const { data: prefs } = useUserPreferences();

  if (!user || !prefs) return null;

  const bookmarkedMembers = prefs.bookmarkedMembers ?? [];
  if (bookmarkedMembers.length === 0) return null;

  const matchedVotes = memberVotes.filter((mv) => bookmarkedMembers.includes(mv.memberId));

  if (matchedVotes.length === 0) return null;

  return (
    <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <h2 className="mb-4 text-lg font-bold text-(--color-text-primary)">내 관심 의원 표결</h2>
      <div className="space-y-3">
        {matchedVotes.map((mv) => {
          const resultLabel = RESULT_LABEL[mv.result] ?? mv.result;
          const shareText = `${mv.memberName} 의원은 [${billName}]에 ${resultLabel} 투표했습니다`;
          const shareUrl =
            typeof window !== "undefined" ? `${window.location.origin}/votes/${voteId}` : "";

          return (
            <div
              key={mv.memberId}
              className="flex items-center justify-between gap-3 rounded-lg bg-(--color-bg-secondary) p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: mv.partyColor }}
                >
                  {mv.memberName.charAt(0)}
                </div>
                <div>
                  <span className="text-sm font-semibold text-(--color-text-primary)">
                    {mv.memberName}
                  </span>
                  <span className="ml-2 text-xs text-(--color-text-tertiary)">{mv.partyName}</span>
                </div>
                <VoteResultBadge result={mv.result} />
              </div>
              <ShareButton title={billName} text={shareText} url={shareUrl} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VoteResultBadge({ result }: { result: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    yes: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      label: "찬성",
    },
    no: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-300",
      label: "반대",
    },
    abstain: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-700 dark:text-yellow-300",
      label: "기권",
    },
    absent: {
      bg: "bg-gray-100 dark:bg-gray-900/30",
      text: "text-gray-700 dark:text-gray-300",
      label: "불참",
    },
  };

  const c = config[result] ?? config.absent;

  return (
    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
