"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import BillListItem from "./BillListItem";
import { BILL_STATUS_MAP } from "@/lib/constants";
import type { Bill } from "@/types";

interface BillListClientProps {
  bills: Bill[];
}

const statusOptions = [
  { id: null, label: "전체" },
  ...Object.entries(BILL_STATUS_MAP).map(([id, info]) => ({ id, label: info.label })),
];

export default function BillListClient({ bills }: BillListClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!selectedStatus) return bills;
    return bills.filter((b) => b.status === selectedStatus);
  }, [bills, selectedStatus]);

  return (
    <div className="space-y-4">
      {/* 상태 필터 */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((opt) => (
          <Button
            key={opt.id ?? "all"}
            variant={selectedStatus === opt.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus(opt.id)}
            className="rounded-full px-4 text-sm font-semibold"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <p className="text-sm text-(--color-text-tertiary)">총 {filtered.length}건</p>

      {/* 법안 목록 */}
      {filtered.length === 0 ? (
        <div className="py-8 text-center text-(--color-text-tertiary)">해당 법안이 없습니다.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((bill) => (
            <BillListItem key={bill.id} bill={bill} />
          ))}
        </div>
      )}
    </div>
  );
}
