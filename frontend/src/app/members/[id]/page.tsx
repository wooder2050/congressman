import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMember, getMemberTerms, getMemberScorecard } from "@/lib/api";
import { getElectedLabel } from "@/lib/utils";
import MemberDetailInner from "@/components/members/MemberDetailInner";
import MemberJsonLd from "@/components/seo/MemberJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string; tab?: string }>;
}

export async function generateMetadata({ params }: MemberDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const [member, terms, scorecard] = await Promise.all([
    getMember(id),
    getMemberTerms(id),
    getMemberScorecard({ memberId: id, termId: 22 }).catch(() => null),
  ]);
  if (!member) return { title: "의원 정보 없음" };

  const currentTerm = terms.find((t) => t.termId === 22) ?? terms[0];
  const partyName = currentTerm?.party.name ?? "";
  const district = currentTerm?.district ?? "";
  const location = currentTerm?.proportional ? "비례대표" : district || "비례대표";
  const electedLabel = getElectedLabel(currentTerm?.electedCount ?? member.electedCount);

  const statsSnippets: string[] = [];
  if (scorecard) {
    statsSnippets.push(`출석률 ${Math.round(scorecard.attendance.rate)}%`);
    statsSnippets.push(`법안 ${scorecard.billProposal.representativeCount}건 대표발의`);
    if (scorecard.billPassRate.passedCount > 0) {
      statsSnippets.push(`${scorecard.billPassRate.passedCount}건 통과`);
    }
    statsSnippets.push(`의정활동 ${scorecard.grade}등급`);
  }
  const statsText = statsSnippets.length > 0 ? ` ${statsSnippets.join(", ")}.` : "";

  const title = `${member.name} 의원 — ${partyName} ${location} · ${electedLabel} | 22대 국회`;
  const description = `${partyName} ${member.name} 의원 (${location}, ${electedLabel}).${statsText} 본회의 표결 기록, 재산 신고 내역까지 확인하세요.`;

  return {
    title,
    description,
    alternates: { canonical: `https://www.lawmake.kr/members/${id}` },
    openGraph: {
      title,
      description,
      type: "profile",
      url: `https://www.lawmake.kr/members/${id}`,
    },
    twitter: { card: "summary_large_image", title: `${member.name} 의원 의정활동`, description },
  };
}

export default async function MemberDetailPage({ params, searchParams }: MemberDetailPageProps) {
  const { id } = await params;
  const { term, tab } = await searchParams;
  const termId = Number(term) || 22;

  const [member, memberTerms] = await Promise.all([getMember(id), getMemberTerms(id)]);

  if (!member) notFound();

  return (
    <>
      <MemberJsonLd id={id} />
      <BreadcrumbJsonLd
        items={[
          { name: "홈", href: "/" },
          { name: "의원 목록", href: "/members" },
          { name: "의원 상세", href: `/members/${id}` },
        ]}
      />
      <MemberDetailInner
        id={id}
        termId={termId}
        defaultTab={tab || "attendance"}
        member={member}
        memberTerms={memberTerms}
      />
    </>
  );
}
