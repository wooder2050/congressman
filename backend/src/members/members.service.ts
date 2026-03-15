import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const TTL_DAY = 60 * 60 * 24; // 24h
const TTL_HOUR = 60 * 60; // 1h

/** BigInt → Number 안전 변환 (MAX_SAFE_INTEGER 초과 시 0 반환 + 경고) */
function safeBigIntToNumber(value: bigint): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(-Number.MAX_SAFE_INTEGER)) {
    console.warn(`[MembersService] BigInt overflow: ${value}`);
    return 0;
  }
  return Number(value);
}

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findByTerm(termId: number) {
    const key = `members:term:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const memberTerms = await this.prisma.memberTerm.findMany({
      where: { termId },
      include: { member: true, party: true },
    });

    const result = memberTerms.map((mt) => ({
      id: mt.member.id,
      name: mt.member.name,
      photoUrl: mt.member.photoUrl,
      birthDate: mt.member.birthDate,
      electedCount: mt.member.electedCount,
      term: {
        electedCount: mt.electedCount,
        memberId: mt.memberId,
        termId: mt.termId,
        party: {
          id: mt.party.id,
          name: mt.party.name,
          shortName: mt.party.shortName,
          color: mt.party.color,
        },
        district: mt.district,
        proportional: mt.proportional,
        committees: mt.committees,
        committeeRoles: mt.committeeRoles as Record<string, string>,
      },
    }));

    await this.redis.set(key, result, TTL_DAY);
    return result;
  }

  async findById(id: string) {
    const key = `member:${id}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) return null;

    const result = {
      id: member.id,
      name: member.name,
      photoUrl: member.photoUrl,
      birthDate: member.birthDate,
      electedCount: member.electedCount,
      career: member.career ?? null,
    };

    await this.redis.set(key, result, TTL_DAY);
    return result;
  }

  async findTermsByMemberId(memberId: string) {
    const key = `member:terms:${memberId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const memberTerms = await this.prisma.memberTerm.findMany({
      where: { memberId },
      include: { party: true },
      orderBy: { termId: 'desc' },
    });

    const result = memberTerms.map((mt) => ({
      memberId: mt.memberId,
      termId: mt.termId,
      party: {
        id: mt.party.id,
        name: mt.party.name,
        shortName: mt.party.shortName,
        color: mt.party.color,
      },
      district: mt.district,
      proportional: mt.proportional,
      committees: mt.committees,
      committeeHistory: mt.committeeHistory,
      committeeRoles: mt.committeeRoles as Record<string, string>,
      electedCount: mt.electedCount,
    }));

    await this.redis.set(key, result, TTL_DAY);
    return result;
  }

  async getHistory(memberId: string) {
    const key = `member:history:${memberId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const rows = await this.prisma.$queryRaw<
      {
        termId: number;
        termName: string;
        attendanceRate: number | null;
        billsProposed: bigint;
        billsPassed: bigint;
      }[]
    >`
      SELECT
        mt."termId",
        t.name AS "termName",
        a.rate AS "attendanceRate",
        COALESCE(proposed.cnt, 0)::bigint AS "billsProposed",
        COALESCE(passed.cnt, 0)::bigint AS "billsPassed"
      FROM "MemberTerm" mt
      JOIN "Term" t ON t.id = mt."termId"
      LEFT JOIN "Attendance" a ON a."memberId" = mt."memberId" AND a."termId" = mt."termId"
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt
        FROM "BillProposer" bp
        JOIN "Bill" b ON b.id = bp."billId"
        WHERE bp."memberId" = ${memberId} AND bp.role = 'representative' AND b."termId" = mt."termId"
      ) proposed ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt
        FROM "BillProposer" bp
        JOIN "Bill" b ON b.id = bp."billId"
        WHERE bp."memberId" = ${memberId} AND bp.role = 'representative' AND b."termId" = mt."termId" AND b.status = 'passed'
      ) passed ON true
      WHERE mt."memberId" = ${memberId}
      ORDER BY mt."termId" DESC
    `;

    const result = rows.map((r) => ({
      termId: r.termId,
      termName: r.termName,
      attendanceRate: r.attendanceRate ?? 0,
      billsProposed: Number(r.billsProposed),
      billsPassed: Number(r.billsPassed),
    }));

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async getAssets(memberId: string) {
    const key = `member:assets:${memberId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const assets = await this.prisma.asset.findMany({
      where: { memberId },
      orderBy: [{ year: 'desc' }, { category: 'asc' }],
    });

    // 연도별 그룹핑
    const yearMap = new Map<number, { total: bigint; categories: Map<string, bigint> }>();
    for (const a of assets) {
      if (!yearMap.has(a.year)) {
        yearMap.set(a.year, { total: 0n, categories: new Map() });
      }
      const entry = yearMap.get(a.year)!;
      entry.total += a.amount;
      const prev = entry.categories.get(a.category) ?? 0n;
      entry.categories.set(a.category, prev + a.amount);
    }

    const years = [...yearMap.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([year, data]) => ({
        year,
        total: safeBigIntToNumber(data.total),
        categories: [...data.categories.entries()]
          .sort((a, b) => Number(b[1]) - Number(a[1]))
          .map(([category, amount]) => ({ category, amount: safeBigIntToNumber(amount) })),
      }));

    const details = assets.map((a) => ({
      year: a.year,
      category: a.category,
      item: a.item,
      amount: safeBigIntToNumber(a.amount),
      relation: a.relation,
    }));

    const result = { years, details };
    await this.redis.set(key, result, TTL_DAY);
    return result;
  }

  async getMonthlyAttendance(memberId: string, termId: number) {
    const key = `member:monthly-attendance:${memberId}:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const rows = await this.prisma.$queryRaw<{ month: string; attended: bigint; absent: bigint }[]>`
      SELECT TO_CHAR(v."procDate"::date, 'YYYY-MM') as month,
             COUNT(*) FILTER (WHERE mv.result != 'absent') as attended,
             COUNT(*) FILTER (WHERE mv.result = 'absent') as absent
      FROM "MemberVote" mv
      JOIN "Vote" v ON mv."voteId" = v.id
      WHERE mv."memberId" = ${memberId} AND v."termId" = ${termId}
      GROUP BY month
      ORDER BY month
    `;

    const result = rows.map((r) => ({
      month: r.month,
      attended: Number(r.attended),
      absent: Number(r.absent),
    }));

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async getCommitteeBills(memberId: string, termId: number) {
    const key = `member:committee-bills:${memberId}:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const rows = await this.prisma.$queryRaw<{ committee: string; count: bigint }[]>`
      SELECT b.committee, COUNT(*)::bigint as count
      FROM "BillProposer" bp
      JOIN "Bill" b ON bp."billId" = b.id
      WHERE bp."memberId" = ${memberId} AND bp.role = 'representative' AND b."termId" = ${termId} AND b.committee IS NOT NULL
      GROUP BY b.committee
      ORDER BY count DESC
    `;

    const result = rows.map((r) => ({
      committee: r.committee,
      count: Number(r.count),
    }));

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async getCommitteeActivity(memberId: string, termId: number) {
    const key = `member:committee-activity:${memberId}:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    // 전체 위원회 이력에서 고유 위원회명 추출
    const memberTerm = await this.prisma.memberTerm.findUnique({
      where: { memberId_termId: { memberId, termId } },
      select: { committeeHistory: true, committees: true },
    });
    const history = (memberTerm?.committeeHistory as { name: string }[] | null) ?? [];
    const allCommitteeNames = [...new Set(history.map((h) => h.name))];
    // committeeHistory가 비어있으면 기존 committees 사용 (fallback)
    const committees =
      allCommitteeNames.length > 0 ? allCommitteeNames : (memberTerm?.committees ?? []);
    if (committees.length === 0) return [];

    // 위원회별 표결 참여 통계 + 발의 법안 수를 한 번에 가져오기
    const rows = await this.prisma.$queryRaw<
      {
        committee: string;
        total_votes: bigint;
        yes_count: bigint;
        no_count: bigint;
        abstain_count: bigint;
        absent_count: bigint;
        bill_count: bigint;
      }[]
    >`
      WITH committee_list AS (
        SELECT unnest(${committees}::text[]) AS committee
      ),
      vote_stats AS (
        SELECT
          v.committee,
          COUNT(mv.id) AS total_votes,
          COUNT(CASE WHEN mv.result = 'yes' THEN 1 END) AS yes_count,
          COUNT(CASE WHEN mv.result = 'no' THEN 1 END) AS no_count,
          COUNT(CASE WHEN mv.result = 'abstain' THEN 1 END) AS abstain_count,
          COUNT(CASE WHEN mv.result = 'absent' THEN 1 END) AS absent_count
        FROM "Vote" v
        LEFT JOIN "MemberVote" mv ON mv."voteId" = v.id AND mv."memberId" = ${memberId}
        WHERE v."termId" = ${termId} AND v.committee IN (SELECT committee FROM committee_list)
        GROUP BY v.committee
      ),
      bill_stats AS (
        SELECT b.committee, COUNT(*) AS bill_count
        FROM "BillProposer" bp
        JOIN "Bill" b ON bp."billId" = b.id
        WHERE bp."memberId" = ${memberId} AND b."termId" = ${termId}
          AND bp.role = 'representative'
          AND b.committee IN (SELECT committee FROM committee_list)
        GROUP BY b.committee
      )
      SELECT
        cl.committee,
        COALESCE(vs.total_votes, 0)::bigint AS total_votes,
        COALESCE(vs.yes_count, 0)::bigint AS yes_count,
        COALESCE(vs.no_count, 0)::bigint AS no_count,
        COALESCE(vs.abstain_count, 0)::bigint AS abstain_count,
        COALESCE(vs.absent_count, 0)::bigint AS absent_count,
        COALESCE(bs.bill_count, 0)::bigint AS bill_count
      FROM committee_list cl
      LEFT JOIN vote_stats vs ON vs.committee = cl.committee
      LEFT JOIN bill_stats bs ON bs.committee = cl.committee
      ORDER BY total_votes DESC
    `;

    const result = rows.map((r) => ({
      committee: r.committee,
      totalVotes: safeBigIntToNumber(r.total_votes),
      yes: safeBigIntToNumber(r.yes_count),
      no: safeBigIntToNumber(r.no_count),
      abstain: safeBigIntToNumber(r.abstain_count),
      absent: safeBigIntToNumber(r.absent_count),
      billCount: safeBigIntToNumber(r.bill_count),
    }));

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async findMemberVotes(
    memberId: string,
    params: { termId: number; page: number; limit: number; result?: string; month?: string },
  ) {
    const key = `member:votes:${memberId}:${params.termId}:${params.result ?? ''}:${params.month ?? ''}:${params.page}:${params.limit}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const voteFilter: Record<string, unknown> = { termId: params.termId };
    if (params.month) {
      const [y, m] = params.month.split('-').map(Number);
      const start = `${y}-${String(m).padStart(2, '0')}-01`;
      const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
      voteFilter.procDate = { gte: start, lt: nextMonth };
    }

    const where = {
      memberId,
      vote: voteFilter,
      ...(params.result ? { result: params.result } : {}),
    };

    const [memberVotes, total, summary, monthlyRows] = await Promise.all([
      this.prisma.memberVote.findMany({
        where,
        include: { vote: true },
        orderBy: { vote: { procDate: 'desc' } },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.memberVote.count({ where }),
      this.prisma.memberVote.groupBy({
        by: ['result'],
        where: { memberId, vote: { termId: params.termId } },
        _count: true,
      }),
      this.prisma.$queryRaw<{ month: string; count: bigint }[]>`
        SELECT TO_CHAR(v."procDate"::date, 'YYYY-MM') AS month, COUNT(*)::bigint AS count
        FROM "MemberVote" mv
        JOIN "Vote" v ON v.id = mv."voteId"
        WHERE mv."memberId" = ${memberId} AND v."termId" = ${params.termId}
        GROUP BY month
        ORDER BY month DESC
      `,
    ]);

    const summaryMap: Record<string, number> = { yes: 0, no: 0, abstain: 0, absent: 0 };
    for (const s of summary) {
      summaryMap[s.result] = s._count;
    }

    const result = {
      votes: memberVotes.map((mv) => ({
        voteId: mv.voteId,
        billName: mv.vote.billName,
        billNo: mv.vote.billNo,
        procDate: mv.vote.procDate,
        procResult: mv.vote.procResult,
        resultCode: mv.vote.resultCode,
        memberResult: mv.result,
        committee: mv.vote.committee,
      })),
      summary: {
        yes: summaryMap.yes,
        no: summaryMap.no,
        abstain: summaryMap.abstain,
        absent: summaryMap.absent,
        total: summaryMap.yes + summaryMap.no + summaryMap.abstain + summaryMap.absent,
      },
      total,
      months: monthlyRows.map((r) => ({ month: r.month, count: Number(r.count) })),
    };

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }
}
