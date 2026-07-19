/**
 * 로그인 후 복귀 경로(returnTo/next)의 open-redirect 방어.
 *
 * 허용: 같은 origin의 단일 슬래시로 시작하는 절대 경로(예: "/bills/PRC_...").
 * 차단: "//host", "/\host", "http://...", "javascript:...", 공백/제어문자, 빈 값.
 */
export function isSafeInternalPath(path: string | null | undefined): path is string {
  if (!path || typeof path !== "string") return false;
  // 반드시 "/"로 시작하되, 두 번째 문자가 "/" 또는 "\"이면 프로토콜-상대·백슬래시 우회 → 차단
  if (path[0] !== "/") return false;
  if (path[1] === "/" || path[1] === "\\") return false;
  // 제어문자·공백(백슬래시 인코딩 우회 등) 포함 시 차단
  if (/[\x00-\x1f\x7f\s]/.test(path)) return false;
  return true;
}
