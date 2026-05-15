import Link from "next/link";

interface Props {
  sido?: string;
}

/**
 * 기초의원 비례대표는 NEC `PofelcddInfoInqireService` Open API에서 제공되지 않습니다.
 * 2018·2022·2026 모든 지방선거에서 sgTypecode=7 응답이 INFO-03(데이터 없음)으로 일관됩니다.
 * NEC 선거통계시스템·선거공보 도서관 등 공식 채널을 안내해 사용자가 공보를 직접 확인할 수
 * 있도록 합니다.
 */
export default function LocalProportionalNotice({ sido }: Props) {
  const necUrl =
    "https://info.nec.go.kr/main/showDocument.xhtml?electionId=0020260603&secondMenuId=CPRI03&topMenuId=CP";
  const libraryUrl = "https://library.nec.go.kr/neweps/3/1/paper.do";

  return (
    <section className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
      <div>
        <p className="text-xs font-bold text-amber-900 dark:text-amber-300">📢 데이터 안내</p>
        <h2 className="mt-1 text-base font-bold text-(--color-text-primary) sm:text-lg">
          {sido ? `${sido} 기초의원 비례대표 후보자 명부` : "기초의원 비례대표 후보자 명부"}는 현재
          lawmake에서 표시할 수 없습니다
        </h2>
      </div>

      <div className="space-y-2 text-sm leading-relaxed text-(--color-text-secondary)">
        <p>
          <strong className="font-semibold">선거 자체는 정상적으로 시행</strong>됩니다. 다만
          lawmake가 후보자 데이터를 받아오는 중앙선거관리위원회 공공데이터 OpenAPI(
          <code className="rounded bg-(--color-bg-tertiary) px-1 py-0.5 text-xs">
            PofelcddInfoInqireService
          </code>
          )에는 기초의원 비례대표 후보자 명부가{" "}
          <strong className="font-semibold">정책적으로 제공되지 않습니다</strong>. 2018·2022·2026년
          지방선거 모두 동일하게 <code>INFO-03</code> 응답이 반환되는 것을 확인했습니다.
        </p>
        <p>아래 NEC 공식 채널에서 정당별 비례 명부를 확인하실 수 있습니다.</p>
      </div>

      <ul className="space-y-2 text-sm">
        <li>
          <Link
            href={necUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-(--color-primary) underline hover:no-underline"
          >
            NEC 선거통계시스템 — 후보자 명부 →
          </Link>
          <span className="ml-2 text-xs text-(--color-text-tertiary)">
            경로: 후보자 &gt; 후보자 명부 &gt; 기초의원비례대표선거 &gt; 시도·구시군 선택
          </span>
        </li>
        <li>
          <Link
            href={libraryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-(--color-primary) underline hover:no-underline"
          >
            중앙선관위 선거공보 도서관 →
          </Link>
          <span className="ml-2 text-xs text-(--color-text-tertiary)">
            정당·후보자별 공식 공보(PDF) 열람
          </span>
        </li>
      </ul>

      <p className="text-xs text-(--color-text-tertiary)">
        ※ 6월 3일 본투표 후 NEC가 별도{" "}
        <Link
          href="https://www.data.go.kr/data/15000864/openapi.do"
          target="_blank"
          rel="noopener noreferrer"
          className="text-(--color-primary) underline hover:no-underline"
        >
          당선인 정보 API
        </Link>
        를 통해 비례 당선인을 공개하면 결과를 자동 반영할 예정입니다(공식 이관 시점에 따라 지연될 수
        있습니다).
      </p>
    </section>
  );
}
