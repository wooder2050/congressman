import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';
import { isCacheablePage } from '../common/query-parsers';

interface FindAllParams {
  termId?: number;
  memberId?: string;
  role?: string; // "representative" | "co"
  status?: string;
  search?: string;
  month?: string; // YYYY-MM
  committee?: string;
  topic?: string;
  page: number;
  limit: number;
}

const TOPIC_NORMALIZE: Record<string, string> = {
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
  기타: '기타',
  women: '기타',
  equality: '기타',
};

function normalizeTopic(topic: string): string {
  return TOPIC_NORMALIZE[topic] ?? '기타';
}

const TTL_HOUR = 60 * 60; // 1h
const TTL_6H = 6 * 60 * 60; // 6h
const TTL_DAY = 24 * 60 * 60; // 24h

let allIdsMemoryCache: { data: { id: string; proposedDate: string }[]; expiresAt: number } | null =
  null;
let indexableIdsMemoryCache: {
  data: { id: string; proposedDate: string }[];
  expiresAt: number;
} | null = null;
const ALL_IDS_MEMORY_TTL_MS = 60 * 60 * 1000; // 1h

@Injectable()
export class BillsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(params: FindAllParams) {
    // 캐시 skip 조건: 검색어가 있거나(키 폭발), 깊은 페이지(봇/크롤러의 ?page=N 키 폭발)
    const cacheable = !params.search && isCacheablePage(params.page);
    const key = cacheable
      ? `bills:${params.termId ?? ''}:${params.memberId ?? ''}:${params.role ?? ''}:${params.status ?? ''}:${params.month ?? ''}:${params.committee ?? ''}:${params.topic ?? ''}:${params.page}:${params.limit}`
      : null;
    if (key) {
      const cached = await this.redis.get(key);
      if (cached) return cached;
    }

    const where: Prisma.BillWhereInput = {};

    if (params.termId) where.termId = params.termId;
    if (params.status) where.status = params.status;
    if (params.search) where.title = { contains: params.search, mode: 'insensitive' };
    if (params.memberId) {
      where.proposers = {
        some: {
          memberId: params.memberId,
          ...(params.role ? { role: params.role } : {}),
        },
      };
    }
    if (params.month) {
      where.proposedDate = { startsWith: params.month };
    }
    if (params.committee) {
      where.committee = params.committee;
    }
    if (params.topic) {
      const matchingKeys = Object.entries(TOPIC_NORMALIZE)
        .filter(([, v]) => v === params.topic)
        .map(([k]) => k);
      where.topic = { in: matchingKeys };
    }

