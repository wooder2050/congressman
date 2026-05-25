import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { AssemblyApiService } from './services/assembly-api.service';
import { SyncLogService } from './services/sync-log.service';
import { MemberSyncService } from './services/member-sync.service';
import { BillSyncService } from './services/bill-sync.service';
import { ExtraBillSyncService } from './services/extra-bill-sync.service';
import { VoteSyncService } from './services/vote-sync.service';
import { PhotoSyncService } from './services/photo-sync.service';
import { MemberVoteSyncService } from './services/member-vote-sync.service';
import { AttendanceSyncService } from './services/attendance-sync.service';
import { AssetSyncService } from './services/asset-sync.service';
import { BillContentSyncService } from './services/bill-content-sync.service';
import { ScheduleSyncService } from './services/schedule-sync.service';
import { CommitteeSyncService } from './services/committee-sync.service';
import { BillJudgeSyncService } from './services/bill-judge-sync.service';
import { MeetingMinutesSyncService } from './services/meeting-minutes-sync.service';
import { NecApiService } from './services/nec-api.service';
import { LocalElectionSyncService } from './services/local-election-sync.service';
import { LocalElectionPhotoSyncService } from './services/local-election-photo-sync.service';
import { ByElectionPhotoSyncService } from './services/by-election-photo-sync.service';
import { CandidateDisclosureSyncService } from './services/candidate-disclosure-sync.service';
import { NesdcPollSyncService } from './services/nesdc-poll-sync.service';

async function invalidateCache(command: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.log('[SyncRunner] Redis not configured, skipping cache invalidation');
    return;
  }

  const redis = new Redis({ url, token });
  const prefixes: string[] = [];

  // 성적표 집계는 4종 데이터(member/bill/vote/attendance)에 모두 의존하므로
  // 어떤 sync든 해당 데이터가 갱신되면 함께 무효화한다.
  const scorecardAffected = [
    'members',
    'bills',
    'bills-safe',
    'extra-bills',
    'bill-content',
    'bill-judge',
    'votes',
    'member-votes',
    'attendance',
    'all',
  ].includes(command);

  if (command === 'members' || command === 'all') {
    prefixes.push('terms:', 'members:', 'member:');
  }
  if (
    command === 'bills' ||
    command === 'bills-safe' ||
    command === 'extra-bills' ||
    command === 'bill-content' ||
    command === 'bill-judge' ||
    command === 'all'
  ) {
    prefixes.push('bills:', 'bill:', 'member:history:');
  }
  if (command === 'votes' || command === 'all') {
    // findMemberVotes 결과는 Vote 조인 필드를 포함하므로 같이 무효화
    prefixes.push('votes:', 'member:votes:');
  }
  if (command === 'photos') {
    prefixes.push('members:', 'member:');
  }
  if (command === 'member-votes') {
    prefixes.push('member:votes:', 'votes:member-votes:');
  }
  if (command === 'attendance') {
    prefixes.push('attendance:');
  }
  if (scorecardAffected) {
    prefixes.push('scorecard:');
  }
  if (command === 'assets') {
    prefixes.push('member:assets:');
  }
  if (command === 'committees') {
    prefixes.push('members:', 'member:');
  }
  if (command === 'schedules') {
    prefixes.push('schedules:');
  }
  if (command === 'meeting-minutes') {
    prefixes.push('committees:');
  }
  if (
    command === 'local-elections' ||
    command === 'local-election-results' ||
    command === 'local-election-photos' ||
    command === 'local-election-disclosure'
  ) {
    prefixes.push('local-elections:');
  }
  if (command === 'by-election-photos' || command === 'by-election-disclosure') {
    prefixes.push('elections:', 'candidates:');
  }
  if (command === 'nesdc-polls') {
    prefixes.push('polls:', 'local-elections:');
  }

  for (const prefix of prefixes) {
    const scanAndDelete = async (cur: number): Promise<number> => {
      const [nextCursor, keys] = await redis.scan(cur, { match: `${prefix}*`, count: 100 });
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`[SyncRunner] Invalidated ${keys.length} cache keys (${prefix}*)`);
      }
      return Number(nextCursor);
    };

    let cursor = await scanAndDelete(0);
    while (cursor !== 0) {
      cursor = await scanAndDelete(cursor);
    }
  }
}

