import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBill } from "@/lib/api";
import BillDetailInner from "@/components/bills/BillDetailInner";
import BillJsonLd from "@/components/seo/BillJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const revalidate = 21600; // 6h

interface BillDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BillDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const bill = await getBill(id);
  if (!bill) return { title: "법안 정보 없음" };

  const statusText =
    bill.status === "passed"
      ? "가결"
      : bill.status === "discarded"
        ? "폐기"
        : bill.status === "committee"
          ? "위원회 심사 중"
          : "계류";
  const coSuffix = bill.coProposerCount > 0 ? ` 외 ${bill.coProposerCount}인 발의` : " 발의";
  const shortTitle = bill.title.length > 40 ? bill.title.slice(0, 38) + "…" : bill.title;
  const title = `${shortTitle} — ${statusText} | ${bill.proposerName}${coSuffix}`;

  const descParts = [
    bill.simpleSummary || `${bill.title} (${statusText}).`,
    bill.topic ? `[${bill.topic}]` : "",
    `${bill.proposerName}${coSuffix}, ${bill.proposedDate}.`,
    "법안 원문, 심사 경과, 관련 표결 기록을 확인하세요.",
  ];
  const description = descParts.filter(Boolean).join(" ").slice(0, 160);

  return {
    title,
    description,
    robots: !bill.simpleSummary && !bill.summary ? { index: false, follow: true } : undefined,
    alternates: { canonical: `https://www.lawmake.kr/bills/${id}` },
    openGraph: {
      title,
      description,
      url: `https://www.lawmake.kr/bills/${id}`,
    },
    twitter: { card: "summary_large_image", title: shortTitle, description },
  };
}

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const { id } = await params;
  const bill = await getBill(id);

  if (!bill) notFound();

  return (
    <>
      <BillJsonLd id={id} />
      <BreadcrumbJsonLd
        items={[
          { name: "홈", href: "/" },
          { name: "법안 목록", href: "/bills" },
          { name: "법안 상세", href: `/bills/${id}` },
        ]}
      />
      <BillDetailInner bill={bill} />
    </>
  );
}
