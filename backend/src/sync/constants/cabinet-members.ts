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
 * ── 데이터 구조 ──
 * CABINET_TENURES: 의원코드(MONA_CD) → 국무위원 재임 이력 배열.
 *   각 원소 { position, startDate, endDate }. endDate=null이면 "현재 겸직 중",
 *   endDate가 있으면 "종료된 과거 이력"(예: 김민석 국무총리 후 평의원 복귀).
 * 겸직에서 물러나도 항목을 지우지 말고 endDate만 채운다(이력 보존).
 * member sync가 이를 DB의 cabinetPosition(현재)+cabinetHistory(과거)로 투영한다.
 *
 * 최종 확인: 2026-07-19 (이재명 정부, 위키백과 국무위원 명단 × DB 22대 의원 교차 검증)
 */
export interface CabinetTenure {
  position: string;
  startDate: string; // YYYY-MM-DD (취임일)
  endDate: string | null; // 이임일. null이면 현재 재임 중
}

export const CABINET_TENURES: Record<string, CabinetTenure[]> = {
  // ── 현재 겸직 중(endDate=null) ──
  V429892C: [{ position: '법무부 장관', startDate: '2025-07-18', endDate: null }], // 정성호
  M0A1658U: [{ position: '행정안전부 장관', startDate: '2025-07-19', endDate: null }], // 윤호중
  TST4507I: [{ position: '국방부 장관', startDate: '2025-07-25', endDate: null }], // 안규백
  ARP89147: [{ position: '통일부 장관', startDate: '2025-07-25', endDate: null }], // 정동영
  XSP20229: [{ position: '기후에너지환경부 장관', startDate: '2025-10-01', endDate: null }], // 김성환
  JZY9937U: [{ position: '국토교통부 장관', startDate: '2025-07-31', endDate: null }], // 김윤덕
  S824682L: [{ position: '기획예산처 장관', startDate: '2026-03-25', endDate: null }], // 박홍근
  // ── 종료된 과거 이력(endDate 있음) ──
  MLH1404S: [{ position: '국무총리', startDate: '2025-07-04', endDate: '2026-06-30' }], // 김민석(제49대 국무총리 후 평의원 복귀)
};

/** 현재 겸직(endDate=null) 직책만 매핑. 기존 코드 하위호환 + 랭킹 제외 판정에 사용. */
export const CABINET_MEMBERS: Record<string, string> = Object.fromEntries(
  Object.entries(CABINET_TENURES)
    .map(([id, tenures]) => [id, tenures.find((t) => t.endDate === null)?.position])
    .filter(([, pos]) => pos != null) as [string, string][],
);

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
