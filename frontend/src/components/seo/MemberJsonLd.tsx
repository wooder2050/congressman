import { getMember, getMemberTerms } from "@/lib/api";
import JsonLd from "./JsonLd";

interface MemberJsonLdProps {
  id: string;
}

export default async function MemberJsonLd({ id }: MemberJsonLdProps) {
  const [member, terms] = await Promise.all([getMember(id), getMemberTerms(id)]);
  if (!member) return null;

  const currentTerm = terms.find((t) => t.termId === 22) ?? terms[0];

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    image: member.photoUrl || undefined,
    jobTitle: "제22대 국회의원",
    affiliation: currentTerm
      ? { "@type": "Organization", name: currentTerm.party.name }
      : undefined,
    url: `https://www.lawmake.kr/members/${id}`,
  };

  if (currentTerm?.committees?.length) {
    data.memberOf = currentTerm.committees.map((name) => ({
      "@type": "Organization",
      name,
    }));
  }

  if (currentTerm?.district) {
    data.address = {
      "@type": "PostalAddress",
      addressRegion: currentTerm.district,
      addressCountry: "KR",
    };
  }

  return <JsonLd data={data} />;
}
