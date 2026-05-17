import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string; // 마지막 항목은 href 없이 현재 페이지로 표시
}

interface Props {
  items: BreadcrumbItem[];
}

/**
 * 지방선거 페이지 공통 breadcrumb.
 * 첫 번째 링크는 항상 "제9회 전국동시지방선거" 등 메인 페이지로 돌아갈 수 있도록 정한다.
 * 사용자가 한 단계 위·두 단계 위 페이지로 자연스럽게 복귀할 수 있게 한다.
 */
export default function LocalElectionBreadcrumb({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs leading-relaxed text-(--color-text-tertiary)">
      {/*
        inline 렌더링이라 줄바꿈 시 자연스럽게 wrap된다.
        flex로 묶으면 [구분자+텍스트] 단위가 wrap되면서 구분자가 다음 줄 앞에 떨어져 어색해진다.
      */}
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={`${item.label}-${idx}`}>
            {idx > 0 && (
              <span aria-hidden="true" className="mx-1.5">
                ›
              </span>
            )}
            {isLast || !item.href ? (
              <span className="text-(--color-text-secondary)">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-(--color-primary) hover:underline">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
