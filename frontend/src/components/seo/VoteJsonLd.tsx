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
        "@type": "Event",
        name: `${vote.billName} 본회의 표결`,
        startDate: vote.procDate || undefined,
        description: `찬성 ${vote.yesCount}, 반대 ${vote.noCount}, 기권 ${vote.abstainCount} — ${vote.procResult}`,
        url: `https://www.lawmake.kr/votes/${id}`,
        location: {
          "@type": "Place",
          name: "대한민국 국회 본회의장",
        },
        organizer: {
          "@type": "Organization",
          name: "대한민국 국회",
        },
      }}
    />
  );
}