async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();

  const syncLog = new SyncLogService(prisma);
  const command = process.argv[2] ?? 'all';
  const parsed = parseInt(process.argv[3] ?? '22', 10);
  const termId = Number.isInteger(parsed) && parsed > 0 ? parsed : 22;

  console.log(`[SyncRunner] Running sync: "${command}" for term ${termId}`);

  // API 키가 필요 없는 명령은 AssemblyApiService를 생성하지 않음
  const needsApi = ![
    'assets',
    'attendance',
    'bill-content',
    'committees',
    'local-elections',
    'local-election-results',
  ].includes(command);
  const api = needsApi ? new AssemblyApiService() : (null as unknown as AssemblyApiService);

  try {
    switch (command) {
      case 'members':
        await new MemberSyncService(prisma, api, syncLog).syncMembers(termId);
        break;
      case 'bills':
        await new BillSyncService(prisma, api, syncLog).syncBills(termId);
        break;
      case 'bills-safe':
        await new BillSyncService(prisma, api, syncLog).syncBillsSafe(termId);
        break;
      case 'extra-bills':
        await new ExtraBillSyncService(prisma, api, syncLog).syncExtraBills(termId);
        break;
      case 'votes':
        await new VoteSyncService(prisma, api, syncLog).syncVotes(termId);
        break;
      case 'photos':
        await new PhotoSyncService(prisma, api).syncPhotos(termId);
        break;
      case 'member-votes':
        await new MemberVoteSyncService(prisma, api, syncLog).syncMemberVotes(termId);
        break;
      case 'attendance':
        await new AttendanceSyncService(prisma, syncLog).syncAttendance(termId);
        break;
      case 'assets':
        await new AssetSyncService(prisma, syncLog).syncAssets();
        break;
      case 'bill-content':
        await new BillContentSyncService(prisma, syncLog).syncBillContent(termId);
        break;
      case 'schedules':
        await new ScheduleSyncService(prisma, api, syncLog).syncSchedules(termId);
        break;
      case 'committees':
        await new CommitteeSyncService(prisma, syncLog).syncCommittees(termId);
        break;
      case 'bill-judge':
        await new BillJudgeSyncService(prisma, api, syncLog).syncBillJudge(termId);
        break;
      case 'meeting-minutes':
        await new MeetingMinutesSyncService(prisma, api, syncLog).syncMeetingMinutes(termId);
        break;
      case 'local-elections': {
        const necApi = new NecApiService();
        await new LocalElectionSyncService(prisma, necApi, syncLog).syncAll('local-2026');
        break;
      }
      case 'local-election-results': {
        const necApi = new NecApiService();
        await new LocalElectionSyncService(prisma, necApi, syncLog).syncResults('local-2026');
        break;
      }
      case 'local-election-photos': {
        const limitArg = process.argv[3];
        const limit = limitArg ? parseInt(limitArg, 10) : undefined;
        await new LocalElectionPhotoSyncService(prisma, syncLog).syncPhotos({ limit });
        break;
      }
      case 'by-election-photos': {
        const necApi = new NecApiService();
        await new ByElectionPhotoSyncService(prisma, necApi, syncLog).syncPhotos();
        break;
      }
      case 'local-election-disclosure': {
        const limitArg = process.argv[3];
        const limit = limitArg ? parseInt(limitArg, 10) : undefined;
        await new CandidateDisclosureSyncService(prisma, syncLog).syncDisclosures('local', {
          limit,
        });
        break;
      }
      case 'by-election-disclosure': {
        const limitArg = process.argv[3];
        const limit = limitArg ? parseInt(limitArg, 10) : undefined;
        await new CandidateDisclosureSyncService(prisma, syncLog).syncDisclosures('by', {
          limit,
        });
        break;
      }
      case 'nesdc-polls': {
        // 사용: pnpm sync:nesdc-polls [maxPages] [downloadAttachments=true|false]
        const maxPages = parseInt(process.argv[3] ?? '50', 10);
        const downloadAttachments = (process.argv[4] ?? 'false') === 'true';
        await new NesdcPollSyncService(prisma, syncLog).syncPolls({
          maxPages,
          downloadAttachments,
        });
        break;
      }
      case 'all':
      default: {
        const allApi = new AssemblyApiService();
        await new MemberSyncService(prisma, allApi, syncLog).syncMembers(termId);
        await new PhotoSyncService(prisma, allApi).syncPhotos(termId);
        await new BillSyncService(prisma, allApi, syncLog).syncBills(termId);
        await new ExtraBillSyncService(prisma, allApi, syncLog).syncExtraBills(termId);
        await new BillJudgeSyncService(prisma, allApi, syncLog).syncBillJudge(termId);
        await new VoteSyncService(prisma, allApi, syncLog).syncVotes(termId);
        break;
      }
    }

    await invalidateCache(command);
    console.log('[SyncRunner] Sync completed successfully');
  } catch (error) {
    console.error('[SyncRunner] Sync failed', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
