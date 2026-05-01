"use client";

import Image from "next/image";
import Link from "next/link";
import { useCongressSuspenseQuery } from "@/hooks/useCongressQuery";
import { getElection } from "@/lib/api";
import type { ByElectionDetail, ElectionCandidate } from "@/types";
import { proxyPhotoUrl } from "@/lib/photo";

export default function CandidateCompareInner({
  electionId,
  districtId,
}: {
  electionId: string;
  districtId: number;
}) {
  const { data: election } = useCongressSuspenseQuery<ByElectionDetail | null, string>(
    getElection,
    electionId,
  );

  if (!election) return null;
  const district = election.districts.find((d) => d.id === districtId);
  if (!district) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-bold">선거구를 찾을 수 없습니다</p>
      </div>
    );
  }

  const { candidates } = district;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <section>
        <h1 className="text-2xl font-bold sm:text-3xl">{district.district} 후보 비교</h1>
        <p className="mt-1 text-sm text-(--color-text-secondary)">{district.vacancyReason}</p>
      </section>

      {candidates.length === 0 ? (
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) py-16 text-center">
          <p className="text-lg font-bold">아직 등록된 후보가 없습니다</p>
          <p className="mt-2 text-sm text-(--color-text-tertiary)">
            후보자 등록(5/14~15) 이후 업데이트됩니다.
          </p>
        </div>
      ) : (
        <>
          {/* 후보 요약 카드 */}
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.min(candidates.length, 4)}, minmax(0, 1fr))`,
            }}
          >
            {candidates.map((c) => (
              <CandidateSummaryCard key={c.id} candidate={c} />
            ))}
          </div>

          {/* 비교표 — 데스크톱 */}
          <div className="hidden overflow-x-auto sm:block">
            <CompareTable candidates={candidates} />
          </div>

          {/* 비교 아코디언 — 모바일 */}
          <div className="space-y-3 sm:hidden">
            <CompareAccordion candidates={candidates} />
          </div>
        </>
      )}
    </div>
  );
}

function CandidateSummaryCard({ candidate: c }: { candidate: ElectionCandidate }) {
  const partyColor = c.party?.color ?? "#9ca3af";
  return (
    <div
      className="rounded-xl border bg-(--color-bg-primary) p-4 text-center"
      style={{ borderColor: partyColor, borderTopWidth: "3px" }}
    >
      <div className="mx-auto h-16 w-16 overflow-hidden rounded-full">
        {c.photoUrl ? (
          <Image
            src={proxyPhotoUrl(c.photoUrl)}
            alt={c.name}
            width={64}
            height={64}
            className="object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: partyColor }}
          >
            {c.name.slice(0, 1)}
          </div>
        )}
      </div>
      <p className="mt-2 text-lg font-bold">{c.name}</p>
      <span
        className="mt-1 inline-block rounded px-2 py-0.5 text-xs font-bold text-white"
        style={{ backgroundColor: partyColor }}
      >
        {c.party?.name ?? "무소속"}
      </span>
      {c.memberIdRef && (
        <Link
          href={`/members/${c.memberIdRef}`}
          className="mt-2 block text-xs text-(--color-primary) hover:underline"
        >
          의정활동 보기 →
        </Link>
      )}
    </div>
  );
}

function CompareTable({ candidates }: { candidates: ElectionCandidate[] }) {
  const rows: { label: string; getValue: (c: ElectionCandidate) => string }[] = [
    { label: "정당", getValue: (c) => c.party?.name ?? "무소속" },
    { label: "생년월일", getValue: (c) => c.birthDate ?? "-" },
    {
      label: "주요 경력",
      getValue: (c) => (c.career ? c.career.split("\n").slice(0, 3).join(", ") : "-"),
    },
    { label: "학력", getValue: (c) => c.education ?? "-" },
    { label: "재산", getValue: (c) => c.assets ?? "-" },
    {
      label: "핵심 공약",
      getValue: (c) => (c.pledges.length > 0 ? c.pledges.map((p) => p.title).join(", ") : "-"),
    },
  ];

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-(--color-border-primary) bg-(--color-bg-secondary)">
          <th className="px-4 py-3 text-left text-xs font-semibold text-(--color-text-tertiary)">
            항목
          </th>
          {candidates.map((c) => (
            <th
              key={c.id}
              className="px-4 py-3 text-left text-xs font-semibold"
              style={{ borderTopWidth: "2px", borderTopColor: c.party?.color ?? "#9ca3af" }}
            >
              {c.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-(--color-border-primary) last:border-b-0">
            <td className="px-4 py-3 font-medium text-(--color-text-secondary)">{row.label}</td>
            {candidates.map((c) => (
              <td key={c.id} className="px-4 py-3 text-(--color-text-primary)">
                {row.getValue(c)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CompareAccordion({ candidates }: { candidates: ElectionCandidate[] }) {
  const sections = [
    {
      label: "정당 · 경력",
      render: (c: ElectionCandidate) => (
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">정당:</span> {c.party?.name ?? "무소속"}
          </p>
          <p>
            <span className="font-medium">경력:</span>{" "}
            {c.career ? c.career.split("\n").slice(0, 3).join(" / ") : "-"}
          </p>
          <p>
            <span className="font-medium">학력:</span> {c.education ?? "-"}
          </p>
        </div>
      ),
    },
    {
      label: "재산",
      render: (c: ElectionCandidate) => <p className="text-sm">{c.assets ?? "정보 없음"}</p>,
    },
    {
      label: "공약",
      render: (c: ElectionCandidate) =>
        c.pledges.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {c.pledges.map((p, i) => (
              <li key={i}>
                <span className="font-medium">{p.category}:</span> {p.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-(--color-text-tertiary)">공약 정보 없음</p>
        ),
    },
  ];

  return (
    <>
      {sections.map((section) => (
        <details key={section.label} className="group">
          <summary className="flex cursor-pointer items-center justify-between rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 text-sm font-bold hover:bg-(--color-bg-hover)">
            {section.label}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0 transition-transform group-open:rotate-180"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          <div className="mt-2 space-y-3">
            {candidates.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border bg-(--color-bg-primary) p-3"
                style={{
                  borderLeftWidth: "3px",
                  borderLeftColor: c.party?.color ?? "#9ca3af",
                }}
              >
                <p className="mb-1 text-xs font-bold text-(--color-text-secondary)">{c.name}</p>
                {section.render(c)}
              </div>
            ))}
          </div>
        </details>
      ))}
    </>
  );
}
