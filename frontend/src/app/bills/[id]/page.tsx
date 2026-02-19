import type { Metadata } from "next";
import { getBill } from "@/lib/api";
import CongressWrapper from "@/common/CongressWrapper";
import BillDetailInner from "@/components/bills/BillDetailInner";
import BillDetailSkeleton from "@/components/skeletons/BillDetailSkeleton";
import BillJsonLd from "@/components/seo/BillJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

interface BillDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BillDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const bill = await getBill(id);
  if (!bill) return { title: "법안 정보 없음" };

  const description = `${bill.title} — ${bill.proposerName} 외 ${bill.coProposerCount}인 발의`;

  return {
    title: bill.title,
    description,
    openGraph: {
      title: `${bill.title} | 법안 상세`,
      description,
    },
  };
}

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const { id } = await params;

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
      <CongressWrapper fallback={<BillDetailSkeleton />}>
        <BillDetailInner id={id} />
      </CongressWrapper>
    </>
  );
}
