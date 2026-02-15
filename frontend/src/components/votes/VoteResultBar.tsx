"use client";

interface VoteResultBarProps {
  yesCount: number;
  noCount: number;
  abstainCount: number;
  voteTotal: number;
}

export default function VoteResultBar({
  yesCount,
  noCount,
  abstainCount,
  voteTotal,
}: VoteResultBarProps) {
  if (voteTotal === 0) return null;

  const yesPercent = (yesCount / voteTotal) * 100;
  const noPercent = (noCount / voteTotal) * 100;
  const abstainPercent = (abstainCount / voteTotal) * 100;

  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-(--color-bg-tertiary)">
      <div
        className="bg-green-500"
        style={{ width: `${yesPercent}%` }}
        title={`찬성 ${yesCount}`}
      />
      <div className="bg-red-500" style={{ width: `${noPercent}%` }} title={`반대 ${noCount}`} />
      <div
        className="bg-gray-400"
        style={{ width: `${abstainPercent}%` }}
        title={`기권 ${abstainCount}`}
      />
    </div>
  );
}
