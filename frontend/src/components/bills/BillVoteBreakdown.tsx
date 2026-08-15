import Link from "next/link";
import { getVoteMemberVotes } from "@/lib/api";
import type { VoteMemberResult } from "@/types";

interface PartyStat {
  partyName: string;
  partyColor: string;
  yes: number;
  no: number;
  abstain: number;
  absent: number;
  total: number;
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

/** 정당의 다수 입장(투표자 과반 기준). 과반이 없으면 "분열". */
function partyStance(p: PartyStat): "yes" | "no" | "abstain" | "split" | "absent" {
  const voted = p.yes + p.no + p.abstain;
  if (voted === 0) return "absent";
  const half = voted / 2;
  if (p.yes > half) return "yes";
  if (p.no > half) return "no";
  if (p.abstain > half) return "abstain";
  return "split";
}

const STANCE_LABEL: Record<string, string> = {
  yes: "찬성",
  no: "반대",
  abstain: "기권",
  split: "분열",
  absent: "불참",
};

/**
 * 법안 상세 페이지의 "본회의 표결" 인라인 섹션 (서버 컴포넌트).
 *
 * 국회 원본 사이트에는 이 형태로 조립돼 있지 않은 데이터 — 정당별 찬반 분포와
 * 소속 정당 다수 입장과 다르게 투표한 의원(이탈표) — 를 법안 페이지 안에 직접
 * 노출한다. 색인 대상(v3.1: 본회의 표결 도달 + 표결 레코드 실존) 1,339개 페이지
 * 전부가 이 섹션을 갖게 되어, 어떤 법안 페이지를 열어도 이 사이트에서만 볼 수
 * 있는 집계가 보이도록 하는 것이 목적(AdSense "고유 콘텐츠" 대응 1순위).
 *
 * 데이터가 없으면 null을 반환하며, 호출부는 Suspense로 감싸 본문 렌더링을
 * 붙잡지 않게 한다.
 */
export default async function BillVoteBreakdown({ billId }: { billId: string }) {
  const data = await getVoteMemberVotes(billId);
  if (!data || !data.memberVotes || data.memberVotes.length === 0) return null;

  const partyStats = aggregateByParty(data.memberVotes).filter((p) => p.yes + p.no + p.abstain > 0);
  if (partyStats.length === 0) return null;

  // 이탈표: 소속 정당의 다수 입장과 다른 표를 던진 의원 (기권·불참 제외,
  // 분열·무소속 등 다수 입장이 없는 정당은 판정 불가라 제외)
  const stanceByParty = new Map(partyStats.map((p) => [p.partyName, partyStance(p)]));
  const crossVoters = data.memberVotes.filter((mv) => {
    const stance = stanceByParty.get(mv.partyName);
    if (!stance || stance === "split" || stance === "absent") return false;
    if (mv.result !== "yes" && mv.result !== "no") return false;
    return mv.result !== stance;
  });

  return (
    <div className="space-y-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">본회의 표결 — 정당별 찬반</h2>
        <Link
          href={`/votes/${billId}`}
          className="shrink-0 text-sm font-semibold text-(--color-primary) no-underline hover:underline"
        >
          의원별 전체 보기 →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-(--color-border-primary) text-left text-xs text-(--color-text-tertiary)">
              <th className="py-1.5 pr-2 font-medium">정당</th>
              <th className="px-2 py-1.5 text-right font-medium">찬성</th>
              <th className="px-2 py-1.5 text-right font-medium">반대</th>
              <th className="px-2 py-1.5 text-right font-medium">기권</th>
              <th className="px-2 py-1.5 text-right font-medium">불참</th>
              <th className="py-1.5 pl-2 text-right font-medium">입장</th>
            </tr>
          </thead>
          <tbody>
            {partyStats.map((p) => (
              <tr key={p.partyName} className="border-b border-(--color-border-primary)/50">
                <td className="py-1.5 pr-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: p.partyColor }}
                    />
                    <span className="font-medium text-(--color-text-primary)">{p.partyName}</span>
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right text-(--color-text-secondary) tabular-nums">
                  {p.yes}
                </td>
                <td className="px-2 py-1.5 text-right text-(--color-text-secondary) tabular-nums">
                  {p.no}
                </td>
                <td className="px-2 py-1.5 text-right text-(--color-text-secondary) tabular-nums">
                  {p.abstain}
                </td>
                <td className="px-2 py-1.5 text-right text-(--color-text-tertiary) tabular-nums">
                  {p.absent}
                </td>
                <td className="py-1.5 pl-2 text-right font-semibold text-(--color-text-primary)">
                  {STANCE_LABEL[partyStance(p)]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {crossVoters.length > 0 && (
        <p className="text-sm leading-relaxed text-(--color-text-secondary)">
          소속 정당의 다수 입장과 다르게 투표한 의원(이탈표)은{" "}
          <strong>{crossVoters.length}명</strong>입니다:{" "}
          {crossVoters.slice(0, 5).map((mv, i) => (
            <span key={mv.memberId}>
              {i > 0 && ", "}
              <Link
                href={`/members/${mv.memberId}`}
                className="font-medium text-(--color-primary) no-underline hover:underline"
              >
                {mv.memberName}
              </Link>
              ({mv.result === "yes" ? "찬성" : "반대"})
            </span>
          ))}
          {crossVoters.length > 5 && ` 외 ${crossVoters.length - 5}명`}
        </p>
      )}

      <p className="text-xs text-(--color-text-tertiary)">
        정당 입장은 투표 참여 의원의 과반 기준 추정치이며 공식 당론과 다를 수 있습니다 ·{" "}
        <Link href="/glossary/당론" className="underline hover:text-(--color-text-secondary)">
          당론
        </Link>
        {" · "}
        <Link href="/glossary/기권" className="underline hover:text-(--color-text-secondary)">
          기권이 결과에 미치는 영향
        </Link>
      </p>
    </div>
  );
}
