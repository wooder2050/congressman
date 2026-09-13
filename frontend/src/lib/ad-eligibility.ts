import { CURATION_MODE } from "@/lib/curation-mode";
import type { BillDetail } from "@/types";

/**
 * 법안 상세의 색인·광고 공통 판정.
 *
 * 색인 기준 = sitemap(getIndexableBillIds v3.2)과 동일:
 * AI 요약(simpleSummary) 보유 + 본회의 처리 도달(lawResult 또는 plenaryDate) + 표결 레코드 실존.
 * 본회의 표결 도달 법안에는 의원별 찬반·정당별 집계 등 원본(열린국회정보)에 조립된 형태로 없는
 * 데이터가 붙는다. 위원회 단계까지의 법안은 필드 나열 + 자동 요약뿐이라 색인 제외
 * (2026-08, AdSense "고유 콘텐츠" 기준 대응).
 * - hasVote까지 요구하는 이유: 무기명 재표결 등은 lawResult가 있어도 의원별 표결 데이터가 없어
 *   "고유 데이터" 논리가 성립하지 않는다(codex 리뷰 반영).
 * - plenaryDate 병행 인정: 법사위 소관 법안은 체계자구심사가 따로 없어 lawResult가 구조적으로
 *   NULL이라 이것만 요구하면 부당 배제된다(v3.2).
 *
 * 큐레이션 모드(AdSense 승인 전략, 2026-09-27까지 유지)에는 한 단계 더 좁혀 회의록 발언 인용과
 * 편집자 해설이 붙은 법안만 색인·광고한다. sitemap(curated-ids)과 동일 기준이다.
 *
 * 광고는 색인과 같은 판정을 쓴다(fail-closed) — 저가치 페이지를 광고 표면에서 확실히 제외하기 위해
 * 두 곳에서 조건을 따로 적지 않고 이 함수 하나를 공유한다.
 */
export function isBillIndexable(bill: BillDetail): boolean {
  if (CURATION_MODE) {
    return !!bill.discussion && bill.discussion.quotes.length > 0;
  }
  return (
    !!bill.simpleSummary &&
    !!bill.hasVote &&
    (!!bill.progress?.lawResult || !!bill.progress?.plenaryDate)
  );
}

/** 광고 허용 여부 — 색인 판정과 동일. 의미를 호출부에서 구분해 읽도록 이름만 분리한다. */
export const isBillAdEligible = isBillIndexable;
