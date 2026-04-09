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
        "@type": "Legislation",
        name: bill.title,
        dateCreated: bill.proposedDate || undefined,
        description: bill.summary || `${bill.proposerName} 외 ${bill.coProposerCount}인 발의`,
        url: `https://www.lawmake.kr/bills/${id}`,
        legislationIdentifier: id,
        legislationPassedBy: {
          "@type": "GovernmentOrganization",
          name: "대한민국 국회",
        },
        author: {
          "@type": "Person",
          name: bill.proposerName,
        },
      }}
    />
  );
}
