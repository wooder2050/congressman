import type { CandidateDisclosure } from "@/types";

interface Props {
  data: CandidateDisclosure;
  /** 카드용 컴팩트 모드 — 한 줄 요약만 노출 */
  compact?: boolean;
}

/** "717243000" (원 문자열) → "7억 1,724만원" */
function formatWon(value: string | null): string | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n === 0) return "0원";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const eok = Math.floor(abs / 100000000);
  const remAfterEok = abs - eok * 100000000;
  const man = Math.floor(remAfterEok / 10000);
  const rem = remAfterEok - man * 10000;

  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok.toLocaleString()}억`);
  if (man > 0) parts.push(`${man.toLocaleString()}만`);
  if (rem > 0 && eok === 0 && man === 0) parts.push(rem.toLocaleString());
  if (parts.length === 0) return "0원";
  return `${sign}${parts.join(" ")}원`;
}

export default function CandidateDisclosureSection({ data, compact }: Props) {
  const asset = formatWon(data.assetDeclared);
  const taxPaid = formatWon(data.taxPaid);
  const overdue5y = formatWon(data.taxOverdue5y);
  const overdueNow = formatWon(data.taxOverdueCurrent);

  const hasAny =
    asset !== null ||
    data.militaryService !== null ||
    taxPaid !== null ||
    data.criminalRecord !== null ||
    data.electionCount !== null;
  if (!hasAny) return null;

  if (compact) {
    const items: string[] = [];
    if (asset) items.push(`재산 ${asset}`);
    if (data.criminalRecord && data.criminalRecord !== "없음")
      items.push(`전과 ${data.criminalRecord}`);
    if (data.militaryService) items.push(data.militaryService);
    if (items.length === 0) return null;
    return <p className="mt-2 text-[11px] text-(--color-text-tertiary)">{items.join(" · ")}</p>;
  }

  return (
    <div className="mt-3 rounded-lg border border-(--color-border-secondary) bg-(--color-bg-secondary) p-3">
      <h4 className="mb-2 text-xs font-bold text-(--color-text-tertiary)">후보자정보공개자료</h4>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        {asset && (
          <>
            <dt className="text-(--color-text-tertiary)">재산신고액</dt>
            <dd className="font-medium text-(--color-text-primary)">{asset}</dd>
          </>
        )}
        {data.militaryService && (
          <>
            <dt className="text-(--color-text-tertiary)">병역</dt>
            <dd className="text-(--color-text-primary)">{data.militaryService}</dd>
          </>
        )}
        {taxPaid && (
          <>
            <dt className="text-(--color-text-tertiary)">최근 5년 납세</dt>
            <dd className="text-(--color-text-primary)">{taxPaid}</dd>
          </>
        )}
        {overdue5y && overdue5y !== "0원" && (
          <>
            <dt className="text-(--color-text-tertiary)">5년 체납</dt>
            <dd className="text-orange-600 dark:text-orange-400">{overdue5y}</dd>
          </>
        )}
        {overdueNow && overdueNow !== "0원" && (
          <>
            <dt className="text-(--color-text-tertiary)">현 체납</dt>
            <dd className="text-red-600 dark:text-red-400">{overdueNow}</dd>
          </>
        )}
        {data.criminalRecord && (
          <>
            <dt className="text-(--color-text-tertiary)">전과</dt>
            <dd
              className={
                data.criminalRecord === "없음"
                  ? "text-(--color-text-primary)"
                  : "font-bold text-red-600 dark:text-red-400"
              }
            >
              {data.criminalRecord}
            </dd>
          </>
        )}
        {data.electionCount !== null && (
          <>
            <dt className="text-(--color-text-tertiary)">입후보 횟수</dt>
            <dd className="text-(--color-text-primary)">{data.electionCount}회</dd>
          </>
        )}
      </dl>
      <p className="mt-2 text-[10px] text-(--color-text-tertiary)">
        출처: 중앙선거관리위원회 (선거일까지 공개, 목적 외 사용 금지)
      </p>
    </div>
  );
}
