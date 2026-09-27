import { BILL_INDEX_CURATED, CURATION_MODE } from "@/lib/curation-mode";
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
 * 2026-09-27 단계적 해제: 색인은 위 기준(BILL_INDEX_CURATED=false), 광고는 큐레이션 모드가 켜져 있는 동안
 * 회의록 발언 인용·편집자 해설이 붙은 법안만(isBillAdEligible). 광고는 색인 기준 안에서만 허용한다(fail-closed).
 */
function hasCuratedDiscussion(bill: BillDetail): boolean {
  return !!bill.discussion && bill.discussion.quotes.length > 0;
}

function meetsIndexBaseline(bill: BillDetail): boolean {
  return (
    !!bill.simpleSummary &&
    !!bill.hasVote &&
    (!!bill.progress?.lawResult || !!bill.progress?.plenaryDate)
  );
}

export function isBillIndexable(bill: BillDetail): boolean {
  return BILL_INDEX_CURATED ? hasCuratedDiscussion(bill) : meetsIndexBaseline(bill);
}

/**
 * 광고 허용 여부 — 2026-09-27부터 색인과 분리. 큐레이션 모드(환경변수)에서는 회의록 인용 법안만,
 * 해제되면 색인 기준과 같다. 광고는 색인보다 넓어지지 않는다(색인 기준도 함께 요구).
 */
export function isBillAdEligible(bill: BillDetail): boolean {
  if (!isBillIndexable(bill)) return false;
  return CURATION_MODE ? hasCuratedDiscussion(bill) : true;
}
