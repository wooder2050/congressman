import type { Metadata } from "next";
import { getMember, getMemberTerms } from "@/lib/api";
import { getElectedLabel } from "@/lib/utils";
import CongressWrapper from "@/common/CongressWrapper";
import MemberDetailInner from "@/components/members/MemberDetailInner";
import MemberDetailSkeleton from "@/components/skeletons/MemberDetailSkeleton";
import MemberJsonLd from "@/components/seo/MemberJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string; tab?: string }>;
}

export async function generateMetadata({ params }: MemberDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const [member, terms] = await Promise.all([getMember(id), getMemberTerms(id)]);
  if (!member) return { title: "의원 정보 없음" };

  const currentTerm = terms.find((t) => t.termId === 22) ?? terms[0];
  const partyName = currentTerm?.party.name ?? "";
  const district = currentTerm?.district ?? "";
  const location = currentTerm?.proportional ? "비례대표" : district || "비례대표";
  const electedLabel = getElectedLabel(currentTerm?.electedCount ?? member.electedCount);
  const title = `${member.name} 의원 — ${partyName} ${location} · ${electedLabel} | 22대 국회`;
  const description = `${partyName} 소속 ${member.name} 의원 (${location}, ${electedLabel})의 의정활동 정보. 출석률, 법안 발의 현황, 본회의 표결 기록, 재산 신고 내역을 확인하세요.`;

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

async function ServerMemberSummary({ id }: { id: string }) {
  let member, terms;
  try {
    [member, terms] = await Promise.all([getMember(id), getMemberTerms(id)]);
  } catch {
    return null;
  }
  if (!member) return null;
  const currentTerm = terms.find((t) => t.termId === 22) ?? terms[0];
  const partyName = currentTerm?.party.name ?? "";
  const district = currentTerm?.district ?? "";
  const termList = terms.map((t) => `${t.termId}대`).join(", ");
  return (
    <section className="sr-only" aria-hidden="true">
      <h1>{member.name} 국회의원</h1>
      <p>정당: {partyName}</p>
      {district && <p>지역구: {district}</p>}
      <p>선수: {termList}</p>
      {currentTerm?.committees && currentTerm.committees.length > 0 && (
        <p>소속 위원회: {currentTerm.committees.join(", ")}</p>
      )}
    </section>
  );
}

export default async function MemberDetailPage({ params, searchParams }: MemberDetailPageProps) {
  const { id } = await params;
  const { term, tab } = await searchParams;
  const termId = Number(term) || 22;

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
      <ServerMemberSummary id={id} />
      <CongressWrapper fallback={<MemberDetailSkeleton />}>
        <MemberDetailInner id={id} termId={termId} defaultTab={tab || "attendance"} />
      </CongressWrapper>
    </>
  );
}
