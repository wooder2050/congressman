import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVoteMemberVotes } from "@/lib/api";
import VoteDetailInner from "@/components/votes/VoteDetailInner";
import VoteJsonLd from "@/components/seo/VoteJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const revalidate = 21600; // 6h
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

  return {
    title: `${vote.billName} - 표결 결과`,
    description,
    alternates: { canonical: `https://www.lawmake.kr/votes/${id}` },
    openGraph: {
      title: `${vote.billName} | 국회 본회의 표결`,
      description,
      url: `https://www.lawmake.kr/votes/${id}`,
      images: [`https://www.lawmake.kr/api/share/vote-card?voteId=${id}`],
    },
    twitter: { card: "summary", title: `${vote.billName} 표결 결과`, description },
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
