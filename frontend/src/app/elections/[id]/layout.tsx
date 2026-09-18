import { notFound } from "next/navigation";
import { getElection } from "@/lib/api";

interface Props {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * 존재하지 않는 선거 ID(/elections/1999-01-01 …)를 하위 라우트 전체에서 404로 막는다.
 * /regions/[sido]는 지역명만 검사해 선거 존재 여부는 보지 못했고, page.tsx의 검사는
 * 하위 URL에 적용되지 않는다(codex 리뷰 2026-09-18). 설명은 local-elections/[year]/layout.tsx 참고.
 */
export default async function ElectionLayout({ children, params }: Props) {
  const { id } = await params;
  const election = await getElection(id);
  if (!election) notFound();
  return children;
}
