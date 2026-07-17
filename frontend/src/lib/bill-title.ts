/**
 * 법안 제목 고유화 유틸.
 *
 * 배경(2026-07 AdSense thin/scaled content 대응): 색인 대상 법안 6,039개 중 고유 제목은
 * 1,701개뿐 — "조세특례제한법 일부개정법률안" 하나만 331건처럼 제목이 대량 중복된다.
 * 내용(simpleSummary)은 각각 다르지만 title·H1·메타가 거의 동일해 검색엔진이 중복 페이지로
 * 판정한다. simpleSummary 첫 문장에서 핵심구를 뽑아 각 페이지에 고유한 접두구를 부여한다.
 */

const AMENDMENT_SUFFIXES = [
  "일부개정법률안",
  "전부개정법률안",
  "폐지법률안",
  "제정법률안",
  "개정법률안",
  "법률안",
];

/** "소득세법 일부개정법률안" → "소득세법" 처럼 정형 접미어를 떼어 법 이름만 남긴다. */
export function shortBillLawName(title: string): string {
  let name = title.trim();
  for (const suffix of AMENDMENT_SUFFIXES) {
    if (name.endsWith(suffix)) {
      name = name.slice(0, -suffix.length).trim();
      break;
    }
  }
  return name || title;
}

/**
 * 문자열을 maxLen 코드포인트로 제한하되, 가능하면 단어(공백) 경계에서 자른다.
 * 메타 description처럼 문장 중간·이모지 절단을 피해야 하는 곳에 쓴다.
 */
export function truncateAtWord(text: string, maxLen: number): string {
  const chars = Array.from(text.trim());
  if (chars.length <= maxLen) return text.trim();
  let sliced = chars.slice(0, maxLen).join("");
  const lastSpace = sliced.lastIndexOf(" ");
  // 마지막 공백이 너무 앞이 아니면 그 지점까지만(단어 중간 절단 방지)
  if (lastSpace > maxLen * 0.6) {
    sliced = sliced.slice(0, lastSpace);
  }
  return sliced.trim() + "…";
}

/**
 * simpleSummary에서 제목에 쓸 짧은 핵심구를 뽑는다.
 * 첫 문장(마침표 기준)을 취하고 최대 maxLen자로 자른다. 없으면 null.
 */
export function billSummaryHeadline(
  simpleSummary: string | null | undefined,
  maxLen = 45,
): string | null {
  if (!simpleSummary) return null;
  const cleaned = simpleSummary.trim();
  if (!cleaned) return null;

  // 첫 문장만 사용 (요약은 대개 "…합니다."로 끝나는 한 문장 구조).
  // 단 "1. 벤처투자…" 같은 번호 목록의 "N." 은 문장 끝이 아니므로 분리 지점에서 제외
  // (숫자 바로 뒤 마침표는 lookbehind에서 걸러 headline이 "1"로 축약되는 것을 막는다).
  const firstSentence = cleaned.split(/(?<=[^0-9][.!?])\s|\n/)[0].trim();
  let head = firstSentence || cleaned;

  // 문장 끝 서술 어미·마침표 제거로 제목형으로 다듬는다.
  head = head.replace(/(합니다|됩니다|입니다|한다|된다)?[.!?]?$/u, "").trim();

  // 선두 번호 매김("1. ", "1) ") 제거
  head = head.replace(/^\s*\d+[.)]\s*/, "").trim();

  if (head.length > maxLen) {
    // Array.from으로 코드포인트 단위 분할 → surrogate pair(이모지) 중간 절단 방지
    head = Array.from(head).slice(0, maxLen).join("").trim() + "…";
  }
  return head || null;
}

/**
 * 고유 H1/문서 제목 문자열을 만든다.
 * 요약 핵심구가 있으면 "핵심구 (법이름)", 없으면 원 제목을 그대로 반환.
 * 예: "친환경차 개소세 감면 4년 연장 (조세특례제한법)"
 *
 * headlineMax로 요약 핵심구 길이를 제한해, 최종 문자열이 길어져도 호출부가
 * 다시 자르지 않도록 한다(이중 절단으로 " (법이름"처럼 괄호가 깨지는 문제 방지).
 */
export function billDisplayTitle(
  title: string,
  simpleSummary: string | null | undefined,
  headlineMax = 45,
): string {
  const headline = billSummaryHeadline(simpleSummary, headlineMax);
  if (!headline) return title;
  const lawName = shortBillLawName(title);
  // 요약 핵심구가 법 이름을 이미 포함하면 중복 표기 방지
  if (lawName && !headline.includes(lawName)) {
    return `${headline} (${lawName})`;
  }
  return headline;
}
