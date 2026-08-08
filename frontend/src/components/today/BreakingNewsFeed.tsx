import Link from "next/link";
import { getBreakingNews } from "@/lib/api";

const CATEGORY_STYLE: Record<string, { label: string; className: string }> = {
  committee: { label: "국회", className: "bg-amber-500 text-white" },
  election: { label: "선거", className: "bg-rose-500 text-white" },
  legislation: { label: "입법", className: "bg-blue-500 text-white" },
  politics: { label: "정치", className: "bg-violet-500 text-white" },
};

/** 한 번에 펼쳐 보여줄 최근 속보 수 (나머지는 제목만) */
const DETAILED_COUNT = 8;

/**
 * 오늘의 국회 — 속보 피드.
 *
 * 홈 배너는 제목과 요약만 보여주므로, 편집팀이 정리한 항목별 상세(items)와
 * 출처(sources)를 실제로 읽을 수 있는 곳이 필요하다. 이 컴포넌트가 그 역할을 한다.
 */
export default async function BreakingNewsFeed() {
  const news = await getBreakingNews();
  if (news.length === 0) return null;

  const detailed = news.slice(0, DETAILED_COUNT);
  const older = news.slice(DETAILED_COUNT);

  return (
    <section>
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-xl font-bold text-(--color-text-primary)">속보</h2>
        <span className="text-xs text-(--color-text-tertiary)">총 {news.length}건</span>
      </div>
      <p className="mb-4 text-sm text-(--color-text-secondary)">
        lawmake 편집팀이 국회 회의록·공공데이터와 언론 보도를 교차 확인해 정리한 소식입니다.
      </p>

      <div className="space-y-4">
        {detailed.map((item) => {
          const cat = CATEGORY_STYLE[item.category] ?? CATEGORY_STYLE.politics;
          return (
            <article
              key={item.id}
              className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4 sm:p-5"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${cat.className}`}
                >
                  {cat.label}
                </span>
                <time className="text-xs text-(--color-text-tertiary)">{item.date}</time>
              </div>

              <h3 className="mt-2 leading-snug font-bold text-(--color-text-primary)">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">
                {item.description}
              </p>

              {item.items && item.items.length > 0 && (
                <dl className="mt-4 space-y-2 rounded-lg bg-(--color-bg-secondary) p-3">
                  {item.items.map((d) => (
                    <div key={d.label} className="sm:flex sm:gap-3">
                      <dt className="shrink-0 text-xs font-bold text-(--color-text-primary) sm:w-28">
                        {d.memberId ? (
                          <Link
                            href={`/members/${d.memberId}?term=22`}
                            className="text-(--color-primary) no-underline hover:underline"
                          >
                            {d.label}
                          </Link>
                        ) : (
                          d.label
                        )}
                      </dt>
                      <dd className="mt-0.5 text-sm leading-relaxed text-(--color-text-secondary) sm:mt-0 sm:flex-1">
                        {d.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {item.sources && item.sources.length > 0 && (
                <div className="mt-3 border-t border-(--color-border-primary) pt-3">
                  <p className="text-xs font-semibold text-(--color-text-tertiary)">관련 보도</p>
                  <ul className="mt-1.5 space-y-1">
                    {item.sources.map((s) => (
                      <li key={s.url}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-(--color-primary) no-underline hover:underline"
                        >
                          {s.title} →
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {older.length > 0 && (
        <details className="mt-4 rounded-xl border border-(--color-border-primary) bg-(--color-bg-primary) p-4">
          <summary className="cursor-pointer text-sm font-semibold text-(--color-text-primary)">
            지난 속보 {older.length}건 더 보기
          </summary>
          <ul className="mt-3 space-y-2">
            {older.map((item) => (
              <li key={item.id} className="flex gap-2 text-sm">
                <time className="shrink-0 text-xs text-(--color-text-tertiary)">{item.date}</time>
                <span className="text-(--color-text-secondary)">{item.title}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
