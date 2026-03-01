import type { Metadata } from "next";
import { getMember, getMemberTerms } from "@/lib/api";
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
  const description = `${member.name} ${partyName} 국회의원${district ? ` (${district})` : ""}의 출석, 법안 발의, 표결, 재산 등 의정활동 정보`;

  return {
    title: `${member.name} 의원`,
    description,
    openGraph: {
      title: `${member.name} 의원 | 국회의원 의정활동 정보`,
      description,
      type: "profile",
    },
  };
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
      <CongressWrapper fallback={<MemberDetailSkeleton />}>
        <MemberDetailInner id={id} termId={termId} defaultTab={tab || "attendance"} />
      </CongressWrapper>
    </>
  );
}
