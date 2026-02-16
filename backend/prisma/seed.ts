import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. 정당 시드
  const parties = [
    { id: 'democratic', name: '더불어민주당', shortName: '민주당', color: '#1B56DB' },
    { id: 'ppp', name: '국민의힘', shortName: '국민의힘', color: '#E61E2B' },
    { id: 'rebuilding', name: '조국혁신당', shortName: '혁신당', color: '#003DA5' },
    { id: 'reform', name: '개혁신당', shortName: '개혁신당', color: '#F37924' },
    { id: 'progressive', name: '진보당', shortName: '진보당', color: '#D6001C' },
    { id: 'basic-income', name: '기본소득당', shortName: '기본소득당', color: '#00D2C3' },
    { id: 'social-democratic', name: '사회민주당', shortName: '사민당', color: '#F58400' },
    { id: 'new-future', name: '새로운미래', shortName: '새미래', color: '#45BABD' },
    { id: 'independent', name: '무소속', shortName: '무소속', color: '#999999' },
  ];

  for (const party of parties) {
    await prisma.party.upsert({
      where: { id: party.id },
      update: party,
      create: party,
    });
  }

  // 2. 대수 시드
  const terms = [
    {
      id: 22,
      name: '제22대',
      startDate: new Date('2024-05-30'),
      endDate: new Date('2028-05-29'),
      isCurrent: true,
    },
    {
      id: 21,
      name: '제21대',
      startDate: new Date('2020-05-30'),
      endDate: new Date('2024-05-29'),
      isCurrent: false,
    },
  ];

  for (const term of terms) {
    await prisma.term.upsert({
      where: { id: term.id },
      update: term,
      create: term,
    });
  }

  // 3. 의원 시드
  const members = [
    { id: 'm1', name: '김민수', photoUrl: '', birthDate: '1965-03-15', electedCount: 3 },
    { id: 'm2', name: '이정희', photoUrl: '', birthDate: '1970-07-22', electedCount: 2 },
    { id: 'm3', name: '박성호', photoUrl: '', birthDate: '1968-11-03', electedCount: 4 },
    { id: 'm4', name: '최영미', photoUrl: '', birthDate: '1975-01-18', electedCount: 1 },
    { id: 'm5', name: '정우진', photoUrl: '', birthDate: '1960-09-25', electedCount: 5 },
    { id: 'm6', name: '한수연', photoUrl: '', birthDate: '1972-04-12', electedCount: 2 },
    { id: 'm7', name: '강태준', photoUrl: '', birthDate: '1978-06-08', electedCount: 1 },
    { id: 'm8', name: '윤서현', photoUrl: '', birthDate: '1966-12-30', electedCount: 3 },
    { id: 'm9', name: '조현우', photoUrl: '', birthDate: '1971-02-14', electedCount: 2 },
    { id: 'm10', name: '신미래', photoUrl: '', birthDate: '1980-08-20', electedCount: 1 },
    { id: 'm11', name: '오준석', photoUrl: '', birthDate: '1963-05-07', electedCount: 4 },
    { id: 'm12', name: '임하나', photoUrl: '', birthDate: '1977-10-11', electedCount: 1 },
  ];

  for (const member of members) {
    await prisma.member.upsert({
      where: { id: member.id },
      update: member,
      create: member,
    });
  }

  // 4. 의원-대수 관계 시드
  const memberTerms = [
    // 22대
    {
      memberId: 'm1',
      termId: 22,
      partyId: 'democratic',
      district: '서울 종로구',
      proportional: false,
      committees: ['법제사법위원회', '국방위원회'],
    },
    {
      memberId: 'm2',
      termId: 22,
      partyId: 'ppp',
      district: '서울 강남구갑',
      proportional: false,
      committees: ['기획재정위원회'],
    },
    {
      memberId: 'm3',
      termId: 22,
      partyId: 'democratic',
      district: '부산 해운대구갑',
      proportional: false,
      committees: ['외교통일위원회', '국방위원회'],
    },
    {
      memberId: 'm4',
      termId: 22,
      partyId: 'rebuilding',
      district: '경기 성남시분당구갑',
      proportional: false,
      committees: ['교육위원회'],
    },
    {
      memberId: 'm5',
      termId: 22,
      partyId: 'ppp',
      district: '대구 수성구갑',
      proportional: false,
      committees: ['국방위원회'],
    },
    {
      memberId: 'm6',
      termId: 22,
      partyId: 'democratic',
      district: '인천 남동구갑',
      proportional: false,
      committees: ['보건복지위원회'],
    },
    {
      memberId: 'm7',
      termId: 22,
      partyId: 'reform',
      district: '',
      proportional: true,
      committees: ['과학기술정보방송통신위원회'],
    },
    {
      memberId: 'm8',
      termId: 22,
      partyId: 'ppp',
      district: '경기 용인시수지구',
      proportional: false,
      committees: ['행정안전위원회', '법제사법위원회'],
    },
    {
      memberId: 'm9',
      termId: 22,
      partyId: 'democratic',
      district: '광주 서구갑',
      proportional: false,
      committees: ['환경노동위원회'],
    },
    {
      memberId: 'm10',
      termId: 22,
      partyId: 'rebuilding',
      district: '',
      proportional: true,
      committees: ['여성가족위원회'],
    },
    {
      memberId: 'm11',
      termId: 22,
      partyId: 'ppp',
      district: '서울 송파구갑',
      proportional: false,
      committees: ['국토교통위원회'],
    },
    {
      memberId: 'm12',
      termId: 22,
      partyId: 'independent',
      district: '제주 제주시갑',
      proportional: false,
      committees: ['농림축산식품해양수산위원회'],
    },
    // 21대
    {
      memberId: 'm1',
      termId: 21,
      partyId: 'democratic',
      district: '서울 종로구',
      proportional: false,
      committees: ['법제사법위원회'],
    },
    {
      memberId: 'm2',
      termId: 21,
      partyId: 'ppp',
      district: '서울 강남구갑',
      proportional: false,
      committees: ['기획재정위원회', '외교통일위원회'],
    },
    {
      memberId: 'm3',
      termId: 21,
      partyId: 'democratic',
      district: '부산 해운대구갑',
      proportional: false,
      committees: ['국방위원회'],
    },
    {
      memberId: 'm5',
      termId: 21,
      partyId: 'ppp',
      district: '대구 수성구갑',
      proportional: false,
      committees: ['행정안전위원회'],
    },
    {
      memberId: 'm8',
      termId: 21,
      partyId: 'ppp',
      district: '경기 용인시수지구',
      proportional: false,
      committees: ['법제사법위원회'],
    },
    {
      memberId: 'm9',
      termId: 21,
      partyId: 'democratic',
      district: '광주 서구갑',
      proportional: false,
      committees: ['보건복지위원회'],
    },
    {
      memberId: 'm11',
      termId: 21,
      partyId: 'ppp',
      district: '서울 송파구갑',
      proportional: false,
      committees: ['기획재정위원회', '국토교통위원회'],
    },
  ];

  for (const mt of memberTerms) {
    await prisma.memberTerm.upsert({
      where: { memberId_termId: { memberId: mt.memberId, termId: mt.termId } },
      update: mt,
      create: mt,
    });
  }

  // 5. 출석 시드
  const attendances = [
    // 22대
    {
      memberId: 'm1',
      termId: 22,
      totalSessions: 120,
      attended: 108,
      absent: 5,
      leave: 4,
      travel: 3,
      rate: 90.0,
    },
    {
      memberId: 'm2',
      termId: 22,
      totalSessions: 120,
      attended: 115,
      absent: 2,
      leave: 2,
      travel: 1,
      rate: 95.8,
    },
    {
      memberId: 'm3',
      termId: 22,
      totalSessions: 120,
      attended: 102,
      absent: 8,
      leave: 6,
      travel: 4,
      rate: 85.0,
    },
    {
      memberId: 'm4',
      termId: 22,
      totalSessions: 120,
      attended: 118,
      absent: 1,
      leave: 1,
      travel: 0,
      rate: 98.3,
    },
    {
      memberId: 'm5',
      termId: 22,
      totalSessions: 120,
      attended: 95,
      absent: 12,
      leave: 8,
      travel: 5,
      rate: 79.2,
    },
    {
      memberId: 'm6',
      termId: 22,
      totalSessions: 120,
      attended: 112,
      absent: 3,
      leave: 3,
      travel: 2,
      rate: 93.3,
    },
    {
      memberId: 'm7',
      termId: 22,
      totalSessions: 120,
      attended: 116,
      absent: 2,
      leave: 1,
      travel: 1,
      rate: 96.7,
    },
    {
      memberId: 'm8',
      termId: 22,
      totalSessions: 120,
      attended: 105,
      absent: 7,
      leave: 5,
      travel: 3,
      rate: 87.5,
    },
    {
      memberId: 'm9',
      termId: 22,
      totalSessions: 120,
      attended: 110,
      absent: 4,
      leave: 4,
      travel: 2,
      rate: 91.7,
    },
    {
      memberId: 'm10',
      termId: 22,
      totalSessions: 120,
      attended: 119,
      absent: 0,
      leave: 1,
      travel: 0,
      rate: 99.2,
    },
    {
      memberId: 'm11',
      termId: 22,
      totalSessions: 120,
      attended: 100,
      absent: 10,
      leave: 6,
      travel: 4,
      rate: 83.3,
    },
    {
      memberId: 'm12',
      termId: 22,
      totalSessions: 120,
      attended: 114,
      absent: 3,
      leave: 2,
      travel: 1,
      rate: 95.0,
    },
    // 21대
    {
      memberId: 'm1',
      termId: 21,
      totalSessions: 200,
      attended: 176,
      absent: 10,
      leave: 8,
      travel: 6,
      rate: 88.0,
    },
    {
      memberId: 'm2',
      termId: 21,
      totalSessions: 200,
      attended: 188,
      absent: 5,
      leave: 4,
      travel: 3,
      rate: 94.0,
    },
    {
      memberId: 'm3',
      termId: 21,
      totalSessions: 200,
      attended: 160,
      absent: 18,
      leave: 12,
      travel: 10,
      rate: 80.0,
    },
    {
      memberId: 'm5',
      termId: 21,
      totalSessions: 200,
      attended: 150,
      absent: 25,
      leave: 15,
      travel: 10,
      rate: 75.0,
    },
    {
      memberId: 'm8',
      termId: 21,
      totalSessions: 200,
      attended: 170,
      absent: 14,
      leave: 10,
      travel: 6,
      rate: 85.0,
    },
    {
      memberId: 'm9',
      termId: 21,
      totalSessions: 200,
      attended: 182,
      absent: 8,
      leave: 6,
      travel: 4,
      rate: 91.0,
    },
    {
      memberId: 'm11',
      termId: 21,
      totalSessions: 200,
      attended: 155,
      absent: 20,
      leave: 15,
      travel: 10,
      rate: 77.5,
    },
  ];

  for (const att of attendances) {
    await prisma.attendance.upsert({
      where: { memberId_termId: { memberId: att.memberId, termId: att.termId } },
      update: att,
      create: att,
    });
  }

  // 6. 법안 시드
  const bills = [
    // 22대
    {
      id: 'b1',
      title: '국민건강보험법 일부개정법률안',
      proposerName: '김민수',
      coProposerCount: 12,
      status: 'passed',
      proposedDate: '2024-09-15',
      termId: 22,
      committee: '보건복지위원회',
      proposerIds: ['m1'],
    },
    {
      id: 'b2',
      title: '지방자치법 일부개정법률안',
      proposerName: '이정희',
      coProposerCount: 8,
      status: 'pending',
      proposedDate: '2024-11-20',
      termId: 22,
      committee: '행정안전위원회',
      proposerIds: ['m2'],
    },
    {
      id: 'b3',
      title: '군인복지법 일부개정법률안',
      proposerName: '박성호',
      coProposerCount: 15,
      status: 'committee',
      proposedDate: '2024-08-10',
      termId: 22,
      committee: '국방위원회',
      proposerIds: ['m3'],
    },
    {
      id: 'b4',
      title: '교육기본법 일부개정법률안',
      proposerName: '최영미',
      coProposerCount: 10,
      status: 'passed',
      proposedDate: '2024-10-05',
      termId: 22,
      committee: '교육위원회',
      proposerIds: ['m4'],
    },
    {
      id: 'b5',
      title: '국방개혁법 일부개정법률안',
      proposerName: '정우진',
      coProposerCount: 20,
      status: 'discarded',
      proposedDate: '2024-07-01',
      termId: 22,
      committee: '국방위원회',
      proposerIds: ['m5'],
    },
    {
      id: 'b6',
      title: '아동복지법 일부개정법률안',
      proposerName: '한수연',
      coProposerCount: 11,
      status: 'pending',
      proposedDate: '2024-12-01',
      termId: 22,
      committee: '보건복지위원회',
      proposerIds: ['m6'],
    },
    {
      id: 'b7',
      title: '정보통신망법 일부개정법률안',
      proposerName: '강태준',
      coProposerCount: 9,
      status: 'committee',
      proposedDate: '2025-01-10',
      termId: 22,
      committee: '과학기술정보방송통신위원회',
      proposerIds: ['m7'],
    },
    {
      id: 'b8',
      title: '주택임대차보호법 일부개정법률안',
      proposerName: '김민수',
      coProposerCount: 18,
      status: 'passed',
      proposedDate: '2024-06-20',
      termId: 22,
      committee: '법제사법위원회',
      proposerIds: ['m1'],
    },
    {
      id: 'b9',
      title: '환경보전법 일부개정법률안',
      proposerName: '조현우',
      coProposerCount: 7,
      status: 'pending',
      proposedDate: '2025-02-01',
      termId: 22,
      committee: '환경노동위원회',
      proposerIds: ['m9'],
    },
    {
      id: 'b10',
      title: '여성발전기본법 일부개정법률안',
      proposerName: '신미래',
      coProposerCount: 14,
      status: 'committee',
      proposedDate: '2024-09-30',
      termId: 22,
      committee: '여성가족위원회',
      proposerIds: ['m10'],
    },
    // 21대
    {
      id: 'b11',
      title: '국민연금법 일부개정법률안',
      proposerName: '김민수',
      coProposerCount: 16,
      status: 'passed',
      proposedDate: '2021-03-15',
      termId: 21,
      committee: '보건복지위원회',
      proposerIds: ['m1'],
    },
    {
      id: 'b12',
      title: '소득세법 일부개정법률안',
      proposerName: '이정희',
      coProposerCount: 12,
      status: 'passed',
      proposedDate: '2021-06-20',
      termId: 21,
      committee: '기획재정위원회',
      proposerIds: ['m2'],
    },
    {
      id: 'b13',
      title: '병역법 일부개정법률안',
      proposerName: '박성호',
      coProposerCount: 22,
      status: 'discarded',
      proposedDate: '2022-01-10',
      termId: 21,
      committee: '국방위원회',
      proposerIds: ['m3'],
    },
    {
      id: 'b14',
      title: '부동산 거래신고법 일부개정법률안',
      proposerName: '김민수',
      coProposerCount: 10,
      status: 'passed',
      proposedDate: '2022-05-15',
      termId: 21,
      committee: '국토교통위원회',
      proposerIds: ['m1'],
    },
    {
      id: 'b15',
      title: '공직선거법 일부개정법률안',
      proposerName: '정우진',
      coProposerCount: 25,
      status: 'discarded',
      proposedDate: '2023-03-01',
      termId: 21,
      committee: '행정안전위원회',
      proposerIds: ['m5'],
    },
  ];

  for (const bill of bills) {
    const { proposerIds, ...billData } = bill;

    await prisma.bill.upsert({
      where: { id: billData.id },
      update: billData,
      create: billData,
    });

    for (const memberId of proposerIds) {
      await prisma.billProposer.upsert({
        where: { billId_memberId: { billId: billData.id, memberId } },
        update: {},
        create: { billId: billData.id, memberId },
      });
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
