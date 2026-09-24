// 의원 상세 검색 제목 실험 (2026-09-24 시작).
// 네이버에서 의원 페이지는 노출이 크지만 인물명 단독 검색 순위가 7~12위라 CTR이 0.1% 미만이다.
// 반면 "OO 재산", "OO 의정활동"처럼 수식어가 붙은 검색은 1~3위로 클릭된다.
// 의원 절반의 title 앞쪽에 수식어(의정활동·재산·표결)를 넣고, 서치어드바이저 URL별 CTR을
// 나머지 절반과 2~3주 비교한다. 그룹은 의원 ID로 결정적으로 나눠 재배포해도 바뀌지 않는다.

export function isMemberTitleVariant(memberId: string): boolean {
  let hash = 0;
  for (let i = 0; i < memberId.length; i++) {
    hash = (hash * 31 + memberId.charCodeAt(i)) >>> 0;
  }
  return hash % 2 === 1;
}
