/**
 * REELE_GBN_NM (재선구분) → 당선 횟수 (정수)
 * API 반환값: "초선", "재선", "3선", "4선" ...
 */
export function parseElectedCount(reeleGbnNm: string | null): number {
  if (!reeleGbnNm) return 1;
  const trimmed = reeleGbnNm.trim();

  const map: Record<string, number> = {
    초선: 1,
    재선: 2,
    '3선': 3,
    '4선': 4,
    '5선': 5,
    '6선': 6,
    '7선': 7,
    '8선': 8,
    '9선': 9,
  };

  if (map[trimmed] !== undefined) return map[trimmed];

  const match = trimmed.match(/(\d+)선/);
  if (match) return parseInt(match[1], 10);

  return 1;
}
