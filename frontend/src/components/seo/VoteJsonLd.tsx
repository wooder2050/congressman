import { getVoteMemberVotes } from "@/lib/api";
import JsonLd from "./JsonLd";

interface VoteJsonLdProps {
  id: string;
}

export default async function VoteJsonLd({ id }: VoteJsonLdProps) {
  const data = await getVoteMemberVotes(id);
  if (!data) return null;

  const { vote } = data;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "VoteAction",
        name: `${vote.billName} 본회의 표결`,
        startTime: vote.procDate || undefined,
        description: `찬성 ${vote.yesCount}, 반대 ${vote.noCount}, 기권 ${vote.abstainCount} — ${vote.procResult}`,
        url: `https://www.lawmake.kr/votes/${id}`,
        result: {
          "@type": "Thing",
          name: vote.procResult,
        },
        agent: {
          "@type": "GovernmentOrganization",
          name: "대한민국 국회",
        },
        location: {
          "@type": "Place",
          name: "대한민국 국회 본회의장",
          address: {
            "@type": "PostalAddress",
            streetAddress: "의사당대로 1",
            addressLocality: "서울특별시",
            addressRegion: "영등포구",
            postalCode: "07233",
            addressCountry: "KR",
          },
        },
        object: {
          "@type": "Legislation",
          name: vote.billName,
          legislationIdentifier: vote.billNo,
        },
      }}
    />
  );
}
