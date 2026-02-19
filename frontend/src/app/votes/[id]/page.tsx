import type { Metadata } from "next";
import { getVoteMemberVotes } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import VoteDetailInner from "@/components/votes/VoteDetailInner";
import VoteDetailSkeleton from "@/components/skeletons/VoteDetailSkeleton";
import VoteJsonLd from "@/components/seo/VoteJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

interface VoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: VoteDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getVoteMemberVotes(id);
  if (!data) return { title: "표결 정보 없음" };

  const { vote } = data;
  const description = `${vote.billName} 본회의 표결 결과 — 찬성 ${vote.yesCount}, 반대 ${vote.noCount}, 기권 ${vote.abstainCount}`;

  return {
    title: vote.billName,
    description,
    openGraph: {
      title: `${vote.billName} | 표결 상세`,
      description,
    },
  };
}

export default async function VoteDetailPage({ params }: VoteDetailPageProps) {
  const { id } = await params;

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
      <CongressWrapper fallback={<VoteDetailSkeleton />}>
        <VoteDetailInner id={id} />
      </CongressWrapper>
    </>
  );
}
