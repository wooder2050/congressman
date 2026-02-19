import { getBill } from "@/lib/api";
import JsonLd from "./JsonLd";

interface BillJsonLdProps {
  id: string;
}

export default async function BillJsonLd({ id }: BillJsonLdProps) {
  const bill = await getBill(id);
  if (!bill) return null;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "LegislationObject",
        name: bill.title,
        legislationDate: bill.proposedDate || undefined,
        description: bill.summary || `${bill.proposerName} 외 ${bill.coProposerCount}인 발의`,
        url: `https://www.lawmake.kr/bills/${id}`,
        author: {
          "@type": "Person",
          name: bill.proposerName,
        },
      }}
    />
  );
}
