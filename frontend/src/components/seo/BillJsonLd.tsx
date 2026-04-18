import { getBill } from "@/lib/api";
import JsonLd from "./JsonLd";

interface BillJsonLdProps {
  id: string;
}

const STATUS_MAP: Record<string, string> = {
  passed: "가결",
  pending: "계류",
  discarded: "폐기",
  committee: "위원회 심사 중",
};

export default async function BillJsonLd({ id }: BillJsonLdProps) {
  const bill = await getBill(id);
  if (!bill) return null;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Legislation",
    name: bill.title,
    dateCreated: bill.proposedDate || undefined,
    description: bill.summary || `${bill.proposerName} 외 ${bill.coProposerCount}인 발의`,
    url: `https://www.lawmake.kr/bills/${id}`,
    legislationIdentifier: id,
    legislationType: "Bill",
    legislationPassedBy: {
      "@type": "GovernmentOrganization",
      name: "대한민국 국회",
    },
    author: {
      "@type": "Person",
      name: bill.proposerName,
    },
  };

  if (bill.status) {
    data.legislationStatus = STATUS_MAP[bill.status] ?? bill.status;
  }

  if (bill.simpleSummary) {
    data.abstract = bill.simpleSummary;
  }

  return <JsonLd data={data} />;
}
