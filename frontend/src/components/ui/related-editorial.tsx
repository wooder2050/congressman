import Link from "next/link";

export interface RelatedEditorialLink {
  label: string;
  href: string;
  /** "분석" = 주간뉴스 기사, "용어" = 용어사전 */
  kind: "분석" | "용어";
}

/**
 * 트래픽이 있는 데이터 페이지(일정·표결·위원회)에서
 * 자체 편집 콘텐츠(분석 기사·용어 해설)로 연결하는 소형 링크 블록.
 */
export default function RelatedEditorial({
  title = "함께 보면 좋은 해설",
  links,
}: {
  title?: string;
  links: RelatedEditorialLink[];
}) {
  if (links.length === 0) return null;
  return (
    <aside className="rounded-xl border border-(--color-border-primary) bg-(--color-bg-secondary) p-4">
      <h2 className="text-sm font-bold text-(--color-text-primary)">{title}</h2>
      <ul className="mt-2 space-y-1.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group inline-flex items-baseline gap-2 text-sm no-underline"
            >
              <span className="shrink-0 rounded bg-(--color-bg-primary) px-1.5 py-0.5 text-[11px] font-semibold text-(--color-text-tertiary)">
                {l.kind}
              </span>
              <span className="text-(--color-text-secondary) group-hover:text-(--color-primary) group-hover:underline">
                {l.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
