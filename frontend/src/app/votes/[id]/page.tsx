import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVoteMemberVotes } from "@/lib/api";
import VoteDetailInner from "@/components/votes/VoteDetailInner";
import VoteJsonLd from "@/components/seo/VoteJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { CURATION_MODE } from "@/lib/curation-mode";

// 30d — 표결 결과는 종료 후 확정되어 바뀌지 않는다(법안과 달리 나중에 채워지는 필드도 없다).
// 봇 재크롤링마다 재생성되던 ISR Write를 줄이려고 2d에서 상향했다.
export const revalidate = 2592000;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

interface VoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: VoteDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getVoteMemberVotes(id);
  if (!data) return { title: "표결 정보 없음" };

  const { vote } = data;
  const resultText =
    vote.resultCode === "passed" || vote.resultCode === "amended" ? "가결" : "부결";
  const description = `${vote.billName} 본회의 표결 결과: ${resultText} (찬성 ${vote.yesCount}, 반대 ${vote.noCount}, 기권 ${vote.abstainCount}). 의원별 투표 내역을 확인하세요.`;

  // 같은 법안이 여러 차례 표결되면 billName만으로는 제목이 완전히 겹친다.
  // (예: 「초·중등교육법 일부개정법률안(대안)(교육위원장)」은 22대에서만 7회 표결)
  // 네이버 서치어드바이저가 title 중복 616건을 경고했고, 그중 다수가 이 라우트였다.
  // 표결일과 결과를 붙여 페이지마다 고유한 제목이 되게 한다.
  const title = vote.procDate
    ? `${vote.billName} 표결 결과 (${vote.procDate} ${resultText})`
    : `${vote.billName} 표결 결과 (${resultText})`;

  return {
    title,
    description,
    // 큐레이션 모드(AdSense 심사 기간)에는 표결 상세를 색인에서 뺀다 —
    // 자동 집계 페이지라 sitemap에서도 제외하므로 신호를 맞춘다.
    robots: CURATION_MODE ? { index: false, follow: true } : undefined,
    alternates: { canonical: `https://www.lawmake.kr/votes/${id}` },
    openGraph: {
      title: `${title} | 국회 본회의`,
      description,
      url: `https://www.lawmake.kr/votes/${id}`,
      images: [`https://www.lawmake.kr/api/share/vote-card?voteId=${id}`],
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function VoteDetailPage({ params }: VoteDetailPageProps) {
  const { id } = await params;
  const data = await getVoteMemberVotes(id);

  if (!data) notFound();

  return (
    <>
      <VoteJsonLd id={id} />
      <BreadcrumbJsonLd
        items={[
          { name: "홈", href: "/" },
          { name: "표결 목록", href: "/votes" },
          { name: "표결 상세", href: `/votes/${id}` },
        ]}
      />
      <VoteDetailInner id={id} data={data} />
    </>
  );
}
