// ═══════════════════════════════════════════════════
//  액세스 코드 검증 순수 함수 (SEC-03)
//  서버 환경변수와 입력값을 대조합니다.
//  클라이언트에서 직접 호출하지 않습니다 — API Route 전용.
// ═══════════════════════════════════════════════════

/**
 * 입력된 액세스 코드가 서버 비밀 코드와 일치하는지 검증합니다.
 * - 빈 문자열 입력 → false
 * - secret 미설정(undefined) → false (환경변수 없으면 무조건 잠금)
 * - 대소문자·공백 구분 (정확히 일치해야 함)
 */
export function isValidAccessCode(
  input:  string,
  secret: string | undefined,
): boolean {
  if (!input || !secret) return false
  return input === secret
}
