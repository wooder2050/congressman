import type { Metadata } from "next";
import { sidoToShort } from "@/constants/local-elections";
import { getLocalElectionSigunguNames } from "@/lib/api";
import RegionSidoPage from "../../page";

// `?sigungu=` 주소를 middleware가 이 경로로 rewrite한다(브라우저 주소는 그대로).
// 시도 페이지와 같은 화면이지만 제목·설명·canonical에 시군구를 넣어 네이버 중복 진단(2026-10-20 1,124건)을 푼다.
// searchParams를 읽으면 ISR이 깨져 500(DYNAMIC_SERVER_USAGE)이 나므로 경로 파라미터로 받는다.
export const revalidate = 2592000; // 30d — 시도 페이지와 동일(개표 종료 후 DB 무변경)
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ year: string; sido: string; sigungu: string }>;
}

async function isKnownSigungu(year: string, sido: string, sigungu: string) {
  try {
    const names = await getLocalElectionSigunguNames(`local-${year}`, sido);
    return names.includes(sigungu);
  } catch {
    return false;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, sido: rawSido, sigungu: rawSigungu } = await params;
  const sido = decodeURIComponent(rawSido);
  const sigungu = decodeURIComponent(rawSigungu);
  const short = sidoToShort(sido);
  const base = `https://www.lawmake.kr/local-elections/${year}/regions/${encodeURIComponent(sido)}`;

  // 목록에 없는 값(오타·임의 쿼리)은 시도 페이지 메타 그대로 — 임의 문자열이 제목에 실리지 않게
  if (!(await isKnownSigungu(year, sido, sigungu))) {
    return {
      title: `${short} 지방선거 — ${year} 전체 선거 현황`,
      description: `${year}년 ${sido} 지방선거 전체 선거구 현황을 확인하세요. 광역단체장·기초단체장·교육감·광역의원·기초의원 후보자 정보.`,
      alternates: { canonical: base },
    };
  }

  return {
    title: `${short} ${sigungu} 지방선거 — ${year} 선거 현황`,
    description: `${year}년 ${sido} ${sigungu} 지방선거 선거구 현황을 확인하세요. 기초단체장·광역의원·기초의원 후보자와 ${short} 광역단체장·교육감 정보.`,
    alternates: { canonical: `${base}?sigungu=${encodeURIComponent(sigungu)}` },
  };
}

export default async function RegionSigunguPage({ params }: Props) {
  const { year, sido } = await params;
  return <RegionSidoPage params={Promise.resolve({ year, sido })} />;
}
