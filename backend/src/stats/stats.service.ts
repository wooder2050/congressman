import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const TTL_6H = 60 * 60 * 6;

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getPropertyStats() {
    const TERM_ID = 22;
    // 공개연도 기준. 2026 공개분 = 2025-12-31 기준 재산.
    const ASSET_YEAR = 2026;

    // 캐시 키에 연도를 포함해야 ASSET_YEAR 변경 시 구 캐시가 자동 무효화된다.
    const key = `stats:property:${TERM_ID}:${ASSET_YEAR}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const [members, assets] = await Promise.all([
      this.prisma.$queryRaw<
        {
          memberId: string;
          name: string;
          photoUrl: string;
          party: string;
          partyColor: string;
          district: string;
          proportional: boolean;
          committees: string[];
          electedCount: number;
        }[]
      >`
        SELECT
          m.id AS "memberId",
          m.name,
          m."photoUrl",
          p."shortName" AS party,
          p.color AS "partyColor",
          mt.district,
          mt.proportional,
          mt.committees,
          mt."electedCount"
        FROM "MemberTerm" mt
        JOIN "Member" m ON mt."memberId" = m.id
        JOIN "Party" p ON mt."partyId" = p.id
        WHERE mt."termId" = ${TERM_ID} AND mt."isActive" = true
        ORDER BY m.name
      `,
      this.prisma.$queryRaw<
        {
          memberId: string;
          category: string;
          item: string;
          amount: bigint;
          relation: string;
        }[]
      >`
        SELECT
          a."memberId",
          a.category,
          a.item,
          a.amount,
          a.relation
        FROM "Asset" a
        JOIN "MemberTerm" mt ON a."memberId" = mt."memberId" AND mt."termId" = ${TERM_ID}
          AND mt."isActive" = true
        WHERE a.year = ${ASSET_YEAR}
          AND a.category IN ('건물', '토지')
          AND a.relation IN ('본인', '배우자')
          AND a.item NOT LIKE '%전세(임차)권%'
      `,
    ]);

    const result = {
      members,
      assets: assets.map((a) => ({
        memberId: a.memberId,
        category: a.category,
        item: a.item,
        amount: Number(a.amount),
        relation: a.relation,
      })),
    };

    await this.redis.set(key, result, TTL_6H);
    return result;
  }

  async getAttendanceRanking(termId: number, limit = 5) {
    const key = `stats:attendance-ranking:${termId}:${limit}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const [topRaw, bottomRaw] = await Promise.all([
      this.prisma.$queryRaw<
        {
          memberId: string;
          name: string;
          photoUrl: string;
          rate: number;
          attended: number;
          totalSessions: number;
        }[]
      >`
        SELECT a."memberId", m.name, m."photoUrl",
               a.rate, a.attended, a."totalSessions"
        FROM "Attendance" a
        JOIN "Member" m ON a."memberId" = m.id
        JOIN "MemberTerm" mt ON mt."memberId" = a."memberId" AND mt."termId" = ${termId}
          AND mt."isActive" = true
        WHERE a."termId" = ${termId} AND a."totalSessions" > 0
        ORDER BY a.rate DESC, a.attended DESC
        LIMIT ${limit}
      `,
      this.prisma.$queryRaw<
        {
          memberId: string;
          name: string;
          photoUrl: string;
          rate: number;
          attended: number;
          totalSessions: number;
        }[]
      >`
        SELECT a."memberId", m.name, m."photoUrl",
               a.rate, a.attended, a."totalSessions"
        FROM "Attendance" a
        JOIN "Member" m ON a."memberId" = m.id
        JOIN "MemberTerm" mt ON mt."memberId" = a."memberId" AND mt."termId" = ${termId}
          AND mt."isActive" = true
        WHERE a."termId" = ${termId} AND a."totalSessions" > 0
        ORDER BY a.rate ASC, a.absent DESC
        LIMIT ${limit}
      `,
    ]);

    const allIds = [...topRaw, ...bottomRaw].map((r) => r.memberId);
    const memberTerms =
      allIds.length > 0
        ? await this.prisma.memberTerm.findMany({
            where: { memberId: { in: allIds }, termId },
            include: { party: true },
          })
        : [];
    const partyMap = new Map(
      memberTerms.map((mt) => [
        mt.memberId,
        {
          id: mt.party.id,
          name: mt.party.name,
          shortName: mt.party.shortName,
          color: mt.party.color,
        },
      ]),
    );

    const defaultParty = {
      id: 'independent',
      name: '무소속',
      shortName: '무소속',
      color: '#999999',
    };

    const mapItem = (r: (typeof topRaw)[0]) => ({
      memberId: r.memberId,
      name: r.name,
      photoUrl: r.photoUrl,
      rate: r.rate,
      attended: r.attended,
      totalSessions: r.totalSessions,
      party: partyMap.get(r.memberId) ?? defaultParty,
    });

    const result = {
      top: topRaw.map(mapItem),
      bottom: bottomRaw.map(mapItem),
    };

    await this.redis.set(key, result, TTL_6H);
    return result;
  }

  async getHomeStats(termId: number) {
    const key = `stats:home:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const [
      memberCount,
      billCount,
      voteCount,
      avgAttendance,
      recentVotesRaw,
      recentBillsRaw,
      closeVotesRaw,
      topProposersRaw,
      rejectedVotesRaw,
    ] = await Promise.all([
      this.prisma.memberTerm.count({ where: { termId, isActive: true } }),
      this.prisma.bill.count({ where: { termId } }),
      this.prisma.vote.count({ where: { termId } }),
      this.prisma.$queryRaw<{ avg: number | null }[]>`
        SELECT AVG(a.rate)::float AS avg
        FROM "Attendance" a
        JOIN "MemberTerm" mt ON mt."memberId" = a."memberId" AND mt."termId" = ${termId}
          AND mt."isActive" = true
        WHERE a."termId" = ${termId}
      `,
      this.prisma.vote.findMany({
        where: { termId },
        orderBy: { procDate: 'desc' },
        take: 3,
      }),
      this.prisma.bill.findMany({
        where: { termId },
        orderBy: { proposedDate: 'desc' },
        take: 3,
        include: { proposers: true },
      }),
      // 찬반 팽팽한 표결
      this.prisma.$queryRaw<
        {
          id: string;
          billNo: string;
          billName: string;
          committee: string | null;
          procDate: string;
          procResult: string;
          resultCode: string;
          memberTotal: number;
          voteTotal: number;
          yesCount: number;
          noCount: number;
          abstainCount: number;
          linkUrl: string;
          termId: number;
        }[]
      >`
        SELECT id, "billNo", "billName", committee, "procDate", "procResult",
               "resultCode", "memberTotal", "voteTotal", "yesCount", "noCount",
               "abstainCount", "linkUrl", "termId"
        FROM "Vote"
        WHERE "termId" = ${termId} AND "voteTotal" > 0 AND "noCount" > 0
        ORDER BY ABS("yesCount" - "noCount")::float / "voteTotal" ASC,
                 "procDate" DESC
        LIMIT 3
      `,
      // 최다 대표발의 의원 TOP 5 (파티 정보 포함)
      this.prisma.$queryRaw<
        {
          memberId: string;
          name: string;
          photoUrl: string;
          billCount: bigint;
          partyId: string;
          partyName: string;
          partyShortName: string;
          partyColor: string;
        }[]
      >`
        SELECT bp."memberId", m.name, m."photoUrl", COUNT(*)::bigint as "billCount",
               p.id as "partyId", p.name as "partyName", p."shortName" as "partyShortName", p.color as "partyColor"
        FROM "BillProposer" bp
        JOIN "Bill" b ON bp."billId" = b.id
        JOIN "Member" m ON bp."memberId" = m.id
        JOIN "MemberTerm" mt ON mt."memberId" = bp."memberId" AND mt."termId" = ${termId}
          AND mt."isActive" = true
        LEFT JOIN "Party" p ON p.id = mt."partyId"
        WHERE b."termId" = ${termId} AND bp."role" = 'representative'
        GROUP BY bp."memberId", m.name, m."photoUrl", p.id, p.name, p."shortName", p.color
        ORDER BY "billCount" DESC
        LIMIT 5
      `,
      // 최근 부결 표결
      this.prisma.vote.findMany({
        where: { termId, resultCode: 'rejected' },
        orderBy: { procDate: 'desc' },
        take: 3,
      }),
    ]);

    const mapVote = (v: (typeof recentVotesRaw)[0]) => ({
      id: v.id,
      billNo: v.billNo,
      billName: v.billName,
      committee: v.committee,
      procDate: v.procDate,
      procResult: v.procResult,
      resultCode: v.resultCode,
      memberTotal: v.memberTotal,
      voteTotal: v.voteTotal,
      yesCount: v.yesCount,
      noCount: v.noCount,
      abstainCount: v.abstainCount,
      linkUrl: v.linkUrl,
      termId: v.termId,
    });

    const result = {
      memberCount,
      billCount,
      voteCount,
      avgAttendanceRate: Math.round((avgAttendance[0]?.avg ?? 0) * 10) / 10,
      recentVotes: recentVotesRaw.map(mapVote),
      recentBills: recentBillsRaw.map((b) => ({
        id: b.id,
        title: b.title,
        proposerIds: b.proposers.map((p) => p.memberId),
        proposerName: b.proposerName,
        coProposerCount: b.coProposerCount,
        status: b.status,
        proposedDate: b.proposedDate,
        termId: b.termId,
        committee: b.committee,
        simpleSummary: b.simpleSummary ?? null,
        topic: b.topic ?? null,
      })),
      closeVotes: closeVotesRaw.map((v) => ({
        id: v.id,
        billNo: v.billNo,
        billName: v.billName,
        committee: v.committee,
        procDate: v.procDate,
        procResult: v.procResult,
        resultCode: v.resultCode,
        memberTotal: v.memberTotal,
        voteTotal: v.voteTotal,
        yesCount: v.yesCount,
        noCount: v.noCount,
        abstainCount: v.abstainCount,
        linkUrl: v.linkUrl,
        termId: v.termId,
      })),
      topProposers: topProposersRaw.map((p) => ({
        memberId: p.memberId,
        name: p.name,
        photoUrl: p.photoUrl,
        billCount: Number(p.billCount),
        party: p.partyId
          ? {
              id: p.partyId,
              name: p.partyName,
              shortName: p.partyShortName,
              color: p.partyColor,
            }
          : {
              id: 'independent',
              name: '무소속',
              shortName: '무소속',
              color: '#999999',
            },
      })),
      rejectedVotes: rejectedVotesRaw.map(mapVote),
    };

    await this.redis.set(key, result, TTL_6H);
    return result;
  }

  // bills.service.ts의 TOPIC_NORMALIZE와 동일한 매핑 (alias·표준값 → 표준 토픽)
  private static readonly TOPIC_NORMALIZE: Record<string, string> = {
    '경제·산업': '경제·산업',
    economy: '경제·산업',
    '세금·경제': '경제·산업',
    경제: '경제·산업',
    금융: '경제·산업',
    finance: '경제·산업',
    tax: '경제·산업',
    industry: '경제·산업',
    산업: '경제·산업',
    공정거래: '경제·산업',
    조세: '경제·산업',
    '법·사법': '법·사법',
    law: '법·사법',
    '사법·인권': '법·사법',
    사법: '법·사법',
    justice: '법·사법',
    human_rights: '법·사법',
    법무: '법·사법',
    '환경·에너지': '환경·에너지',
    environment: '환경·에너지',
    환경: '환경·에너지',
    에너지: '환경·에너지',
    energy: '환경·에너지',
    '노동·고용': '노동·고용',
    labor: '노동·고용',
    '노동·일자리': '노동·고용',
    노동: '노동·고용',
    고용: '노동·고용',
    '보건·의료': '보건·의료',
    health: '보건·의료',
    '의료·건강': '보건·의료',
    보건: '보건·의료',
    '복지·건강': '보건·의료',
    '교통·물류': '교통·물류',
    transport: '교통·물류',
    '교통·건설': '교통·물류',
    교통: '교통·물류',
    transportation: '교통·물류',
    건설: '교통·물류',
    국토: '교통·물류',
    '부동산·주거': '부동산·주거',
    housing: '부동산·주거',
    부동산: '부동산·주거',
    '복지·돌봄': '복지·돌봄',
    welfare: '복지·돌봄',
    복지: '복지·돌봄',
    보훈: '복지·돌봄',
    society: '복지·돌봄',
    '육아·교육': '육아·교육',
    education: '육아·교육',
    교육: '육아·교육',
    청년정책: '육아·교육',
    youth: '육아·교육',
    '행정·지방자치': '행정·지방자치',
    administration: '행정·지방자치',
    '행정·제도': '행정·지방자치',
    행정: '행정·지방자치',
    정치: '행정·지방자치',
    politics: '행정·지방자치',
    autonomy: '행정·지방자치',
    regional: '행정·지방자치',
    선거: '행정·지방자치',
    지역발전: '행정·지방자치',
    인구: '행정·지방자치',
    '농업·식품': '농업·식품',
    agriculture: '농업·식품',
    '농림·수산': '농업·식품',
    농업: '농업·식품',
    농림: '농업·식품',
    해양: '농업·식품',
    maritime: '농업·식품',
    '문화·체육': '문화·체육',
    culture: '문화·체육',
    문화: '문화·체육',
    '통신·방송': '문화·체육',
    관광: '문화·체육',
    '과학기술·ICT': '과학기술·ICT',
    technology: '과학기술·ICT',
    '기술·AI': '과학기술·ICT',
    '과학·기술': '과학기술·ICT',
    science: '과학기술·ICT',
    digital: '과학기술·ICT',
    정보통신: '과학기술·ICT',
    '외교·안보': '외교·안보',
    diplomacy: '외교·안보',
    '외교·국방': '외교·안보',
    국방: '외교·안보',
    defense: '외교·안보',
    외교: '외교·안보',
    '안전·치안': '안전·치안',
    safety: '안전·치안',
    안전: '안전·치안',
  };

  /**
   * 입력 토픽(alias 또는 표준값)을 표준 토픽으로 정규화한다.
   * 매핑에 없는 값은 제외. 중복 제거.
   */
  private toCanonicalTopics(topics: string[]): string[] {
    const canonical = topics
      .map((t) => StatsService.TOPIC_NORMALIZE[t])
      .filter((v): v is string => Boolean(v));
    return Array.from(new Set(canonical));
  }

  /** 표준 토픽에 해당하는 모든 alias 키를 반환 (DB topic 컬럼 매칭용) */
  private getTopicAliases(canonicalTopics: string[]): string[] {
    const topicSet = new Set(canonicalTopics);
    return Object.entries(StatsService.TOPIC_NORMALIZE)
      .filter(([, v]) => topicSet.has(v))
      .map(([k]) => k);
  }

  /** 관심 토픽 기반 최근 법안 (이슈 레이더) */
  async getRadar(termId: number, topics: string[]) {
    if (!topics.length) return { bills: [], topics: [] };

    // 캐시 키 폭발 방지: 입력 토픽을 유효한 표준 토픽으로만 정제(중복 제거·정렬·상한).
    // 임의 문자열/오타/부분집합 조합이 새 키를 무한 생성하던 누수를 차단한다.
    const normalizedTopics = this.normalizeRadarTopics(topics);
    if (!normalizedTopics.length) return { bills: [], topics: [] };

    const key = `stats:radar:${termId}:${normalizedTopics.join(',')}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    // 정규화된 표준 토픽에 해당하는 모든 alias를 포함하여 검색
    // (DB topic 컬럼에는 alias 형태가 저장돼 있을 수 있어 확장 필요)
    const expandedTopics = this.getTopicAliases(normalizedTopics);

    const bills = await this.prisma.bill.findMany({
      where: {
        termId,
        topic: { in: expandedTopics },
      },
      orderBy: { proposedDate: 'desc' },
      take: 10,
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
    });

    const result = { bills, topics: normalizedTopics };
    await this.redis.set(key, result, TTL_6H);
    return result;
  }

  /**
   * 레이더 입력 토픽을 캐시 키에 안전한 표준 토픽 배열로 정제한다.
   * - alias·표준값 입력을 모두 표준 토픽(canonical)으로 변환 → alias 다양성으로 인한 키 폭발 차단
   * - 중복 제거 + 정렬로 키를 결정적으로 만들고, 최대 8개로 상한
   * 표준 토픽은 약 15종으로 유한하므로, 임의 문자열/오타가 distinct 캐시 키를 만들던 누수가 사라진다.
   */
  private normalizeRadarTopics(topics: string[]): string[] {
    return this.toCanonicalTopics(topics).sort().slice(0, 8);
  }

  /** 한국 시간 기준 날짜 (YYYY-MM-DD) — 런타임 타임존 무관 */
  private getKoreanDate(offsetDays = 0): string {
    const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
    const now = new Date(Date.now() + KST_OFFSET_MS);
    now.setUTCDate(now.getUTCDate() + offsetDays);
    return now.toISOString().slice(0, 10);
  }

  /** 오늘 브리핑 */
  async getTodayBriefing(termId: number) {
    const today = this.getKoreanDate();
    const key = `stats:today:${termId}:${today}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const since = this.getKoreanDate(-3);

    const [schedules, recentVotes, recentBills] = await Promise.all([
      this.prisma.schedule.findMany({
        where: { termId, meetingDate: { gte: today } },
        orderBy: [{ meetingDate: 'asc' }, { meetingTime: 'asc' }],
        take: 10,
      }),
      this.prisma.vote.findMany({
        where: { termId, procDate: { gte: since } },
        orderBy: { procDate: 'desc' },
        take: 5,
      }),
      this.prisma.bill.findMany({
        where: { termId, proposedDate: { gte: since } },
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
    ]);

    const result = { date: today, schedules, recentVotes, recentBills };
    // 30분 캐시 (자주 갱신)
    await this.redis.set(key, result, 60 * 30);
    return result;
  }
}
