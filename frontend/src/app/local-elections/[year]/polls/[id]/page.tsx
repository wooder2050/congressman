import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CongressWrapper from "@/common/CongressWrapper";
import LocalElectionBreadcrumb from "@/components/local-elections/LocalElectionBreadcrumb";
import LocalElectionSkeleton from "@/components/local-elections/LocalElectionSkeleton";
import PollDetailInner from "@/components/polls/PollDetailInner";
import { getPoll } from "@/lib/api";

export const revalidate = 600;
export const dynamicParams = true;

interface Props {
  params: Promise<{ year: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return { title: "여론조사 — 잘못된 요청" };
  }
  try {
    const poll = await getPoll(numericId);
    if (!poll) return { title: "여론조사를 찾을 수 없습니다" };
    const region = poll.sigungu ? `${poll.sido} ${poll.sigungu}` : poll.sido;
    return {
      title: `${poll.agency} · ${region} 여론조사 (${year})`,
      description: `${poll.pollName} — 표본 ${poll.sampleSize?.toLocaleString() ?? "-"}명, 응답률 ${poll.responseRate ?? "-"}%, 표본오차 ±${poll.marginOfError ?? "-"}%P`,
      alternates: {
        canonical: `https://www.lawmake.kr/local-elections/${year}/polls/${id}`,
      },
    };
  } catch {
    return { title: "여론조사 상세" };
  }
}

export default async function PollDetailPage({ params }: Props) {
  const { year, id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <LocalElectionBreadcrumb
        items={[
          { label: "제9회 전국동시지방선거", href: `/local-elections/${year}` },
          { label: "여론조사", href: `/local-elections/${year}/polls` },
          { label: "상세" },
        ]}
      />
      <CongressWrapper fallback={<LocalElectionSkeleton />}>
        <PollDetailInner id={numericId} year={year} />
      </CongressWrapper>
    </div>
  );
}
