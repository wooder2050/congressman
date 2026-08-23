/**
 * 회의록 발언 인용 적재 스크립트
 *
 * 편집 선별 결과(selection-{billNo}.json)를 검증 후 BillDiscussion/BillDiscussionNote에 적재한다.
 *
 * 검증 (하나라도 실패하면 해당 법안 전체 스킵):
 * 1. 인용문이 후보 파일(candidates-{billNo}.json)의 해당 발언(conferNum+ord)
 *    원문의 연속 부분문자열과 정확히 일치 — 요약·의역·조작 차단
 * 2. billNo → Bill.id 매핑 존재 (Vote.id = Bill.id, Vote.billNo로 조회)
 * 3. meetingId가 MeetingMinutes에 실존
 *
 * 실행: pnpm tsx src/sync/scripts/import-bill-discussions.ts <selections-dir> [--approve]
 *   --approve 없으면 reviewStatus=pending으로 적재 (API 비노출),
 *   --approve 시 approved로 적재. upsert라 재실행 멱등.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SelectionQuote {
  conferNum: string;
  meetingId: string;
  confDate: string;
  meetingTitle: string;
  ord: number;
  speaker: string;
  pos: string;
  text: string;
}

interface Selection {
  billNo: string;
  quotes: SelectionQuote[];
  commentary?: { issue: string; why: string; next: string };
}

interface CandidateMeeting {
  conferNum: string;
  meetingId?: string;
  title?: string;
  confDate?: string;
  sourceUrl: string;
  speeches: { ord: number; speaker: string; pos: string; text: string }[];
}

async function main() {
  const dir = process.argv[2];
  const approve = process.argv.includes('--approve');
  if (!dir) {
    console.error('Usage: tsx import-bill-discussions.ts <selections-dir> [--approve]');
    process.exit(1);
  }

  const reviewedAt = new Date().toISOString().slice(0, 10);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith('selection-') && f.endsWith('.json'));

  let okBills = 0;
  for (const file of files.sort()) {
    const sel: Selection = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
    const candPath = path.join(dir, `candidates-${sel.billNo}.json`);
    if (!fs.existsSync(candPath)) {
      console.error(`✗ ${sel.billNo}: 후보 파일 없음 — 스킵`);
      continue;
    }
    if (!sel.quotes || sel.quotes.length === 0) {
      console.log(`- ${sel.billNo}: 인용 0건 — 스킵`);
      continue;
    }
    const candidates: CandidateMeeting[] = JSON.parse(fs.readFileSync(candPath, 'utf-8'));

    // 검증 1: 원문 부분문자열 일치
    let valid = true;
    for (const q of sel.quotes) {
      const meeting = candidates.find((c) => c.conferNum === q.conferNum);
      const speech = meeting?.speeches.find((s) => s.ord === q.ord);
      if (!speech || speech.speaker !== q.speaker || !speech.text.includes(q.text)) {
        console.error(
          `✗ ${sel.billNo}: 원문 불일치 (conferNum=${q.conferNum} ord=${q.ord} ${q.speaker}) — 법안 전체 스킵`,
        );
        valid = false;
        break;
      }
    }
    if (!valid) continue;

    // 검증 2: billNo → Bill.id (Vote.id = Bill API의 BILL_ID)
    const vote = await prisma.vote.findFirst({
      where: { billNo: sel.billNo, termId: 22 },
      select: { id: true },
    });
    const bill = vote ? await prisma.bill.findUnique({ where: { id: vote.id } }) : null;
    if (!bill) {
      console.error(`✗ ${sel.billNo}: Bill 매핑 실패 — 스킵`);
      continue;
    }

    // 검증 3: meetingId 실존
    const meetingIds = [...new Set(sel.quotes.map((q) => q.meetingId))];
    const found = await prisma.meetingMinutes.count({ where: { id: { in: meetingIds } } });
    if (found !== meetingIds.length) {
      console.error(`✗ ${sel.billNo}: meetingId 불일치 — 스킵`);
      continue;
    }

    const status = approve ? 'approved' : 'pending';
    for (let i = 0; i < sel.quotes.length; i++) {
      const q = sel.quotes[i];
      const meeting = candidates.find((c) => c.conferNum === q.conferNum)!;
      await prisma.billDiscussion.upsert({
        where: {
          billId_conferNum_speechOrd: {
            billId: bill.id,
            conferNum: q.conferNum,
            speechOrd: q.ord,
          },
        },
        create: {
          billId: bill.id,
          billNo: sel.billNo,
          meetingId: q.meetingId,
          conferNum: q.conferNum,
          confDate: q.confDate,
          meetingTitle: q.meetingTitle,
          committeeName: (meeting.title ?? q.meetingTitle).replace(/^제\d+회 /, ''),
          speaker: q.speaker,
          speakerPos: q.pos,
          speechOrd: q.ord,
          quote: q.text,
          sourceUrl: meeting.sourceUrl,
          reviewStatus: status,
          displayOrder: i,
        },
        update: {
          quote: q.text,
          reviewStatus: status,
          displayOrder: i,
        },
      });
    }

    if (sel.commentary) {
      await prisma.billDiscussionNote.upsert({
        where: { billId: bill.id },
        create: {
          billId: bill.id,
          issue: sel.commentary.issue,
          why: sel.commentary.why,
          next: sel.commentary.next,
          reviewedAt,
        },
        update: {
          issue: sel.commentary.issue,
          why: sel.commentary.why,
          next: sel.commentary.next,
          reviewedAt,
        },
      });
    }

    okBills++;
    console.log(`✓ ${sel.billNo} → ${bill.id}: 인용 ${sel.quotes.length}건 (${status})`);
  }

  console.log(`\n완료: ${okBills}/${files.length}개 법안 적재`);
  await prisma.$disconnect();
}

main();
