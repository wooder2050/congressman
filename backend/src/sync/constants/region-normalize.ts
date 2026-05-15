/**
 * NEC API 응답의 시도/시군구 명칭 정규화.
 *
 * NEC가 일부 데이터에서 표기 변종을 보내는 케이스(예: 행정구역 통합 가안, 특례시
 * 신표기 등)를 표준 명칭으로 매핑한다. 행정코드 기반 canonical routing이 도입되기
 * 전까지의 1차 방어선 역할.
 */

/** NEC 응답에 잡힌 표기 변종 → 표준 시도명 */
const SIDO_ALIAS: Record<string, string> = {
  // 행정구역 개편 가안(미실시)으로 데이터에 일시적으로 등장한 통합 시도명
  전남광주통합특별시: '전라남도',
};

/** NEC 응답에 잡힐 수 있는 시군구 표기 변종 → 표준 시군구명 */
const SIGUNGU_ALIAS: Record<string, string> = {
  // 특례시 표기 변종(공식 명칭은 유지하되, 일부 데이터에서 줄여 보낸 경우)
  수원특례시: '수원시',
  용인특례시: '용인시',
  고양특례시: '고양시',
  창원특례시: '창원시',
};

export function normalizeSido(raw: string | null | undefined): string {
  const value = (raw ?? '').trim();
  if (!value) return value;
  return SIDO_ALIAS[value] ?? value;
}

export function normalizeSigungu(raw: string | null | undefined): string {
  const value = (raw ?? '').trim();
  if (!value) return value;
  // 괄호로 추가 정보가 붙은 경우 본 명칭만 추출 ("강남구(서울)" → "강남구")
  const stripped = value.replace(/\s*\(.*?\)\s*$/, '');
  return SIGUNGU_ALIAS[stripped] ?? stripped;
}
