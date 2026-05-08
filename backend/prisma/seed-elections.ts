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
        '6·3 지방선거와 동시에 실시되는 국회의원 재보궐선거. 4월 29일 여야 의원 9명(민주 8명 + 국힘 추경호)이 일괄 사퇴하며 14곳이 최종 확정되었습니다. 5월 6일 민주당이 13곳 공천(군산김제부안갑 김의겸·을 박지원·광주 광산을 임문영·대구 달성 박형룡·제주 서귀포 김성범 등 전략공천 5명 발표)을 마무리, 충남 공주부여청양만 남았습니다. 조국·한동훈·송영길·이광재·박지원 등 당대표급 거물들이 격돌하는 역대급 미니 총선입니다.',
      status: 'upcoming',
    },
    create: {
      id: '2026-06-03',
      name: '6·3 재보궐선거',
      electionDate: new Date('2026-06-03'),
      description:
        '6·3 지방선거와 동시에 실시되는 국회의원 재보궐선거. 4월 29일 여야 의원 9명(민주 8명 + 국힘 추경호)이 일괄 사퇴하며 14곳이 최종 확정되었습니다. 5월 6일 민주당이 13곳 공천(군산김제부안갑 김의겸·을 박지원·광주 광산을 임문영·대구 달성 박형룡·제주 서귀포 김성범 등 전략공천 5명 발표)을 마무리, 충남 공주부여청양만 남았습니다. 조국·한동훈·송영길·이광재·박지원 등 당대표급 거물들이 격돌하는 역대급 미니 총선입니다.',
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

  // 3. 사퇴 확정 선거구 (4/29 여야 의원 9명 일괄 사직 완료)
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

  console.log(`✅ 사퇴 확정 선거구 시드 완료: ${pendingDistricts.length}곳`);

  // 4. 추경호 대구시장 출마 사퇴 (4/29 사퇴 완료)
  const additionalDistricts = [
    {
      electionId: '2026-06-03',
      district: '대구 달성군',
      region: '대구',
      vacancyReason: '추경호 대구시장 출마 사퇴',
      previousMemberId: 'QWO5765L',
      previousMemberName: '추경호',
      previousPartyId: 'ppp',
    },
  ];

  for (const d of additionalDistricts) {
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

  console.log(`✅ 추가 선거구 시드 완료: ${additionalDistricts.length}곳`);

  // 5. 후보자 시드
  const candidates = [
    // 인천 계양을
    {
      district: '인천 계양구을',
      name: '김남준',
      partyId: 'democratic',
      career: '전 청와대 대변인\n전 대통령비서실 선임행정관',
    },
    // 충남 아산을
    { district: '충남 아산시을', name: '김민경', partyId: 'ppp', career: '국민의힘 아산시을 후보' },
    {
      district: '충남 아산시을',
      name: '전은수',
      partyId: 'democratic',
      career: '전 대통령비서실 대변인\n언론인 출신',
    },
    // 경기 안산갑
    {
      district: '경기 안산시갑',
      name: '김석훈',
      partyId: 'ppp',
      career: '전 안산시의회 의장\n국민의힘 경기도당 수석대변인',
    },
    {
      district: '경기 안산시갑',
      name: '김남국',
      partyId: 'democratic',
      career:
        '전 대통령비서실 국민디지털소통비서관\n전 22대 국회의원 (경기 안산시단원구갑)\n민주당 대변인',
    },
    // 경기 평택을
    {
      district: '경기 평택시을',
      name: '조국',
      partyId: 'rebuilding',
      career: '조국혁신당 대표\n전 법무부 장관\n전 청와대 민정수석',
      memberIdRef: null,
    },
    {
      district: '경기 평택시을',
      name: '유의동',
      partyId: 'ppp',
      career:
        '전 국민의힘 정책위의장\n21대 국회의원 (경기 평택시을)\n20대 국회의원 (경기 평택시을)',
      memberIdRef: 'MRK4871S',
    },
    {
      district: '경기 평택시을',
      name: '김용남',
      partyId: 'democratic',
      career:
        '전 19대 국회의원 (경기 평택시)\n전 한나라당 경기도당위원장\n보수 출신 민주당 전략공천',
    },
    {
      district: '경기 평택시을',
      name: '김재연',
      partyId: 'progressive',
      career: '진보당 상임대표\n전 19대 국회의원 (비례)',
    },
    {
      district: '경기 평택시을',
      name: '황교안',
      partyId: 'freedom-innovation',
      career: '자유와혁신 대표\n전 국무총리\n전 자유한국당 대표',
    },
    // 전북 군산김제부안갑
    {
      district: '전북 군산시김제시부안군갑',
      name: '오지성',
      partyId: 'ppp',
      career: '전 군산·김제·부안갑 당협위원장',
    },
    // 경기 하남갑
    {
      district: '경기 하남시갑',
      name: '이광재',
      partyId: 'democratic',
      career: '전 강원도지사\n전 3선 국회의원\n전 열린우리당 최고위원',
    },
    // 부산 북구갑
    {
      district: '부산 북구갑',
      name: '한동훈',
      partyId: 'independent',
      career: '전 국민의힘 대표\n전 법무부 장관',
    },
    {
      district: '부산 북구갑',
      name: '하정우',
      partyId: 'democratic',
      career: '전 대통령비서실 AI미래기획수석\n법조인 출신',
    },
    {
      district: '부산 북구갑',
      name: '박민식',
      partyId: 'ppp',
      career:
        '전 국가보훈부 장관\n전 20대 국회의원 (부산 북구갑)\n5월 5일 국민의힘 경선 승리 (이영풍과 2인 경선)',
    },
    // 인천 연수갑
    {
      district: '인천 연수구갑',
      name: '송영길',
      partyId: 'democratic',
      career: '전 더불어민주당 대표\n20대 국회의원 (인천 연수구갑)\n전 인천시장',
      memberIdRef: 'PAO22428',
    },
    // 울산 남구갑
    {
      district: '울산 남구갑',
      name: '전태진',
      partyId: 'democratic',
      career: '변호사\n더불어민주당 1호 전략공천',
    },
    // 광주 광산을
    {
      district: '광주 광산구을',
      name: '신지혜',
      partyId: 'basic-income',
      career: '전 기본소득당 대표\n기본소득당 최고위원',
    },
    // === 5/6 추가: 민주당 전략공천 5명 ===
    // 전북 군산김제부안갑
    {
      district: '전북 군산시김제시부안군갑',
      name: '김의겸',
      partyId: 'democratic',
      career:
        '전 21대 국회의원 (전북 군산시)\n전 청와대 대변인\n5월 6일 민주당 전략공천',
      memberIdRef: 'FIC9046Z',
    },
    // 전북 군산김제부안을
    {
      district: '전북 군산시김제시부안군을',
      name: '박지원',
      partyId: 'democratic',
      career:
        '민주당 최고위원\n전 22대 국회의원 (전남 해남완도진도)\n전 국가정보원장\n5월 6일 민주당 전략공천',
      memberIdRef: '8BF5855P',
    },
    // 광주 광산을
    {
      district: '광주 광산구을',
      name: '임문영',
      partyId: 'democratic',
      career:
        '국가인공지능전략위원회 상근부위원장\n언론인 출신\n5월 6일 민주당 전략공천',
    },
    // 대구 달성군
    {
      district: '대구 달성군',
      name: '박형룡',
      partyId: 'democratic',
      career: '민주당 대구 달성군 지역위원장\n5월 6일 민주당 전략공천',
    },
    // 제주 서귀포
    {
      district: '제주 서귀포시',
      name: '김성범',
      partyId: 'democratic',
      career: '전 해양수산부 차관\n5월 6일 민주당 전략공천',
    },
    // === 5/6 추가: 국민의힘 단수공천 ===
    // 인천 계양을
    {
      district: '인천 계양구을',
      name: '심왕섭',
      partyId: 'ppp',
      career: '국민의힘 인천 계양을 단수공천',
    },
    // 인천 연수갑
    {
      district: '인천 연수구갑',
      name: '박종진',
      partyId: 'ppp',
      career: '국민의힘 인천 연수갑 단수공천',
    },
    // 경기 하남갑
    {
      district: '경기 하남시갑',
      name: '이용',
      partyId: 'ppp',
      career: '국민의힘 경기 하남갑 단수공천\n전 21대 국회의원 (비례)',
    },
    // 울산 남구갑
    {
      district: '울산 남구갑',
      name: '김태규',
      partyId: 'ppp',
      career: '국민의힘 울산 남구갑 단수공천',
    },
    // 광주 광산을
    {
      district: '광주 광산구을',
      name: '안태욱',
      partyId: 'ppp',
      career: '국민의힘 광주 광산을 단수공천',
    },
    // 제주 서귀포
    {
      district: '제주 서귀포시',
      name: '고기철',
      partyId: 'ppp',
      career: '국민의힘 제주 서귀포 단수공천',
    },
    // 대구 달성
    {
      district: '대구 달성군',
      name: '이진숙',
      partyId: 'ppp',
      career: '국민의힘 대구 달성군 단수공천\n전 방송통신위원장',
    },
  ];

  for (const c of candidates) {
    const districtRecord = await prisma.electionDistrict.findUnique({
      where: { electionId_district: { electionId: '2026-06-03', district: c.district } },
    });
    if (!districtRecord) {
      console.warn(`⚠️ 선거구 미발견: ${c.district}`);
      continue;
    }
    const resolvedPartyId = await resolvePartyId(c.partyId);
    const resolvedMemberIdRef = await resolveMemberId((c as any).memberIdRef ?? null);
    await prisma.candidate.upsert({
      where: { districtId_name: { districtId: districtRecord.id, name: c.name } },
      update: {
        partyId: resolvedPartyId,
        career: c.career,
        status: 'nominated',
        memberIdRef: resolvedMemberIdRef,
      },
      create: {
        districtId: districtRecord.id,
        name: c.name,
        partyId: resolvedPartyId,
        career: c.career,
        status: 'nominated',
        memberIdRef: resolvedMemberIdRef,
      },
    });
  }

  console.log(`✅ 후보자 시드 완료: ${candidates.length}명`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
