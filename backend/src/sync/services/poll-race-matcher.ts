/**
 * 여론조사 race 자동 매칭 로직
 *
 * 입력: PDF에서 추출한 raceLabel (예: "서울시장", "경남도지사", "기장군수")
 *      + Poll 메타의 sido, sigungu
 * 출력: LocalElectionRace.id 또는 null
 *
 * 매칭 우선순위:
 *   1. raceLabel + sido로 displayName 일치하는 race 찾기 (가장 안전)
 *   2. sido + sigungu + electionType 추론 (예: "{시}{군수}" → mayor, sigungu={시}{군})
 *   3. 모두 실패 시 null → 관리자 수동 매칭 대기
 */

import type { PrismaClient } from '@prisma/client';

const SIDO_ALIASES: Record<string, string[]> = {
  서울: ['서울특별시'],
  서울특별시: ['서울특별시'],
  부산: ['부산광역시'],
  부산광역시: ['부산광역시'],
  대구: ['대구광역시'],
  인천: ['인천광역시'],
  광주: ['광주광역시'],
  대전: ['대전광역시'],
  울산: ['울산광역시'],
  세종: ['세종특별자치시'],
  경기: ['경기도'],
  경기도: ['경기도'],
  강원: ['강원특별자치도'],
  충북: ['충청북도'],
  충남: ['충청남도'],
  전북: ['전북특별자치도'],
  전남: ['전라남도'],
  경북: ['경상북도'],
  경남: ['경상남도'],
  제주: ['제주특별자치도'],
};

function normalizeSidoCandidates(sido: string): string[] {
  if (SIDO_ALIASES[sido]) return SIDO_ALIASES[sido];
  return [sido];
}

/** "경남도지사" → "경남" + "도지사" */
function splitRaceLabel(raceLabel: string): { sidoPrefix: string; suffix: string } | null {
  // "도지사" / "시장" / "군수" / "구청장" / "교육감"
  const m = raceLabel.match(/^(.+?)(도지사|시장|군수|구청장|교육감)$/);
  if (!m) return null;
  return { sidoPrefix: m[1].trim(), suffix: m[2] };
}

const ELECTION_TYPE_BY_SUFFIX: Record<string, string> = {
  도지사: 'governor',
  시장: 'mayor', // 광역시장 또는 일반 시장 — 추가 추론 필요
  군수: 'mayor',
  구청장: 'mayor', // 광역시 구청장은 mayor 타입
  교육감: 'superintendent',
};

/**
 * raceLabel + Poll 메타로 LocalElectionRace를 찾는다.
 *
 * fallback: raceLabel이 매칭 실패하거나 "미식별"이면 candidateName + Poll 메타로 race 추정.
 */
export async function matchRaceFromLabel(
  prisma: PrismaClient,
  params: {
    raceLabel: string;
    sido: string;
    sigungu: string;
    candidateName?: string | null;
  },
): Promise<number | null> {
  const { raceLabel, sido } = params;

  // Fallback 1: candidateName이 있고 Poll의 sido/sigungu로 race 좁힐 수 있을 때
  if ((!raceLabel || raceLabel === '미식별') && params.candidateName) {
    const pollSidoCandidates = normalizeSidoCandidates(sido);
    const cand = await prisma.localElectionCandidate.findFirst({
      where: {
        name: params.candidateName,
        race: {
          electionId: 'local-2026',
          sido: { in: pollSidoCandidates },
          ...(params.sigungu && params.sigungu !== '전체' ? { sigungu: params.sigungu } : {}),
        },
      },
      select: { raceId: true },
    });
    if (cand) return cand.raceId;
  }

  const split = splitRaceLabel(raceLabel);
  if (!split) return null;

  const electionType = ELECTION_TYPE_BY_SUFFIX[split.suffix];
  if (!electionType) return null;

  const candidateSidos = normalizeSidoCandidates(split.sidoPrefix);

  // governor·superintendent는 sigungu=''인 광역 단위 race
  if (electionType === 'governor' || electionType === 'superintendent') {
    for (const candidateSido of candidateSidos) {
      const race = await prisma.localElectionRace.findFirst({
        where: {
          electionId: 'local-2026',
          electionType,
          sido: candidateSido,
          sigungu: '',
        },
        select: { id: true },
      });
      if (race) return race.id;
    }
    return null;
  }

  // mayor: "서울시장"(governor=서울특별시장과 혼동 주의) / "수원시장" / "기장군수" / "강남구청장"
  // 광역시장의 경우 NESDC raceLabel="서울시장"은 governor 타입.
  // 우리 시스템에서는 "서울특별시장"이 governor electionType.
  if (electionType === 'mayor' && split.suffix === '시장') {
    // 1) governor로 시도 (서울/부산/대구/인천/광주/대전/울산 광역시장)
    for (const candidateSido of candidateSidos) {
      const govRace = await prisma.localElectionRace.findFirst({
        where: {
          electionId: 'local-2026',
          electionType: 'governor',
          sido: candidateSido,
          sigungu: '',
        },
        select: { id: true, displayName: true },
      });
      if (govRace && new RegExp(`^${split.sidoPrefix}.*시장$`).test(govRace.displayName)) {
        return govRace.id;
      }
    }
  }

  // 일반 시장·군수·구청장: Poll의 sido를 활용해 sigungu가 raceLabel prefix와 일치하는 race
  // raceLabel="수원시장" → sigungu="수원시"
  const targetSigungu = `${split.sidoPrefix}${split.suffix === '구청장' ? '구' : split.suffix === '군수' ? '군' : '시'}`;

  // Poll의 sido를 최우선으로 검색
  const pollSidoCandidates = normalizeSidoCandidates(sido);

  const race = await prisma.localElectionRace.findFirst({
    where: {
      electionId: 'local-2026',
      electionType: 'mayor',
      sido: { in: pollSidoCandidates },
      sigungu: targetSigungu,
    },
    select: { id: true },
  });
  return race?.id ?? null;
}
