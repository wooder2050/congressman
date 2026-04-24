import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Member가 DB에 존재하면 ID 반환, 없으면 null */
async function resolveMemberId(id: string | null): Promise<string | null> {
  if (!id) return null;
  const member = await prisma.member.findUnique({ where: { id }, select: { id: true } });
  return member?.id ?? null;
}

/** Party가 DB에 존재하면 ID 반환, 없으면 null */
async function resolvePartyId(id: string | null): Promise<string | null> {
  if (!id) return null;
  const party = await prisma.party.findUnique({ where: { id }, select: { id: true } });
  return party?.id ?? null;
}

async function main() {
  // 1. 재보궐선거 생성
  await prisma.byElection.upsert({
    where: { id: '2026-06-03' },
    update: {
      name: '6·3 재보궐선거',
      electionDate: new Date('2026-06-03'),
      description:
        '6·3 지방선거와 동시에 치러지는 국회의원 재보궐선거. 대통령 당선·비서실장 임명·당선무효 등으로 공석이 발생한 선거구에서 실시됩니다.',
      status: 'upcoming',
    },
    create: {
      id: '2026-06-03',
      name: '6·3 재보궐선거',
      electionDate: new Date('2026-06-03'),
      description:
        '6·3 지방선거와 동시에 치러지는 국회의원 재보궐선거. 대통령 당선·비서실장 임명·당선무효 등으로 공석이 발생한 선거구에서 실시됩니다.',
      status: 'upcoming',
    },
  });

  // 2. 확정 5곳 선거구
  // previousMemberId: production DB에만 존재하는 의원 ID → 없으면 null로 처리
  const confirmedDistricts = [
    {
      electionId: '2026-06-03',
      district: '인천 계양구을',
      region: '인천',
      vacancyReason: '이재명 대통령 당선',
      previousMemberId: 'IUD9392R', // 이재명
      previousMemberName: '이재명',
      previousPartyId: 'democratic',
    },
    {
      electionId: '2026-06-03',
      district: '충남 아산시을',
      region: '충남',
      vacancyReason: '강훈식 대통령비서실장 임명',
      previousMemberId: 'TRE2429O', // 강훈식
      previousMemberName: '강훈식',
      previousPartyId: 'democratic',
    },
    {
      electionId: '2026-06-03',
      district: '경기 안산시갑',
      region: '경기',
      vacancyReason: '양문석 당선무효 (선거법 위반)',
      previousMemberId: '3OQ8273H', // 양문석
      previousMemberName: '양문석',
      previousPartyId: 'democratic',
    },
    {
      electionId: '2026-06-03',
      district: '경기 평택시을',
      region: '경기',
      vacancyReason: '이병진 당선무효 (선거법 위반)',
      previousMemberId: null, // 이병진 — DB에 미존재 (당선무효로 삭제됨)
      previousMemberName: '이병진',
      previousPartyId: 'democratic',
    },
    {
      electionId: '2026-06-03',
      district: '전북 군산시김제시부안군갑',
      region: '전북',
      vacancyReason: '신영대 당선무효 (선거법 위반)',
      previousMemberId: 'AFH96856', // 신영대
      previousMemberName: '신영대',
      previousPartyId: 'democratic',
    },
  ];

  for (const d of confirmedDistricts) {
    const resolvedMemberId = await resolveMemberId(d.previousMemberId);
    const resolvedPartyId = await resolvePartyId(d.previousPartyId);

    const data = {
      electionId: d.electionId,
      district: d.district,
      region: d.region,
      vacancyReason: d.vacancyReason,
      previousMemberId: resolvedMemberId,
      previousMemberName: d.previousMemberName,
      previousPartyId: resolvedPartyId,
      confirmed: true,
      status: 'upcoming',
    };

    await prisma.electionDistrict.upsert({
      where: {
        electionId_district: { electionId: d.electionId, district: d.district },
      },
      update: data,
      create: data,
    });
  }

  console.log(`✅ 재보궐선거 시드 완료: 확정 ${confirmedDistricts.length}곳`);

  // 3. 사퇴 예정 선거구 (경선 승리 확정, 의원직 사퇴 예정 — 4/29~30 일괄 사직)
  const pendingDistricts = [
    {
      electionId: '2026-06-03',
      district: '경기 하남시갑',
      region: '경기',
      vacancyReason: '추미애 경기도지사 출마 사퇴',
      previousMemberId: 'URV1689Q',
      previousMemberName: '추미애',
      previousPartyId: 'democratic',
    },
    {
      electionId: '2026-06-03',
      district: '부산 북구갑',
      region: '부산',
      vacancyReason: '전재수 부산시장 출마 사퇴',
      previousMemberId: '9YO73104',
      previousMemberName: '전재수',
      previousPartyId: 'democratic',
    },
    {
      electionId: '2026-06-03',
      district: '충남 공주시부여군청양군',
      region: '충남',
      vacancyReason: '박수현 충남도지사 출마 사퇴',
      previousMemberId: '5TQ6306B',
      previousMemberName: '박수현',
      previousPartyId: 'democratic',
    },
    {
      electionId: '2026-06-03',
      district: '인천 연수구갑',
      region: '인천',
      vacancyReason: '박찬대 인천시장 출마 사퇴',
      previousMemberId: 'BT62420K',
      previousMemberName: '박찬대',
      previousPartyId: 'democratic',
    },
    {
      electionId: '2026-06-03',
      district: '울산 남구갑',
      region: '울산',
      vacancyReason: '김상욱 울산시장 출마 사퇴',
      previousMemberId: 'VDN5593C',
      previousMemberName: '김상욱',
      previousPartyId: 'democratic',
    },
    {
      electionId: '2026-06-03',
      district: '전북 군산시김제시부안군을',
      region: '전북',
      vacancyReason: '이원택 전북도지사 출마 사퇴',
      previousMemberId: 'DAV7257X',
      previousMemberName: '이원택',
      previousPartyId: 'democratic',
    },
    {
      electionId: '2026-06-03',
      district: '광주 광산구을',
      region: '광주',
      vacancyReason: '민형배 전남광주통합특별시장 출마 사퇴',
      previousMemberId: 'VRY5522V',
      previousMemberName: '민형배',
      previousPartyId: 'democratic',
    },
    {
      electionId: '2026-06-03',
      district: '제주 서귀포시',
      region: '제주',
      vacancyReason: '위성곤 제주도지사 출마 사퇴',
      previousMemberId: 'RQQ3807K',
      previousMemberName: '위성곤',
      previousPartyId: 'democratic',
    },
  ];

  for (const d of pendingDistricts) {
    const resolvedMemberId = await resolveMemberId(d.previousMemberId);
    const resolvedPartyId = await resolvePartyId(d.previousPartyId);

    const data = {
      electionId: d.electionId,
      district: d.district,
      region: d.region,
      vacancyReason: d.vacancyReason,
      previousMemberId: resolvedMemberId,
      previousMemberName: d.previousMemberName,
      previousPartyId: resolvedPartyId,
      confirmed: true,
      status: 'upcoming',
    };

    await prisma.electionDistrict.upsert({
      where: {
        electionId_district: { electionId: d.electionId, district: d.district },
      },
      update: data,
      create: data,
    });
  }

  console.log(`✅ 사퇴 예정 선거구 시드 완료: ${pendingDistricts.length}곳`);

  // ──────────────────────────────────────────────
  // 추가 사퇴 예정 선거구 (미확정)
  // ──────────────────────────────────────────────
  // { district: '대구 ???',  vacancyReason: '추경호 or 유영하 대구시장 출마 사퇴', 4/26 본경선 결과 발표 후 확정 }
  // ──────────────────────────────────────────────
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
