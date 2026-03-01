import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';

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
const TTL_DAY = 24 * 60 * 60; // 24h

@Injectable()
export class BillsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(params: FindAllParams) {
    const key = `bills:${params.termId ?? ''}:${params.memberId ?? ''}:${params.role ?? ''}:${params.status ?? ''}:${params.search ?? ''}:${params.month ?? ''}:${params.committee ?? ''}:${params.topic ?? ''}:${params.page}:${params.limit}`;
    const cached = await this.redis.get(key);
    if (cached) return cached;

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
      })),
      total,
    };

    await this.redis.set(key, result, TTL_HOUR);
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
    const key = 'bills:all-ids';
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const bills = await this.prisma.bill.findMany({
      select: { id: true, proposedDate: true },
      orderBy: { proposedDate: 'desc' },
    });

    const result = bills.map((b) => ({ id: b.id, proposedDate: b.proposedDate }));
    await this.redis.set(key, result, TTL_DAY);
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
}
