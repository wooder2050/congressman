import type { MemberWithTerm } from "@/types";
import type { SeatPosition } from "./hemicycle";

// Party ordering: left (opposition) → right (ruling)
const PARTY_ORDER: string[] = [
  "progressive",
  "basic-income",
  "social-democratic",
  "democratic",
  "rebuilding",
  "new-future",
  "reform",
  "ppp",
  "independent",
];

export interface AssignedSeat extends SeatPosition {
  memberId: string | null;
  memberName: string;
  partyId: string;
  partyColor: string;
  partyName: string;
  district: string;
  proportional: boolean;
  photoUrl: string;
}

export function assignSeatsToMembers(
  seats: SeatPosition[],
  members: MemberWithTerm[],
): AssignedSeat[] {
  // Sort members by party order (left→right), then by name within party
  const sortedMembers = [...members].sort((a, b) => {
    const aIdx = PARTY_ORDER.indexOf(a.term.party.id);
    const bIdx = PARTY_ORDER.indexOf(b.term.party.id);
    const aOrder = aIdx === -1 ? PARTY_ORDER.length : aIdx;
    const bOrder = bIdx === -1 ? PARTY_ORDER.length : bIdx;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name, "ko");
  });

  // Sort seats by angle descending (leftmost=PI first → rightmost=0 last)
  const sortedSeats = [...seats].sort((a, b) => b.angle - a.angle);

  return sortedSeats.map((seat, i) => {
    const member = sortedMembers[i];
    return {
      ...seat,
      memberId: member?.id ?? null,
      memberName: member?.name ?? "",
      partyId: member?.term.party.id ?? "",
      partyColor: member?.term.party.color ?? "#D1D5DB",
      partyName: member?.term.party.shortName ?? "",
      district: member?.term.district ?? "",
      proportional: member?.term.proportional ?? false,
      photoUrl: member?.photoUrl ?? "",
    };
  });
}
