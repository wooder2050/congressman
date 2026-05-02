import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const TTL_DAY = 60 * 60 * 24; // 24h
const TTL_6H = 60 * 60 * 6; // 6h
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
      changeReason: a.changeReason || '',
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

  async getActivityHeatmap(memberId: string, termId: number, startDate: string, endDate: string) {
    const key = `member:activity-heatmap:${memberId}:${termId}:${startDate}:${endDate}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const rows = await this.prisma.$queryRaw<
      {
        date: string;
        representative_bills: bigint;
        co_bills: bigint;
        votes: bigint;
      }[]
    >`
      SELECT
        d.date,
        COALESCE(rb.cnt, 0)::bigint AS representative_bills,
        COALESCE(cb.cnt, 0)::bigint AS co_bills,
        COALESCE(vt.cnt, 0)::bigint AS votes
      FROM (
        SELECT DISTINCT date FROM (
          SELECT b."proposedDate" AS date
          FROM "BillProposer" bp
          JOIN "Bill" b ON b.id = bp."billId"
          WHERE bp."memberId" = ${memberId} AND b."termId" = ${termId}
            AND b."proposedDate" >= ${startDate} AND b."proposedDate" <= ${endDate}
          UNION
          SELECT v."procDate" AS date
          FROM "MemberVote" mv
          JOIN "Vote" v ON v.id = mv."voteId"
          WHERE mv."memberId" = ${memberId} AND mv.result != 'absent'
            AND v."termId" = ${termId}
            AND v."procDate" >= ${startDate} AND v."procDate" <= ${endDate}
        ) dates
      ) d
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt
        FROM "BillProposer" bp
        JOIN "Bill" b ON b.id = bp."billId"
        WHERE bp."memberId" = ${memberId} AND bp.role = 'representative'
          AND b."termId" = ${termId} AND b."proposedDate" = d.date
      ) rb ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt
        FROM "BillProposer" bp
        JOIN "Bill" b ON b.id = bp."billId"
        WHERE bp."memberId" = ${memberId} AND bp.role = 'co'
          AND b."termId" = ${termId} AND b."proposedDate" = d.date
      ) cb ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt
        FROM "MemberVote" mv
        JOIN "Vote" v ON v.id = mv."voteId"
        WHERE mv."memberId" = ${memberId} AND mv.result != 'absent'
          AND v."termId" = ${termId} AND v."procDate" = d.date
      ) vt ON true
      ORDER BY d.date
    `;

    const result = rows.map((r) => ({
      date: r.date,
      representativeBills: Number(r.representative_bills),
      coBills: Number(r.co_bills),
      votes: Number(r.votes),
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

  // ====== 의원 성적표 ======

  private getGrade(score: number): string {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }

  async getScorecard(memberId: string, termId: number) {
    const key = `member:scorecard:${memberId}:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    // 의원 기본 정보 확인
    const memberTerm = await this.prisma.memberTerm.findUnique({
      where: { memberId_termId: { memberId, termId } },
      include: { member: true, party: true },
    });
    if (!memberTerm) return null;

    // 전체 의원 수
    const totalMembers = await this.prisma.memberTerm.count({ where: { termId } });

    // 병렬 데이터 조회: 전체 의원 통계 (순위 계산용)
    const [attendanceRows, voteRows, billRows, passRows, recentBills, recentVotes] =
      await Promise.all([
        // (1) 출석률 전체 랭킹
        this.prisma.$queryRaw<{ memberId: string; rate: number }[]>`
          SELECT "memberId", rate
          FROM "Attendance"
          WHERE "termId" = ${termId} AND "totalSessions" > 0
          ORDER BY rate DESC
        `,

        // (2) 표결 참여율 전체 랭킹
        this.prisma.$queryRaw<
          { memberId: string; total: bigint; participated: bigint; rate: number }[]
        >`
          SELECT mv."memberId",
                 COUNT(*)::bigint as total,
                 COUNT(*) FILTER (WHERE mv.result != 'absent')::bigint as participated,
                 CASE WHEN COUNT(*) > 0
                   THEN (COUNT(*) FILTER (WHERE mv.result != 'absent'))::float / COUNT(*) * 100
                   ELSE 0
                 END as rate
          FROM "MemberVote" mv
          JOIN "Vote" v ON v.id = mv."voteId"
          WHERE v."termId" = ${termId}
          GROUP BY mv."memberId"
          ORDER BY rate DESC
        `,

        // (3) 대표발의 건수 전체 랭킹
        this.prisma.$queryRaw<{ memberId: string; cnt: bigint }[]>`
          SELECT bp."memberId", COUNT(*)::bigint as cnt
          FROM "BillProposer" bp
          JOIN "Bill" b ON b.id = bp."billId"
          WHERE bp.role = 'representative' AND b."termId" = ${termId}
          GROUP BY bp."memberId"
          ORDER BY cnt DESC
        `,

        // (4) 법안 통과율 전체 랭킹
        this.prisma.$queryRaw<
          { memberId: string; total_rep: bigint; passed: bigint; rate: number }[]
        >`
          SELECT bp."memberId",
                 COUNT(*)::bigint as total_rep,
                 COUNT(*) FILTER (WHERE b.status = 'passed')::bigint as passed,
                 CASE WHEN COUNT(*) > 0
                   THEN (COUNT(*) FILTER (WHERE b.status = 'passed'))::float / COUNT(*) * 100
                   ELSE 0
                 END as rate
          FROM "BillProposer" bp
          JOIN "Bill" b ON b.id = bp."billId"
          WHERE bp.role = 'representative' AND b."termId" = ${termId}
          GROUP BY bp."memberId"
          ORDER BY rate DESC
        `,

        // (5) 최근 30일 대표발의
        this.prisma.$queryRaw<{ cnt: bigint }[]>`
          SELECT COUNT(*)::bigint as cnt
          FROM "BillProposer" bp
          JOIN "Bill" b ON b.id = bp."billId"
          WHERE bp."memberId" = ${memberId}
            AND bp.role = 'representative'
            AND b."termId" = ${termId}
            AND b."proposedDate" >= (CURRENT_DATE - INTERVAL '30 days')::text
        `,

        // (6) 최근 30일 표결
        this.prisma.$queryRaw<{ total: bigint; attended: bigint }[]>`
          SELECT COUNT(*)::bigint as total,
                 COUNT(*) FILTER (WHERE mv.result != 'absent')::bigint as attended
          FROM "MemberVote" mv
          JOIN "Vote" v ON v.id = mv."voteId"
          WHERE mv."memberId" = ${memberId}
            AND v."termId" = ${termId}
            AND v."procDate" >= (CURRENT_DATE - INTERVAL '30 days')::text
        `,
      ]);

    // === 출석률 점수 ===
    const myAttendance = attendanceRows.find((r) => r.memberId === memberId);
    const attendanceRate = myAttendance?.rate ?? 0;
    const attendanceRank = myAttendance
      ? attendanceRows.findIndex((r) => r.memberId === memberId) + 1
      : totalMembers;
    const attendanceScore = Math.round((attendanceRate / 100) * 30 * 10) / 10;

    // === 표결 참여율 점수 ===
    const myVote = voteRows.find((r) => r.memberId === memberId);
    const voteRate = myVote?.rate ?? 0;
    const voteRank = myVote ? voteRows.findIndex((r) => r.memberId === memberId) + 1 : totalMembers;
    const voteScore = Math.round((voteRate / 100) * 25 * 10) / 10;

    // 표결 상세 (yes/no/abstain/absent)
    let voteYes = 0,
      voteNo = 0,
      voteAbstain = 0,
      voteAbsent = 0;
    if (myVote) {
      const voteDetail = await this.prisma.$queryRaw<{ result: string; cnt: bigint }[]>`
        SELECT mv.result, COUNT(*)::bigint as cnt
        FROM "MemberVote" mv
        JOIN "Vote" v ON v.id = mv."voteId"
        WHERE mv."memberId" = ${memberId} AND v."termId" = ${termId}
        GROUP BY mv.result
      `;
      for (const row of voteDetail) {
        const cnt = Number(row.cnt);
        if (row.result === 'yes') voteYes = cnt;
        else if (row.result === 'no') voteNo = cnt;
        else if (row.result === 'abstain') voteAbstain = cnt;
        else if (row.result === 'absent') voteAbsent = cnt;
      }
    }

    // === 법안 발의 점수 (백분위 기반) ===
    const myBill = billRows.find((r) => r.memberId === memberId);
    const repCount = myBill ? Number(myBill.cnt) : 0;
    const billRank = myBill ? billRows.findIndex((r) => r.memberId === memberId) + 1 : totalMembers;
    // 백분위: 나보다 적게 발의한 의원 비율
    const billPercentile =
      billRows.length > 1
        ? (billRows.filter((r) => Number(r.cnt) < repCount).length / (totalMembers - 1)) * 100
        : 0;
    const billScore = Math.round((billPercentile / 100) * 25 * 10) / 10;

    // 공동발의 건수
    const coCountResult = await this.prisma.billProposer.count({
      where: {
        memberId,
        role: 'co',
        bill: { termId },
      },
    });

    // === 법안 통과율 점수 (백분위 기반) ===
    const myPass = passRows.find((r) => r.memberId === memberId);
    const passedCount = myPass ? Number(myPass.passed) : 0;
    const passRate = myPass?.rate ?? 0;
    const passRank = myPass ? passRows.findIndex((r) => r.memberId === memberId) + 1 : totalMembers;
    const passPercentile =
      passRows.length > 1
        ? (passRows.filter((r) => r.rate < passRate).length / (passRows.length - 1)) * 100
        : 0;
    const passScore = Math.round((passPercentile / 100) * 20 * 10) / 10;

    // === 종합 점수 ===
    const totalScore = Math.round((attendanceScore + voteScore + billScore + passScore) * 10) / 10;
    const grade = this.getGrade(totalScore);

    // === 전체 종합 순위 계산 ===
    // 모든 의원의 totalScore를 계산하여 순위 매기기
    const allScores: { memberId: string; score: number }[] = [];
    const memberIds = [
      ...new Set([
        ...attendanceRows.map((r) => r.memberId),
        ...voteRows.map((r) => r.memberId),
        ...billRows.map((r) => r.memberId),
      ]),
    ];

    for (const mid of memberIds) {
      const att = attendanceRows.find((r) => r.memberId === mid);
      const attScore = att ? Math.round((att.rate / 100) * 30 * 10) / 10 : 0;

      const vt = voteRows.find((r) => r.memberId === mid);
      const vtScore = vt ? Math.round((vt.rate / 100) * 25 * 10) / 10 : 0;

      const bl = billRows.find((r) => r.memberId === mid);
      const blCount = bl ? Number(bl.cnt) : 0;
      const blPct =
        billRows.length > 1
          ? (billRows.filter((r) => Number(r.cnt) < blCount).length / (totalMembers - 1)) * 100
          : 0;
      const blScore = Math.round((blPct / 100) * 25 * 10) / 10;

      const ps = passRows.find((r) => r.memberId === mid);
      const psRate = ps?.rate ?? 0;
      const psPct =
        passRows.length > 1
          ? (passRows.filter((r) => r.rate < psRate).length / (passRows.length - 1)) * 100
          : 0;
      const psScore = Math.round((psPct / 100) * 20 * 10) / 10;

      allScores.push({ memberId: mid, score: attScore + vtScore + blScore + psScore });
    }

    allScores.sort((a, b) => b.score - a.score);
    const overallRank = allScores.findIndex((s) => s.memberId === memberId) + 1 || totalMembers;

    // === 최근 30일 활동 ===
    const recent30Bills = Number(recentBills[0]?.cnt ?? 0n);
    const recent30VotesTotal = Number(recentVotes[0]?.total ?? 0n);
    const recent30VotesAttended = Number(recentVotes[0]?.attended ?? 0n);

    const result = {
      memberId,
      name: memberTerm.member.name,
      photoUrl: memberTerm.member.photoUrl,
      party: {
        id: memberTerm.party.id,
        name: memberTerm.party.name,
        shortName: memberTerm.party.shortName,
        color: memberTerm.party.color,
      },
      district: memberTerm.district,
      termId,

      attendance: {
        rate: Math.round(attendanceRate * 10) / 10,
        score: attendanceScore,
        rank: attendanceRank,
        totalMembers,
      },
      voteParticipation: {
        rate: Math.round(voteRate * 10) / 10,
        score: voteScore,
        rank: voteRank,
        totalMembers,
        yes: voteYes,
        no: voteNo,
        abstain: voteAbstain,
        absent: voteAbsent,
      },
      billProposal: {
        representativeCount: repCount,
        coCount: coCountResult,
        score: billScore,
        rank: billRank,
        totalMembers,
      },
      billPassRate: {
        passedCount,
        totalRepresentative: repCount,
        rate: Math.round(passRate * 10) / 10,
        score: passScore,
        rank: passRank,
        totalMembers,
      },

      totalScore,
      grade,
      overallRank,

      recentActivity: {
        last30Days: {
          bills: recent30Bills,
          votes: recent30VotesTotal,
          votesAttended: recent30VotesAttended,
        },
      },
    };

    await this.redis.set(key, result, TTL_6H);
    return result;
  }

  // ====== 최근 N일 활동 요약 ======

  async getRecentActivity(memberId: string, termId: number, days: number = 7) {
    const key = `member:recent-activity:${memberId}:${termId}:${days}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const [billStats, voteStats, recentBills] = await Promise.all([
      // 최근 N일 대표발의 건수
      this.prisma.$queryRaw<{ cnt: bigint }[]>`
        SELECT COUNT(*)::bigint AS cnt
        FROM "BillProposer" bp
        JOIN "Bill" b ON b.id = bp."billId"
        WHERE bp."memberId" = ${memberId}
          AND bp.role = 'representative'
          AND b."termId" = ${termId}
          AND b."proposedDate" >= (CURRENT_DATE - ${days}::int * INTERVAL '1 day')::date::text
      `,
      // 최근 N일 표결 참여/불참
      this.prisma.$queryRaw<{ participated: bigint; missed: bigint }[]>`
        SELECT
          COUNT(*) FILTER (WHERE mv.result != 'absent')::bigint AS participated,
          COUNT(*) FILTER (WHERE mv.result = 'absent')::bigint AS missed
        FROM "MemberVote" mv
        JOIN "Vote" v ON v.id = mv."voteId"
        WHERE mv."memberId" = ${memberId}
          AND v."termId" = ${termId}
          AND v."procDate" >= (CURRENT_DATE - ${days}::int * INTERVAL '1 day')::date::text
      `,
      // 최근 대표발의 법안 3건 제목
      this.prisma.bill.findMany({
        where: {
          termId,
          proposers: { some: { memberId, role: 'representative' } },
          proposedDate: {
            gte: new Date(Date.now() - days * 86400000).toISOString().slice(0, 10),
          },
        },
        orderBy: { proposedDate: 'desc' },
        take: 3,
        select: { id: true, title: true, proposedDate: true },
      }),
    ]);

    const result = {
      memberId,
      termId,
      days,
      billsProposed: Number(billStats[0]?.cnt ?? 0n),
      votesParticipated: Number(voteStats[0]?.participated ?? 0n),
      votesMissed: Number(voteStats[0]?.missed ?? 0n),
      recentBills: recentBills.map((b) => ({
        id: b.id,
        title: b.title,
        proposedDate: b.proposedDate,
      })),
    };

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  // ====== 지역구 의원 활동 리포트 (통합 API) ======

  async getDistrictReport(memberId: string, termId: number) {
    // 개별 쿼리가 각자 Redis 캐시를 사용하므로 래퍼 캐시 없이 병렬 실행
    const [scorecard, billsData, votesData] = await Promise.all([
      this.getScorecard(memberId, termId), // 6시간 캐시
      this.prisma.bill.findMany({
        where: {
          termId,
          proposers: { some: { memberId, role: 'representative' } },
        },
        orderBy: { proposedDate: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          proposerName: true,
          status: true,
          proposedDate: true,
          committee: true,
          simpleSummary: true,
          topic: true,
        },
      }),
      this.findMemberVotes(memberId, { termId, page: 1, limit: 5 }),
    ]);

    if (!scorecard) return null;

    return {
      scorecard,
      recentBills: billsData,
      recentVotes: votesData,
    };
  }

  // ====== 전체 의원 성적표 랭킹 ======

  async getScorecardRanking(termId: number) {
    const key = `scorecard:ranking:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const totalMembers = await this.prisma.memberTerm.count({ where: { termId } });

    // 전체 의원 기본 정보
    const allMemberTerms = await this.prisma.memberTerm.findMany({
      where: { termId },
      include: { member: true, party: true },
    });

    // 전체 통계 병렬 조회
    const [attendanceRows, voteRows, billRows, passRows] = await Promise.all([
      this.prisma.$queryRaw<{ memberId: string; rate: number }[]>`
        SELECT "memberId", rate
        FROM "Attendance"
        WHERE "termId" = ${termId} AND "totalSessions" > 0
        ORDER BY rate DESC
      `,
      this.prisma.$queryRaw<
        { memberId: string; total: bigint; participated: bigint; rate: number }[]
      >`
        SELECT mv."memberId",
               COUNT(*)::bigint as total,
               COUNT(*) FILTER (WHERE mv.result != 'absent')::bigint as participated,
               CASE WHEN COUNT(*) > 0
                 THEN (COUNT(*) FILTER (WHERE mv.result != 'absent'))::float / COUNT(*) * 100
                 ELSE 0
               END as rate
        FROM "MemberVote" mv
        JOIN "Vote" v ON v.id = mv."voteId"
        WHERE v."termId" = ${termId}
        GROUP BY mv."memberId"
        ORDER BY rate DESC
      `,
      this.prisma.$queryRaw<{ memberId: string; cnt: bigint }[]>`
        SELECT bp."memberId", COUNT(*)::bigint as cnt
        FROM "BillProposer" bp
        JOIN "Bill" b ON b.id = bp."billId"
        WHERE bp.role = 'representative' AND b."termId" = ${termId}
        GROUP BY bp."memberId"
        ORDER BY cnt DESC
      `,
      this.prisma.$queryRaw<
        { memberId: string; total_rep: bigint; passed: bigint; rate: number }[]
      >`
        SELECT bp."memberId",
               COUNT(*)::bigint as total_rep,
               COUNT(*) FILTER (WHERE b.status = 'passed')::bigint as passed,
               CASE WHEN COUNT(*) > 0
                 THEN (COUNT(*) FILTER (WHERE b.status = 'passed'))::float / COUNT(*) * 100
                 ELSE 0
               END as rate
        FROM "BillProposer" bp
        JOIN "Bill" b ON b.id = bp."billId"
        WHERE bp.role = 'representative' AND b."termId" = ${termId}
        GROUP BY bp."memberId"
        ORDER BY rate DESC
      `,
    ]);

    // 각 의원별 점수 계산
    const rankings = allMemberTerms.map((mt) => {
      const att = attendanceRows.find((r) => r.memberId === mt.memberId);
      const attRate = att?.rate ?? 0;
      const attScore = Math.round((attRate / 100) * 30 * 10) / 10;

      const vt = voteRows.find((r) => r.memberId === mt.memberId);
      const vtRate = vt?.rate ?? 0;
      const vtScore = Math.round((vtRate / 100) * 25 * 10) / 10;

      const bl = billRows.find((r) => r.memberId === mt.memberId);
      const repCount = bl ? Number(bl.cnt) : 0;
      const blPct =
        billRows.length > 1
          ? (billRows.filter((r) => Number(r.cnt) < repCount).length / (totalMembers - 1)) * 100
          : 0;
      const blScore = Math.round((blPct / 100) * 25 * 10) / 10;

      const ps = passRows.find((r) => r.memberId === mt.memberId);
      const psRate = ps?.rate ?? 0;
      const psPct =
        passRows.length > 1
          ? (passRows.filter((r) => r.rate < psRate).length / (passRows.length - 1)) * 100
          : 0;
      const psScore = Math.round((psPct / 100) * 20 * 10) / 10;

      const total = Math.round((attScore + vtScore + blScore + psScore) * 10) / 10;

      return {
        memberId: mt.memberId,
        name: mt.member.name,
        photoUrl: mt.member.photoUrl,
        party: {
          id: mt.party.id,
          name: mt.party.name,
          shortName: mt.party.shortName,
          color: mt.party.color,
        },
        district: mt.district,
        totalScore: total,
        grade: this.getGrade(total),
        attendance: { rate: Math.round(attRate * 10) / 10, score: attScore },
        voteParticipation: { rate: Math.round(vtRate * 10) / 10, score: vtScore },
        billProposal: { representativeCount: repCount, score: blScore },
        billPassRate: { rate: Math.round(psRate * 10) / 10, score: psScore },
      };
    });

    rankings.sort((a, b) => b.totalScore - a.totalScore);

    const result = { rankings };
    await this.redis.set(key, result, TTL_6H);
    return result;
  }
}
