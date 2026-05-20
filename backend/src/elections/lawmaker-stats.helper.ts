import { PrismaService } from '../prisma/prisma.service';

/** 후보자 상세 페이지의 의정활동 요약 — 22대 국회 기준 */
interface LawmakerSummary {
  memberId: string;
  name: string;
  photoUrl: string | null;
  district: string;
  attendanceRate: number;
  voteParticipationRate: number;
  billCount: number;
  passedCount: number;
  passRate: number;
  totalAsset: number | null;
  assetYear: number | null;
  /** 22대 활동 기록이 전혀 없으면 false — 요약 카드를 숨길지 판단용 */
  hasActivity: boolean;
}

const TERM_ID = 22;

/**
 * 전·현직 국회의원 후보자(memberIdRef) 1명의 22대 의정활동 요약을 계산한다.
 * getLawmakerCandidates의 배치 통계 로직을 단건용으로 재사용.
 * 의원이 존재하지 않으면 null.
 */
export async function getLawmakerSummary(
  prisma: PrismaService,
  memberId: string,
): Promise<LawmakerSummary | null> {
  const [member, term, attendance, billStats, voteStats, assetStats] = await Promise.all([
    prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, name: true, photoUrl: true },
    }),
    prisma.memberTerm.findFirst({
      where: { memberId },
      orderBy: { termId: 'desc' },
    }),
    prisma.attendance.findFirst({
      where: { memberId, termId: TERM_ID },
    }),
    prisma.$queryRaw<{ billCount: bigint; passedCount: bigint }[]>`
      SELECT COUNT(*)::bigint AS "billCount",
        COUNT(*) FILTER (WHERE b.status = 'passed')::bigint AS "passedCount"
      FROM "BillProposer" bp
      JOIN "Bill" b ON b.id = bp."billId"
      WHERE bp."memberId" = ${memberId}
        AND bp.role = 'representative'
        AND b."termId" = ${TERM_ID}
    `,
    prisma.$queryRaw<{ totalVotes: bigint; attendedVotes: bigint }[]>`
      SELECT COUNT(*)::bigint AS "totalVotes",
        COUNT(*) FILTER (WHERE mv.result IN ('yes', 'no', 'abstain'))::bigint AS "attendedVotes"
      FROM "MemberVote" mv
      JOIN "Vote" v ON v.id = mv."voteId"
      WHERE mv."memberId" = ${memberId}
        AND v."termId" = ${TERM_ID}
    `,
    prisma.$queryRaw<{ year: number; total: bigint }[]>`
      SELECT a.year, SUM(a.amount)::bigint AS total
      FROM "Asset" a
      WHERE a."memberId" = ${memberId}
        AND a.year = (SELECT MAX(a2.year) FROM "Asset" a2 WHERE a2."memberId" = ${memberId})
      GROUP BY a.year
    `,
  ]);

  if (!member) return null;

  const attended = attendance?.attended ?? 0;
  const absent = attendance?.absent ?? 0;
  const attendanceRate = Math.round((attended / Math.max(attended + absent, 1)) * 100);

  const billCount = Number(billStats[0]?.billCount ?? 0n);
  const passedCount = Number(billStats[0]?.passedCount ?? 0n);
  const passRate = billCount > 0 ? Math.round((passedCount / billCount) * 100) : 0;

  const totalVotes = Number(voteStats[0]?.totalVotes ?? 0n);
  const attendedVotes = Number(voteStats[0]?.attendedVotes ?? 0n);
  const voteParticipationRate = totalVotes > 0 ? Math.round((attendedVotes / totalVotes) * 100) : 0;

  const asset = assetStats[0];

  return {
    memberId: member.id,
    name: member.name,
    photoUrl: member.photoUrl,
    district: term?.district || '',
    attendanceRate,
    voteParticipationRate,
    billCount,
    passedCount,
    passRate,
    totalAsset: asset ? Number(asset.total) : null,
    assetYear: asset?.year ?? null,
    hasActivity: attended + absent > 0 || billCount > 0 || totalVotes > 0,
  };
}
