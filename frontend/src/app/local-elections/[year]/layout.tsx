import { notFound } from "next/navigation";
import { getLocalElection } from "@/lib/api";

interface Props {
  children: React.ReactNode;
  params: Promise<{ year: string }>;
}

/**
 * 존재하지 않는 선거 연도(/local-elections/1999 …)를 하위 22개 라우트 전체에서 404로 막는다.
 *
 * page.tsx의 검사는 그 페이지에만 적용되고 /governor, /regions/[sido] 같은 하위 URL에는
 * 미치지 않는다(codex 리뷰 2026-09-18). 하위 페이지는 셸만 렌더하고 데이터는 클라이언트에서
 * 받는 구조라, 연도가 없어도 200으로 빈 페이지가 나가 검색엔진이 색인한다.
 *
 * ISR 30일짜리 라우트에서 404도 같이 캐시되지만, 새 선거는 시드+배포를 거쳐야 생기고
 * 배포마다 Full Route Cache가 새로 시작되므로 실무상 문제되지 않는다.
 */
export default async function LocalElectionLayout({ children, params }: Props) {
  const { year } = await params;
  const election = await getLocalElection(`local-${year}`);
  if (!election) notFound();
  return children;
}
