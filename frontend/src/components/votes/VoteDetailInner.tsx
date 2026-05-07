import Link from "next/link";
import ColorBadge from "@/components/ui/color-badge";
import VoteResultBar from "./VoteResultBar";
import PartyVoteGrid from "./PartyVoteGrid";
import MyMemberVoteShare from "./MyMemberVoteShare";
import { formatDate } from "@/lib/utils";
import ShareButton from "@/components/ui/ShareButton";
import { VOTE_RESULT_MAP } from "@/lib/constants";
import type { VoteWithMemberVotes } from "@/types";

interface VoteDetailInnerProps {
  id: string;
  data: VoteWithMemberVotes;
}

export default function VoteDetailInner({ id, data }: VoteDetailInnerProps) {
  const { vote, memberVotes } = data;
  const resultInfo = VOTE_RESULT_MAP[vote.resultCode] ?? VOTE_RESULT_MAP.other;
  const absentCount = vote.memberTotal - vote.voteTotal;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href={`/votes?term=${vote.termId}`}
        className="inline-flex items-center gap-1 text-sm text-(--color-text-tertiary) no-underline hover:text-(--color-text-secondary)"
      >
        ← 표결 목록
      </Link>

      <div className="space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-(--color-text-primary) sm:text-2xl">
            {vote.billName}
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <ColorBadge
              label={resultInfo.label}
              color={resultInfo.color}
              textColor={resultInfo.textColor}
              termHint={resultInfo.termKey}
            />
            <ShareButton title={vote.billName} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--color-text-tertiary)">
          <span>{formatDate(vote.procDate)}</span>
          {vote.committee && <span>{vote.committee}</span>}
          {vote.billNo && <span>의안번호 {vote.billNo}</span>}
        </div>

        <VoteResultBar
          yesCount={vote.yesCount}
          noCount={vote.noCount}
          abstainCount={vote.abstainCount}
          voteTotal={vote.voteTotal}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
            <p className="text-2xl font-bold text-(--color-vote-yes)">{vote.yesCount}</p>
            <p className="text-xs text-(--color-text-tertiary)">찬성</p>
          </div>
          <div className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
            <p className="text-2xl font-bold text-(--color-vote-no)">{vote.noCount}</p>
            <p className="text-xs text-(--color-text-tertiary)">반대</p>
          </div>
          <div className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
            <p className="text-2xl font-bold text-(--color-vote-abstain)">{vote.abstainCount}</p>
            <p className="text-xs text-(--color-text-tertiary)">기권</p>
          </div>
          <div className="rounded-lg bg-(--color-bg-secondary) p-3 text-center">
            <p className="text-2xl font-bold text-(--color-vote-absent)">{absentCount}</p>
            <p className="text-xs text-(--color-text-tertiary)">불참</p>
          </div>
        </div>

        {vote.hasBill && (
          <Link
            href={`/bills/${vote.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-(--color-primary) no-underline hover:underline"
          >
            법안 상세 보기 →
          </Link>
        )}
      </div>

      <PartyVoteGrid memberVotes={memberVotes} termId={vote.termId} />

      <MyMemberVoteShare voteId={id} billName={vote.billName} memberVotes={memberVotes} />
    </div>
  );
}
