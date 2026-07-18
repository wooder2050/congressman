/**
 * 국무위원(국무총리·장관)을 겸직 중인 현역 국회의원 명단.
 *
 * 이들은 의원직을 유지하므로 현직 API에 계속 남지만(isActive=true), 실제 의정활동
 * (본회의 표결·법안 대표발의)이 저조해 평가 지표(scorecard)에서 부당하게 낮게 평가된다.
 * 따라서 랭킹·통계·색인에서 제외하고, 의원 상세에는 '겸직' 배지를 표시한다.
 *
 * ── 유지보수 ──
 * 국회 Open API(MEM_TITLE, 약력)는 국무총리는 "現) …국무총리"로 반영하지만 장관 겸직은
 * 반영이 늦어 자동 감지가 불완전하다. 그래서 이 명단을 정답(source of truth)으로 두고,
 * member sync가 매번 API 약력을 파싱해 이 명단과 대조한다(detectCabinetDrift). 새 겸직·복귀가
 * 감지되면 경고 로그를 남기므로, 로그를 보고 이 파일을 갱신하면 된다.
 *
 * key = 국회의원 코드(MONA_CD), value = 겸직 직책.
 * 겸직에서 물러나 의정활동에 복귀하면 해당 항목을 제거한다.
 *
 * 최종 확인: 2026-07-18 (이재명 정부, 위키백과 국무위원 명단 × DB 22대 의원 교차 검증)
 */
export const CABINET_MEMBERS: Record<string, string> = {
  V429892C: '법무부 장관', // 정성호 (경기 동두천·양주·연천갑)
  M0A1658U: '행정안전부 장관', // 윤호중 (경기 구리시)
  TST4507I: '국방부 장관', // 안규백 (서울 동대문구갑)
  ARP89147: '통일부 장관', // 정동영 (전북 전주시병)
  XSP20229: '기후에너지환경부 장관', // 김성환 (서울 노원구을)
  JZY9937U: '국토교통부 장관', // 김윤덕 (전북 전주시갑)
  S824682L: '기획예산처 장관', // 박홍근 (서울 중랑구을)
};

/**
 * 국회 약력(MEM_TITLE)에서 現(현) 국무총리·장관 겸직을 추출한다.
 * API 반영이 늦은 장관 겸직은 잡히지 않을 수 있으나(그래서 CABINET_MEMBERS가 정답),
 * 총리 등 API에 반영된 겸직을 대조해 명단 이탈(drift)을 감지하는 용도.
 * 반환: 직책 문자열(예: "국무총리", "법무부 장관") 또는 null.
 */
export function parseCabinetFromCareer(career: string | null | undefined): string | null {
  if (!career) return null;
  for (const line of career.split('\n')) {
    const m = line.match(/現\)?\s*(?:제?\d+대\s*)?(.*?(?:국무총리|장관))/);
    if (m) {
      // "제49대 국무총리" → "국무총리", "○○부 장관" → 그대로
      const pos = m[1].replace(/^제?\d+대\s*/, '').trim();
      if (pos && !pos.includes('국회의원')) return pos;
    }
  }
  return null;
}
