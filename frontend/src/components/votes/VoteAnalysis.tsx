import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Vote, VoteMemberResult } from "@/types";

interface VoteAnalysisProps {
  vote: Vote;
  memberVotes: VoteMemberResult[];
}

interface PartyStat {
  partyName: string;
  partyColor: string;
  yes: number;
  no: number;
  abstain: number;
  absent: number;
  total: number;
}

function describeResult(vote: Vote): string {
  switch (vote.resultCode) {
    case "passed":
      return "가결";
    case "amended":
      return "수정 가결";
    case "rejected":
      return "부결";
    case "discarded":
      return "폐기";
    default:
      return "처리";
  }
}

function aggregateByParty(memberVotes: VoteMemberResult[]): PartyStat[] {
  const map = new Map<string, PartyStat>();
  for (const mv of memberVotes) {
    const cur = map.get(mv.partyName) ?? {
      partyName: mv.partyName,
      partyColor: mv.partyColor,
      yes: 0,
      no: 0,
      abstain: 0,
      absent: 0,
      total: 0,
    };
    if (mv.result === "yes") cur.yes++;
    else if (mv.result === "no") cur.no++;
    else if (mv.result === "abstain") cur.abstain++;
    else if (mv.result === "absent") cur.absent++;
    cur.total++;
    map.set(mv.partyName, cur);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

function partyStance(p: PartyStat): "찬성" | "반대" | "기권" | "분열" | "불참" {
  if (p.total === 0) return "불참";
  const voted = p.yes + p.no + p.abstain;
  if (voted === 0) return "불참";
  const half = voted / 2;
  if (p.yes > half) return "찬성";
  if (p.no > half) return "반대";
  if (p.abstain > half) return "기권";
  return "분열";
}

/**
 * 표결 상세 페이지 상단에 노출되는 자연어 분석 단락.
 *
 * 표·차트만 있던 표결 페이지에 정당별 찬반 구도·과반 여부를 텍스트로 요약해
 * 페이지 콘텐츠 깊이를 보강한다. AdSense "가치 있는 콘텐츠" 기준 대응.
 */
export default function VoteAnalysis({ vote, memberVotes }: VoteAnalysisProps) {
  const partyStats = aggregateByParty(memberVotes);
  if (partyStats.length === 0) return null;

  const resultText = describeResult(vote);
  const participationRate =
    vote.memberTotal > 0 ? Math.round((vote.voteTotal / vote.memberTotal) * 100) : 0;
  const yesRate = vote.voteTotal > 0 ? Math.round((vote.yesCount / vote.voteTotal) * 100) : 0;

  // 상위 2개 정당의 표결 성향
  const topParties = partyStats.slice(0, 3);
  const stanceTexts = topParties.map((p) => {
    const stance = partyStance(p);
    if (stance === "분열") {
      return `${p.partyName}은 찬성 ${p.yes}·반대 ${p.no}·기권 ${p.abstain}으로 의견이 갈렸습니다`;
    }
    if (stance === "찬성") {
      return `${p.partyName}은 ${p.yes}명이 찬성하며 찬성 입장을 보였습니다`;
    }
    if (stance === "반대") {
      return `${p.partyName}은 ${p.no}명이 반대하며 반대 입장을 보였습니다`;
    }
    if (stance === "기권") {
      return `${p.partyName}은 다수가 기권했습니다`;
    }
    return `${p.partyName}은 대부분 불참했습니다`;
  });

  return (
    <section className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <h2 className="mb-3 text-base font-bold text-(--color-text-primary)">표결 분석</h2>
      <p className="text-sm leading-relaxed text-(--color-text-secondary)">
        {formatDate(vote.procDate)} 본회의에서 진행된 <strong>{vote.billName}</strong> 표결은 재적{" "}
        {vote.memberTotal}명 중 {vote.voteTotal}명({participationRate}%)이 참여한 가운데 찬성{" "}
        {vote.yesCount}·반대 {vote.noCount}·기권 {vote.abstainCount}로 <strong>{resultText}</strong>
        됐습니다. 참여 의원 기준 찬성률은 {yesRate}%입니다.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
        정당별로는 {stanceTexts.join(", ")}.
        {partyStats.length > 3 &&
          ` 그 밖의 ${partyStats.length - 3}개 정당·무소속 의원도 표결에 참여했습니다.`}
      </p>
      {vote.hasBill && (
        <p className="mt-2 text-xs text-(--color-text-tertiary)">
          이 표결의 대상 법안 본문과 AI 요약은{" "}
          <Link href={`/bills/${vote.id}`} className="text-(--color-primary) hover:underline">
            법안 상세 페이지
          </Link>
          에서 확인할 수 있습니다.
        </p>
      )}
    </section>
  );
}
