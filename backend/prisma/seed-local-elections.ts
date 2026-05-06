import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding local election data...');

  // 1. LocalElection 생성
  await prisma.localElection.upsert({
    where: { id: 'local-2026' },
    update: {
      name: '제9회 전국동시지방선거',
      electionDate: new Date('2026-06-03'),
      description:
        '2026년 6월 3일 실시되는 제9회 전국동시지방선거. 광역단체장 17명, 기초단체장 226명, 교육감 17명, 광역의원·기초의원을 선출합니다.',
      status: 'upcoming',
      ordinal: 9,
    },
    create: {
      id: 'local-2026',
      name: '제9회 전국동시지방선거',
      electionDate: new Date('2026-06-03'),
      description:
        '2026년 6월 3일 실시되는 제9회 전국동시지방선거. 광역단체장 17명, 기초단체장 226명, 교육감 17명, 광역의원·기초의원을 선출합니다.',
      status: 'upcoming',
      ordinal: 9,
    },
  });

  // 2. 광역단체장 17개 race
  const governorRaces = [
    { sido: '서울특별시', displayName: '서울특별시장' },
    { sido: '부산광역시', displayName: '부산광역시장' },
    { sido: '대구광역시', displayName: '대구광역시장' },
    { sido: '인천광역시', displayName: '인천광역시장' },
    { sido: '광주광역시', displayName: '광주광역시장' },
    { sido: '대전광역시', displayName: '대전광역시장' },
    { sido: '울산광역시', displayName: '울산광역시장' },
    { sido: '세종특별자치시', displayName: '세종특별자치시장' },
    { sido: '경기도', displayName: '경기도지사' },
    { sido: '강원특별자치도', displayName: '강원특별자치도지사' },
    { sido: '충청북도', displayName: '충청북도지사' },
    { sido: '충청남도', displayName: '충청남도지사' },
    { sido: '전북특별자치도', displayName: '전북특별자치도지사' },
    { sido: '전라남도', displayName: '전라남도지사' },
    { sido: '경상북도', displayName: '경상북도지사' },
    { sido: '경상남도', displayName: '경상남도지사' },
    { sido: '제주특별자치도', displayName: '제주특별자치도지사' },
  ];

  for (const race of governorRaces) {
    await prisma.localElectionRace.upsert({
      where: {
        electionId_electionType_sido_sigungu_district: {
          electionId: 'local-2026',
          electionType: 'governor',
          sido: race.sido,
          sigungu: '',
          district: '',
        },
      },
      update: { displayName: race.displayName },
      create: {
        electionId: 'local-2026',
        electionType: 'governor',
        sido: race.sido,
        sigungu: '',
        district: '',
        displayName: race.displayName,
        sgTypecode: '2',
      },
    });
  }

  console.log(`[Seed] Created ${governorRaces.length} governor races`);

  // 3. 교육감 17개 race
  const superintendentRaces = governorRaces.map((r) => ({
    sido: r.sido,
    displayName: `${r.sido} 교육감`,
  }));

  for (const race of superintendentRaces) {
    await prisma.localElectionRace.upsert({
      where: {
        electionId_electionType_sido_sigungu_district: {
          electionId: 'local-2026',
          electionType: 'superintendent',
          sido: race.sido,
          sigungu: '',
          district: '',
        },
      },
      update: { displayName: race.displayName },
      create: {
        electionId: 'local-2026',
        electionType: 'superintendent',
        sido: race.sido,
        sigungu: '',
        district: '',
        displayName: race.displayName,
        sgTypecode: '10',
      },
    });
  }

  console.log(`[Seed] Created ${superintendentRaces.length} superintendent races`);

  // 4. 기초단체장 (~226개 시군구)
  const mayorRaces: { sido: string; sigungu: string }[] = [
    // 서울 (25구)
    ...[
      '종로구',
      '중구',
      '용산구',
      '성동구',
      '광진구',
      '동대문구',
      '중랑구',
      '성북구',
      '강북구',
      '도봉구',
      '노원구',
      '은평구',
      '서대문구',
      '마포구',
      '양천구',
      '강서구',
      '구로구',
      '금천구',
      '영등포구',
      '동작구',
      '관악구',
      '서초구',
      '강남구',
      '송파구',
      '강동구',
    ].map((g) => ({ sido: '서울특별시', sigungu: g })),
    // 부산 (15구 1군)
    ...[
      '중구',
      '서구',
      '동구',
      '영도구',
      '부산진구',
      '동래구',
      '남구',
      '북구',
      '해운대구',
      '사하구',
      '금정구',
      '강서구',
      '연제구',
      '수영구',
      '사상구',
      '기장군',
    ].map((g) => ({ sido: '부산광역시', sigungu: g })),
    // 대구 (7구 2군 — 군위군 2023년 편입)
    ...['중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군', '군위군'].map(
      (g) => ({ sido: '대구광역시', sigungu: g }),
    ),
    // 인천 (8구 2군)
    ...[
      '중구',
      '동구',
      '미추홀구',
      '연수구',
      '남동구',
      '부평구',
      '계양구',
      '서구',
      '강화군',
      '옹진군',
    ].map((g) => ({ sido: '인천광역시', sigungu: g })),
    // 광주 (5구)
    ...['동구', '서구', '남구', '북구', '광산구'].map((g) => ({ sido: '광주광역시', sigungu: g })),
    // 대전 (5구)
    ...['동구', '중구', '서구', '유성구', '대덕구'].map((g) => ({
      sido: '대전광역시',
      sigungu: g,
    })),
    // 울산 (4구 1군)
    ...['중구', '남구', '동구', '북구', '울주군'].map((g) => ({ sido: '울산광역시', sigungu: g })),
    // 경기 (28시 3군)
    ...[
      '수원시',
      '성남시',
      '의정부시',
      '안양시',
      '부천시',
      '광명시',
      '평택시',
      '동두천시',
      '안산시',
      '고양시',
      '과천시',
      '구리시',
      '남양주시',
      '오산시',
      '시흥시',
      '군포시',
      '의왕시',
      '하남시',
      '용인시',
      '파주시',
      '이천시',
      '안성시',
      '김포시',
      '화성시',
      '광주시',
      '양주시',
      '포천시',
      '여주시',
      '연천군',
      '가평군',
      '양평군',
    ].map((g) => ({ sido: '경기도', sigungu: g })),
    // 강원 (7시 11군)
    ...[
      '춘천시',
      '원주시',
      '강릉시',
      '동해시',
      '태백시',
      '속초시',
      '삼척시',
      '홍천군',
      '횡성군',
      '영월군',
      '평창군',
      '정선군',
      '철원군',
      '화천군',
      '양구군',
      '인제군',
      '고성군',
      '양양군',
    ].map((g) => ({ sido: '강원특별자치도', sigungu: g })),
    // 충북 (3시 8군)
    ...[
      '청주시',
      '충주시',
      '제천시',
      '보은군',
      '옥천군',
      '영동군',
      '증평군',
      '진천군',
      '괴산군',
      '음성군',
      '단양군',
    ].map((g) => ({ sido: '충청북도', sigungu: g })),
    // 충남 (8시 7군)
    ...[
      '천안시',
      '공주시',
      '보령시',
      '아산시',
      '서산시',
      '논산시',
      '계룡시',
      '당진시',
      '금산군',
      '부여군',
      '서천군',
      '청양군',
      '홍성군',
      '예산군',
      '태안군',
    ].map((g) => ({ sido: '충청남도', sigungu: g })),
    // 전북 (6시 8군)
    ...[
      '전주시',
      '군산시',
      '익산시',
      '정읍시',
      '남원시',
      '김제시',
      '완주군',
      '진안군',
      '무주군',
      '장수군',
      '임실군',
      '순창군',
      '고창군',
      '부안군',
    ].map((g) => ({ sido: '전북특별자치도', sigungu: g })),
    // 전남 (5시 17군)
    ...[
      '목포시',
      '여수시',
      '순천시',
      '나주시',
      '광양시',
      '담양군',
      '곡성군',
      '구례군',
      '고흥군',
      '보성군',
      '화순군',
      '장흥군',
      '강진군',
      '해남군',
      '영암군',
      '무안군',
      '함평군',
      '영광군',
      '장성군',
      '완도군',
      '진도군',
      '신안군',
    ].map((g) => ({ sido: '전라남도', sigungu: g })),
    // 경북 (10시 12군 — 군위군은 2023년 대구 편입)
    ...[
      '포항시',
      '경주시',
      '김천시',
      '안동시',
      '구미시',
      '영주시',
      '영천시',
      '상주시',
      '문경시',
      '경산시',
      '의성군',
      '청송군',
      '영양군',
      '영덕군',
      '청도군',
      '고령군',
      '성주군',
      '칠곡군',
      '예천군',
      '봉화군',
      '울진군',
      '울릉군',
    ].map((g) => ({ sido: '경상북도', sigungu: g })),
    // 경남 (8시 10군)
    ...[
      '창원시',
      '진주시',
      '통영시',
      '사천시',
      '김해시',
      '밀양시',
      '거제시',
      '양산시',
      '의령군',
      '함안군',
      '창녕군',
      '고성군',
      '남해군',
      '하동군',
      '산청군',
      '함양군',
      '거창군',
      '합천군',
    ].map((g) => ({ sido: '경상남도', sigungu: g })),
    // 제주특별자치도는 기초자치단체 없음 (제주시·서귀포시는 행정시)
  ];

  let mayorCount = 0;
  for (const race of mayorRaces) {
    // 종로구 → 종로구청장, 기장군 → 기장군수, 수원시 → 수원시장
    let displayName: string;
    if (race.sigungu.endsWith('구')) {
      displayName = race.sigungu.slice(0, -1) + '구청장';
    } else if (race.sigungu.endsWith('군')) {
      displayName = race.sigungu.slice(0, -1) + '군수';
    } else {
      displayName = race.sigungu.slice(0, -1) + '시장';
    }
    await prisma.localElectionRace.upsert({
      where: {
        electionId_electionType_sido_sigungu_district: {
          electionId: 'local-2026',
          electionType: 'mayor',
          sido: race.sido,
          sigungu: race.sigungu,
          district: '',
        },
      },
      update: { displayName },
      create: {
        electionId: 'local-2026',
        electionType: 'mayor',
        sido: race.sido,
        sigungu: race.sigungu,
        district: '',
        displayName,
        sgTypecode: '3',
      },
    });
    mayorCount++;
  }

  console.log(`[Seed] Created ${mayorCount} mayor races`);

  // 5. 광역의원 시도별 정수 시드
  // 출처: 공직선거법 별표2 (개정 2026.4.22) — 지역구 750명 + 증원정수 4명 = 754명
  // 서울 103, 경기 146은 법령/뉴스로 교차 확인 완료
  // 나머지는 2022년(제8회) 대비 증원분을 반영한 추정치 (5/14 NEC 동기화 시 정확한 데이터로 대체)
  const metroCouncilByDo: { sido: string; count: number; verified: boolean }[] = [
    { sido: '서울특별시', count: 103, verified: true },
    { sido: '부산광역시', count: 47, verified: false },
    { sido: '대구광역시', count: 29, verified: false },
    { sido: '인천광역시', count: 37, verified: false },
    { sido: '광주광역시', count: 22, verified: false },
    { sido: '대전광역시', count: 19, verified: false },
    { sido: '울산광역시', count: 19, verified: false },
    { sido: '세종특별자치시', count: 17, verified: false },
    { sido: '경기도', count: 146, verified: true },
    { sido: '강원특별자치도', count: 42, verified: false },
    { sido: '충청북도', count: 30, verified: false },
    { sido: '충청남도', count: 38, verified: false },
    { sido: '전북특별자치도', count: 35, verified: false },
    { sido: '전라남도', count: 52, verified: false },
    { sido: '경상북도', count: 55, verified: false },
    { sido: '경상남도', count: 52, verified: false },
    { sido: '제주특별자치도', count: 11, verified: false },
  ];

  let metroCouncilCount = 0;
  for (const entry of metroCouncilByDo) {
    // 시도별 "제1선거구" ~ "제N선거구" 형태로 placeholder race 생성
    for (let i = 1; i <= entry.count; i++) {
      const district = `제${i}선거구`;
      await prisma.localElectionRace.upsert({
        where: {
          electionId_electionType_sido_sigungu_district: {
            electionId: 'local-2026',
            electionType: 'metro-council',
            sido: entry.sido,
            sigungu: '',
            district,
          },
        },
        update: {},
        create: {
          electionId: 'local-2026',
          electionType: 'metro-council',
          sido: entry.sido,
          sigungu: '',
          district,
          displayName: `${entry.sido} ${district}`,
          sgTypecode: '4',
        },
      });
      metroCouncilCount++;
    }
  }

  console.log(`[Seed] Created ${metroCouncilCount} metro-council races`);

  // 6. 광역단체장 후보 시드 (5/6 기준 확정 후보)
  const governorCandidates = [
    {
      sido: '서울특별시',
      name: '오세훈',
      partyId: 'ppp',
      career: '현 서울특별시장 (3선)\n전 16·17대 국회의원',
    },
    { sido: '부산광역시', name: '박형준', partyId: 'ppp', career: '현 부산광역시장' },
    {
      sido: '대구광역시',
      name: '추경호',
      partyId: 'ppp',
      career: '전 22대 국회의원 (대구 달성)\n전 국민의힘 원내대표\n전 경제부총리',
    },
    {
      sido: '인천광역시',
      name: '유정복',
      partyId: 'ppp',
      career: '현 인천광역시장\n전 안전행정부 장관',
    },
    { sido: '울산광역시', name: '김두겸', partyId: 'ppp', career: '현 울산광역시장' },
    { sido: '세종특별자치시', name: '최민호', partyId: 'ppp', career: '현 세종특별자치시장' },
    {
      sido: '경기도',
      name: '양향자',
      partyId: 'ppp',
      career: '전 21대 국회의원\n전 더불어민주당 최고위원',
    },
    { sido: '강원특별자치도', name: '김진태', partyId: 'ppp', career: '현 강원특별자치도지사' },
    { sido: '충청북도', name: '김영환', partyId: 'ppp', career: '현 충청북도지사' },
    { sido: '충청남도', name: '김태흠', partyId: 'ppp', career: '현 충청남도지사' },
    { sido: '경상북도', name: '이철우', partyId: 'ppp', career: '현 경상북도지사 (3선)' },
    { sido: '경상남도', name: '박완수', partyId: 'ppp', career: '현 경상남도지사' },
  ];

  let governorCandidateCount = 0;
  for (const c of governorCandidates) {
    const race = await prisma.localElectionRace.findUnique({
      where: {
        electionId_electionType_sido_sigungu_district: {
          electionId: 'local-2026',
          electionType: 'governor',
          sido: c.sido,
          sigungu: '',
          district: '',
        },
      },
    });
    if (!race) {
      console.warn(`⚠️ governor race not found: ${c.sido}`);
      continue;
    }
    await prisma.localElectionCandidate.upsert({
      where: { raceId_name: { raceId: race.id, name: c.name } },
      update: { partyId: c.partyId, career: c.career, status: 'nominated' },
      create: {
        raceId: race.id,
        name: c.name,
        partyId: c.partyId,
        career: c.career,
        status: 'nominated',
      },
    });
    governorCandidateCount++;
  }

  console.log(`[Seed] Created/updated ${governorCandidateCount} governor candidates`);

  console.log('[Seed] Local election seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
