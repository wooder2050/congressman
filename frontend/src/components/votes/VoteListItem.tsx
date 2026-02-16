import Link from "next/link";
import ColorBadge from "@/components/ui/color-badge";
import { formatDate } from "@/lib/utils";
import { VOTE_RESULT_MAP } from "@/lib/constants";
import VoteResultBar from "./VoteResultBar";
import type { Vote } from "@/types";

interface VoteListItemProps {
  vote: Vote;
}

export default function VoteListItem({ vote }: VoteListItemProps) {
  const resultInfo = VOTE_RESULT_MAP[vote.resultCode] ?? VOTE_RESULT_MAP.other;

  return (
    <Link
      href={`/votes/${vote.id}`}
      className="block rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 no-underline transition-colors hover:bg-(--color-bg-hover)"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-base font-semibold text-(--color-text-primary)">
          {vote.billName}
        </h3>
        <ColorBadge label={resultInfo.label} color={resultInfo.color} size="sm" />
      </div>

      <VoteResultBar
        yesCount={vote.yesCount}
        noCount={vote.noCount}
        abstainCount={vote.abstainCount}
        voteTotal={vote.voteTotal}
      />

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--color-text-tertiary)">
        <span>
          찬성 <strong className="text-green-600">{vote.yesCount}</strong>
        </span>
        <span>
          반대 <strong className="text-red-600">{vote.noCount}</strong>
        </span>
        <span>
          기권 <strong>{vote.abstainCount}</strong>
        </span>
        <span className="ml-auto">{formatDate(vote.procDate)}</span>
        {vote.committee && <span>{vote.committee}</span>}
      </div>
    </Link>
  );
}
