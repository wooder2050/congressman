"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
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
    <div className="pb-4">
      {/* Vote selector */}
      <div className="px-4 py-2">
        <VoteSelector
          termId={termId}
          selectedVoteId={selectedVoteId}
          onSelect={setSelectedVoteId}
        />
      </div>

      {/* Hemicycle SVG — pinch zoom + drag */}
      <div className="relative px-2">
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={4}
          centerOnInit
          wheel={{ step: 0.1 }}
          pinch={{ step: 5 }}
          panning={{ disabled: false }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute right-4 top-2 z-10 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => zoomIn()}
                  className="flex h-8 w-8 items-center justify-center rounded-md border bg-white text-lg font-bold shadow-sm"
                  aria-label="확대"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => zoomOut()}
                  className="flex h-8 w-8 items-center justify-center rounded-md border bg-white text-lg font-bold shadow-sm"
                  aria-label="축소"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => resetTransform()}
                  className="flex h-8 w-8 items-center justify-center rounded-md border bg-white text-sm shadow-sm"
                  aria-label="원래 크기"
                >
                  ↺
                </button>
              </div>
              <TransformComponent
                wrapperStyle={{ width: "100%" }}
                contentStyle={{ width: "100%" }}
              >
                <HemicycleSVG
                  seats={seats}
                  memberVoteMap={memberVoteMap}
                  isVoteMode={isVoteMode}
                  selectedSeatIndex={selectedSeatIndex}
                  onSeatClick={setSelectedSeatIndex}
                />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
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
