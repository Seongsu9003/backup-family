// ═══════════════════════════════════════════════════
//  이메일 유효성 검증 순수 함수 (SEC-03)
// ═══════════════════════════════════════════════════

// RFC 5322 간략 패턴: 로컬파트@도메인.TLD
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * 이메일 형식이 유효한지 검증합니다.
 * - 빈 문자열 → false
 * - 공백 포함 → false
 * - @ 또는 TLD 없음 → false
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false
  return EMAIL_REGEX.test(email)
}
