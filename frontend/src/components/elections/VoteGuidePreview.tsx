import Link from "next/link";

export default function VoteGuidePreview({ electionId }: { electionId: string }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">투표 안내</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
          <p className="text-xs font-semibold text-(--color-text-tertiary)">사전투표</p>
          <p className="mt-1 text-lg font-bold">5/29(금)~30(토)</p>
          <p className="mt-1 text-xs text-(--color-text-secondary)">전국 어디서나 · 06:00~18:00</p>
        </div>
        <div className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
          <p className="text-xs font-semibold text-(--color-text-tertiary)">본투표</p>
          <p className="mt-1 text-lg font-bold">6/3(수)</p>
          <p className="mt-1 text-xs text-(--color-text-secondary)">
            주소지 관할 투표소 · 06:00~18:00
          </p>
        </div>
        <Link
          href={`/elections/${electionId}/vote`}
          className="flex flex-col items-center justify-center rounded-xl border border-(--color-primary) bg-blue-50 p-4 text-center transition-colors hover:bg-blue-100"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-(--color-primary)"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <span className="mt-2 text-sm font-semibold text-(--color-primary)">
            투표 안내 자세히 보기
          </span>
          <span className="text-xs text-(--color-text-tertiary)">준비물 · 절차 · FAQ</span>
        </Link>
      </div>
    </section>
  );
}
