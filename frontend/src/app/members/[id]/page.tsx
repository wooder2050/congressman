import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getMember,
  getMemberTerms,
  getMemberScorecard,
  getAttendance,
  getMemberVotes,
  getBills,
} from "@/lib/api";
import { getElectedLabel } from "@/lib/utils";
import MemberDetailInner from "@/components/members/MemberDetailInner";
import MemberActivitySummaryView from "@/components/members/MemberActivitySummaryView";
import MemberJsonLd from "@/components/seo/MemberJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

// ISR 24h — daily sync 주기와 일치. searchParams(term/tab)는 MemberDetailInner가
// 클라이언트에서 읽으므로 페이지는 정적으로 캐시된다. 22대 활동 요약을 서버에서
// 렌더링해 초기 HTML에 싣는다: 검색 유입의 75%인 네이버는 JS 렌더링이 보수적이라
// CSR 본문이 의원 이름 검색에 잡히지 않던 문제의 대응 (2026-08 레드팀 검수).
// 비용: 현직 300명 × 1회/일 재생성 — 지선 인시던트(수만 페이지)의 1% 규모.
// 배포 후 1주 Vercel Observability에서 읽기:쓰기 비율 확인할 것.
export const revalidate = 86400;

// 빈 배열을 반환해 첫 방문 시 ISR로 정적 생성되도록 한다 (bills/[id]와 동일 패턴).
export function generateStaticParams() {
  return [];
}

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
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

  // 본회의 표결 참여·대표발의 모두 0건이면 thin-content로 판정해 noindex.
  // AdSense "가치가 별로 없는 콘텐츠" 거절 대응 — 활동 데이터가 없는 의원
  // 페이지가 사이트 평균 품질을 끌어내리는 것을 방지.
  const isInactive =
    !!scorecard &&
    scorecard.voteParticipation.rate === 0 &&
    scorecard.billProposal.representativeCount === 0;

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
    robots: isInactive ? { index: false, follow: true } : undefined,
  };
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { id } = await params;

  const [member, memberTerms] = await Promise.all([getMember(id), getMemberTerms(id)]);

  if (!member) notFound();

  // 22대 활동 요약 데이터를 서버에서 조회 (실패해도 페이지는 뜨도록 fail-open —
  // summarySlot이 없으면 MemberDetailInner가 클라이언트 쿼리 경로로 대체)
  const term22 = memberTerms.find((mt) => mt.termId === 22);
  const summaryData = term22
    ? await Promise.all([
        getAttendance({ memberId: id, termId: 22 }),
        getMemberVotes({ memberId: id, termId: 22, limit: 1 }),
        getBills({ memberId: id, termId: 22, role: "representative", limit: 1 }),
      ]).catch(() => null)
    : null;

  const summarySlot =
    term22 && summaryData && summaryData[0] ? (
      <MemberActivitySummaryView
        memberName={member.name}
        memberTerm={term22}
        attendance={summaryData[0]}
        voteSummary={summaryData[1].summary}
        billTotal={summaryData[2].total}
      />
    ) : null;

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
        member={member}
        memberTerms={memberTerms}
        summarySlot={summarySlot}
      />
    </>
  );
}
