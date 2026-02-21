import Link from "next/link";
import ColorBadge from "@/components/ui/color-badge";
import { formatDate } from "@/lib/utils";
import { VOTE_RESULT_MAP } from "@/lib/constants";
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
        <ColorBadge
          label={resultInfo.label}
          color={resultInfo.color}
          textColor={resultInfo.textColor}
          size="sm"
          termHint={resultInfo.termKey}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--color-text-tertiary)">
        <span>
          찬성 <strong className="text-(--color-vote-yes)">{vote.yesCount}</strong>
        </span>
        <span>
          반대 <strong className="text-(--color-vote-no)">{vote.noCount}</strong>
        </span>
        <span>
          기권 <strong className="text-(--color-vote-abstain)">{vote.abstainCount}</strong>
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-3 text-xs text-(--color-text-tertiary)">
        <span>{formatDate(vote.procDate)}</span>
        {vote.committee && <span>{vote.committee}</span>}
      </div>
    </Link>
  );
}