    const [bills, total] = await Promise.all([
      this.prisma.bill.findMany({
        where,
        include: { proposers: true },
        orderBy: { proposedDate: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.bill.count({ where }),
    ]);

    const result = {
      bills: bills.map((b) => ({
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
        topic: b.topic ? normalizeTopic(b.topic) : null,
        committeeResultCode: b.committeeResultCode ?? null,
      })),
      total,
    };

    if (key) {
      await this.redis.set(key, result, TTL_6H);
    }
    return result;
  }

  async getSummary(termId: number) {
    const key = `bills:summary:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const [total, passed, pending, discarded, committee] = await Promise.all([
      this.prisma.bill.count({ where: { termId } }),
      this.prisma.bill.count({ where: { termId, status: 'passed' } }),
      this.prisma.bill.count({ where: { termId, status: 'pending' } }),
      this.prisma.bill.count({ where: { termId, status: 'discarded' } }),
      this.prisma.bill.count({ where: { termId, status: 'committee' } }),
    ]);

    const result = { total, passed, pending, discarded, committee };
    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async getCommittees(termId: number): Promise<string[]> {
    const key = `bills:committees:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached as string[];

    const rows = await this.prisma.bill.findMany({
      where: { termId, committee: { not: null } },
      select: { committee: true },
      distinct: ['committee'],
      orderBy: { committee: 'asc' },
    });

    const result = rows.map((r) => r.committee!).filter((c) => !c.includes('특별위원회'));

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async findAllIds() {
    if (allIdsMemoryCache && allIdsMemoryCache.expiresAt > Date.now()) {
      return allIdsMemoryCache.data;
    }

    const key = 'bills:all-ids';
    const cached = await this.redis.get<{ id: string; proposedDate: string }[]>(key);
    if (cached) {
      allIdsMemoryCache = { data: cached, expiresAt: Date.now() + ALL_IDS_MEMORY_TTL_MS };
      return cached;
    }

    const bills = await this.prisma.bill.findMany({
      select: { id: true, proposedDate: true },
      orderBy: { proposedDate: 'desc' },
    });

    const result = bills.map((b) => ({ id: b.id, proposedDate: b.proposedDate }));
    await this.redis.set(key, result, TTL_DAY);
    allIdsMemoryCache = { data: result, expiresAt: Date.now() + ALL_IDS_MEMORY_TTL_MS };
    return result;
  }

  /**
   * 색인 가치가 높은 법안 ID만 반환. AdSense thin-content 대응 sitemap용.
   *
   * 기준(AND): simpleSummary(AI 요약) 보유 + 본회의 결과(lawResultCode) 도달
   *
   * v2(위원회 결과 포함, 6,115건)까지는 "처리단계 도달"을 기준으로 삼았지만
   * 5회 연속 "가치가 별로 없는 콘텐츠" 반려로 불충분함이 확인됐다(2026-08).
   * 승인된 사이트와의 비교 분석 결과 심사 기준은 분량·처리단계가 아니라
   * "원본(열린국회정보)에 없는 정보가 페이지에 있는가"였다.
   * 본회의 표결에 도달한 법안 페이지에는 의원별 찬반·정당별 집계 등 원본
   * 사이트에서 조립된 형태로 제공되지 않는 데이터가 붙으므로 이 선에서 자른다.
   * 위원회 결과만 있는 법안은 필드 나열 + 자동 요약뿐이라 제외(~1,456건 잔존).
   */
  async findIndexableIds() {
    if (indexableIdsMemoryCache && indexableIdsMemoryCache.expiresAt > Date.now()) {
      return indexableIdsMemoryCache.data;
    }

    const key = 'bills:indexable-ids:v3';
    const cached = await this.redis.get<{ id: string; proposedDate: string }[]>(key);
    if (cached) {
      indexableIdsMemoryCache = { data: cached, expiresAt: Date.now() + ALL_IDS_MEMORY_TTL_MS };
      return cached;
    }

    const bills = await this.prisma.bill.findMany({
      where: {
        simpleSummary: { not: null },
        lawResultCode: { not: null },
      },
      select: { id: true, proposedDate: true },
      orderBy: { proposedDate: 'desc' },
    });

    const result = bills.map((b) => ({ id: b.id, proposedDate: b.proposedDate }));
    await this.redis.set(key, result, TTL_DAY);
    indexableIdsMemoryCache = { data: result, expiresAt: Date.now() + ALL_IDS_MEMORY_TTL_MS };
    return result;
  }

  async getTopicCounts(termId: number) {
    const key = `bills:topics:${termId}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const rows = await this.prisma.bill.groupBy({
      by: ['topic'],
      where: { termId, topic: { not: null } },
      _count: true,
    });

    const merged = new Map<string, number>();
    for (const r of rows) {
      const normalized = normalizeTopic(r.topic!);
      merged.set(normalized, (merged.get(normalized) ?? 0) + r._count);
    }

    const result = Array.from(merged.entries())
      .filter(([t]) => t !== '기타')
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  async findById(id: string) {
    const key = `bill:${id}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const [bill, voteExists] = await Promise.all([
      this.prisma.bill.findUnique({ where: { id } }),
      this.prisma.vote.findUnique({ where: { id }, select: { id: true } }),
    ]);
    if (!bill) return null;

    const proposers = await this.prisma.billProposer.findMany({
      where: { billId: id },
      include: {
        member: {
          include: {
            memberTerms: {
              where: { termId: bill.termId },
              include: { party: true },
              take: 1,
            },
          },
        },
      },
    });

    const result = {
      id: bill.id,
      title: bill.title,
      proposerName: bill.proposerName,
      coProposerCount: bill.coProposerCount,
      status: bill.status,
      proposedDate: bill.proposedDate,
      termId: bill.termId,
      committee: bill.committee,
      hasVote: !!voteExists,
      summary: bill.summary ?? null,
      simpleSummary: bill.simpleSummary ?? null,
      structuredSummary: bill.structuredSummary ?? null,
      topic: bill.topic ?? null,
      pdfUrl: bill.pdfBookId
        ? `https://likms.assembly.go.kr/filegate/servlet/FileGate?bookId=${bill.pdfBookId}&type=1`
        : null,
      detailLink:
        bill.detailLink ?? `https://likms.assembly.go.kr/bill/billDetail.do?billId=${bill.id}`,
      progress: {
        committeeDate: bill.committeeDate ?? null,
        committeePresentDate: bill.committeePresentDate ?? null,
        committeeResult: bill.committeeResultCode ?? null,
        committeeResultDate: bill.committeeResultDate ?? null,
        lawSubmitDate: bill.lawSubmitDate ?? null,
        lawPresentDate: bill.lawPresentDate ?? null,
        lawResult: bill.lawResultCode ?? null,
        lawResultDate: bill.lawResultDate ?? null,
        plenaryDate: bill.plenaryDate ?? null,
      },
      proposers: proposers.map((p) => {
        const term = p.member.memberTerms[0];
        return {
          memberId: p.memberId,
          memberName: p.member.name,
          photoUrl: p.member.photoUrl,
          role: p.role,
          partyId: term?.party.id ?? 'independent',
          partyName: term?.party.name ?? '무소속',
          partyColor: term?.party.color ?? '#999999',
          district: term?.district ?? '',
        };
      }),
    };

    await this.redis.set(key, result, TTL_HOUR);
    return result;
  }

  /**
   * 관련 법안 추천 — 같은 법률 개정안 > 같은 발의자 > 같은 분야 순으로 최대 6건.
   * 상세 페이지(ISR 2일)에서만 호출되므로 무거운 검색이 아닌 단순 조건 3개로 구성.
   */
  async findRelated(id: string) {
    const key = `bill:related:${id}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const bill = await this.prisma.bill.findUnique({
      where: { id },
      select: { id: true, title: true, topic: true, proposerName: true, termId: true },
    });
    if (!bill) return [];

    // "형사소송법 일부개정법률안(홍길동의원 등 10인)" → "형사소송법"
    const baseLawName = bill.title
      .replace(/\([^)]*\)/g, '')
      .replace(/(일부|전부)?개정(법률|규칙)안$|폐지법률안$|법률안$/g, '')
      .trim();

    const commonSelect = {
      id: true,
      title: true,
      proposerName: true,
      status: true,
      proposedDate: true,
      simpleSummary: true,
      topic: true,
    } as const;
    const base = {
      termId: bill.termId,
      id: { not: bill.id },
      simpleSummary: { not: null },
    };

    // topic은 원본 값이 80종+로 파편화돼 있어, findAll과 동일하게 같은 canonical로
    // 정규화되는 원본 값 전체를 in 조건으로 매칭한다 (예: 'science'와 '과학기술·ICT'가 서로 매칭).
    const topicKeys = bill.topic
      ? Object.entries(TOPIC_NORMALIZE)
          .filter(([, v]) => v === normalizeTopic(bill.topic!))
          .map(([k]) => k)
      : [];

    const [sameLaw, sameProposer, sameTopic] = await Promise.all([
      baseLawName.length >= 3
        ? this.prisma.bill.findMany({
            where: { ...base, title: { startsWith: baseLawName } },
            orderBy: { proposedDate: 'desc' },
            take: 6,
            select: commonSelect,
          })
        : Promise.resolve([]),
      // proposerName이 비어 있으면 무관한 법안이 전부 "같은 발의자"로 묶이므로 스킵
      bill.proposerName.trim()
        ? this.prisma.bill.findMany({
            where: { ...base, proposerName: bill.proposerName },
            orderBy: { proposedDate: 'desc' },
            take: 6,
            select: commonSelect,
          })
        : Promise.resolve([]),
      topicKeys.length
        ? this.prisma.bill.findMany({
            where: { ...base, topic: { in: topicKeys } },
            orderBy: { proposedDate: 'desc' },
            take: 6,
            select: commonSelect,
          })
        : Promise.resolve([]),
    ]);

    const seen = new Set<string>();
    const result: Array<
      (typeof sameLaw)[number] & { relation: 'same-law' | 'same-proposer' | 'same-topic' }
    > = [];
    const push = (bills: typeof sameLaw, relation: 'same-law' | 'same-proposer' | 'same-topic') => {
      for (const b of bills) {
        if (result.length >= 6 || seen.has(b.id)) continue;
        seen.add(b.id);
        result.push({ ...b, topic: b.topic ? normalizeTopic(b.topic) : null, relation });
      }
    };
    push(sameLaw, 'same-law');
    push(sameProposer, 'same-proposer');
    push(sameTopic, 'same-topic');

    await this.redis.set(key, result, TTL_6H);
    return result;
  }

  async findByIds(ids: string[]) {
    if (!ids.length) return [];

    const bills = await this.prisma.bill.findMany({
      where: { id: { in: ids } },
      orderBy: { proposedDate: 'desc' },
      select: {
        id: true,
        title: true,
        proposerName: true,
        coProposerCount: true,
        status: true,
        proposedDate: true,
        termId: true,
        committee: true,
        simpleSummary: true,
        topic: true,
      },
    });

    return bills.map((b) => ({
      ...b,
      simpleSummary: b.simpleSummary ?? null,
      topic: b.topic ? normalizeTopic(b.topic) : null,
    }));
  }
}
