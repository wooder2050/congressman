import type { Metadata } from "next";
import { getBills } from "@/lib/api";
import BillListClient from "@/components/bills/BillListClient";

export const metadata: Metadata = {
  title: "법안 목록",
  description: "대수별 국회의원 발의 법안 목록을 확인하세요.",
};

interface BillsPageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function BillsPage({ searchParams }: BillsPageProps) {
  const params = await searchParams;
  const termId = Number(params.term) || 22;
  const { bills } = await getBills({ termId });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-2xl font-bold">법안 목록</h1>
      <BillListClient bills={bills} />
    </div>
  );
}
