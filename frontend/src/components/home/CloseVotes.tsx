"use client";

import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getHomeStats } from "@/lib/api";
import VoteResultBar from "@/components/votes/VoteResultBar";
import ColorBadge from "@/components/ui/color-badge";
import { formatDate } from "@/lib/utils";
import { VOTE_RESULT_MAP } from "@/lib/constants";

interface CloseVotesProps {
  termId: number;
}

export default function CloseVotes({ termId }: CloseVotesProps) {
  const { data } = useCongressSuspenseQuery(getHomeStats, termId);

  if (!data?.closeVotes?.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-(--color-text-primary)">찬반 팽팽한 표결</h3>
      <p className="text-sm text-(--color-text-tertiary)">
        찬성과 반대 차이가 가장 적었던 표결입니다
      </p>
      <div className="space-y-3">
        {data.closeVotes.map((vote) => {
          const margin = Math.abs(vote.yesCount - vote.noCount);
          const resultInfo = VOTE_RESULT_MAP[vote.resultCode] ?? VOTE_RESULT_MAP.other;
          return (
            <Link
              key={vote.id}
              href={`/votes/${vote.id}`}
              className="block rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 no-underline transition-colors hover:bg-(--color-bg-hover)"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h4 className="line-clamp-2 text-base font-semibold text-(--color-text-primary)">
                  {vote.billName}
                </h4>
                <ColorBadge
                  label={resultInfo.label}
                  color={resultInfo.color}
                  textColor={resultInfo.textColor}
                  size="sm"
                />
              </div>
              <VoteResultBar
                yesCount={vote.yesCount}
                noCount={vote.noCount}
                abstainCount={vote.abstainCount}
                voteTotal={vote.voteTotal}
              />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-600">차이 {margin}표</span>
                <span className="text-(--color-text-tertiary)">
                  찬성 {vote.yesCount} vs 반대 {vote.noCount}
                </span>
              </div>
              <div className="mt-1 text-xs text-(--color-text-tertiary)">
                {formatDate(vote.procDate)}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
