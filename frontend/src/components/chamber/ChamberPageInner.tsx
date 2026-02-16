"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCongressSuspenseQuery, useCongressQuery } from "@/hooks/useCongressQuery";
import { getMembers, getVoteMemberVotes } from "@/lib/api";
import { generateHemicycleLayout } from "@/lib/chamber/hemicycle";
import { assignSeatsToMembers } from "@/lib/chamber/seat-assignment";
import HemicycleSVG from "./HemicycleSVG";
import VoteSelector from "./VoteSelector";
import SeatPopup from "./SeatPopup";
import ChamberLegend from "./ChamberLegend";

interface ChamberPageInnerProps {
  termId: number;
  initialVoteId?: string;
}

export default function ChamberPageInner({ termId, initialVoteId }: ChamberPageInnerProps) {
  const { data: members } = useCongressSuspenseQuery(getMembers, termId);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedSeatIndex, setSelectedSeatIndex] = useState<number | null>(null);
  const [selectedVoteId, setSelectedVoteId] = useState<string | null>(initialVoteId ?? null);

  const seats = useMemo(() => {
    const layout = generateHemicycleLayout();
    return assignSeatsToMembers(layout, members);
  }, [members]);

  const { data: voteData } = useCongressQuery(getVoteMemberVotes, selectedVoteId ?? undefined, {
    enabled: !!selectedVoteId,
  });

  const memberVoteMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!voteData?.memberVotes) return map;
    for (const mv of voteData.memberVotes) {
      map.set(mv.memberId, mv.result);
    }
    return map;
  }, [voteData]);

  const isVoteMode = !!selectedVoteId;
  const selectedSeat =
    selectedSeatIndex !== null ? seats.find((s) => s.index === selectedSeatIndex) : undefined;

  // Disable min-height on main for full viewport layout
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const prevMinHeight = main.style.minHeight;
    const prevBodyPb = document.body.style.paddingBottom;
    main.style.minHeight = "0";
    document.body.style.paddingBottom = "0";
    return () => {
      main.style.minHeight = prevMinHeight;
      document.body.style.paddingBottom = prevBodyPb;
    };
  }, []);

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedVoteId) {
      params.set("voteId", selectedVoteId);
    } else {
      params.delete("voteId");
    }
    const newUrl = `/chamber?${params.toString()}`;
    const currentUrl = `/chamber?${searchParams.toString()}`;
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedVoteId, searchParams, router]);

  return (
    <div className="flex h-[calc(100dvh-13rem)] flex-col overflow-hidden">
      {/* Vote selector */}
      <div className="px-4 py-3">
        <VoteSelector
          termId={termId}
          selectedVoteId={selectedVoteId}
          onSelect={setSelectedVoteId}
        />
      </div>

      {/* Hemicycle SVG */}
      <div className="flex flex-1 items-center justify-center px-2">
        <HemicycleSVG
          seats={seats}
          memberVoteMap={memberVoteMap}
          isVoteMode={isVoteMode}
          selectedSeatIndex={selectedSeatIndex}
          onSeatClick={setSelectedSeatIndex}
        />
      </div>

      {/* Legend */}
      <ChamberLegend seats={seats} isVoteMode={isVoteMode} voteData={voteData} />

      {/* Seat popup */}
      {selectedSeat && selectedSeat.memberId && (
        <SeatPopup
          seat={selectedSeat}
          voteResult={isVoteMode ? memberVoteMap.get(selectedSeat.memberId) : undefined}
          onClose={() => setSelectedSeatIndex(null)}
        />
      )}
    </div>
  );
}
