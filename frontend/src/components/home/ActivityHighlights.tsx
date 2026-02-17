"use client";

import CloseVotes from "./CloseVotes";
import TopProposers from "./TopProposers";
import RejectedVotes from "./RejectedVotes";

interface ActivityHighlightsProps {
  termId: number;
}

export default function ActivityHighlights({ termId }: ActivityHighlightsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <TopProposers termId={termId} />
      <div className="space-y-6">
        <CloseVotes termId={termId} />
        <RejectedVotes termId={termId} />
      </div>
    </div>
  );
}
