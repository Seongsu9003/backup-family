// ═══════════════════════════════════════════════════
//  파트너 유입 쿠키 유틸 (BIZ)
//  ?partner=BUF00001 → 30일 쿠키로 보존 → 결과 저장 시 함께 기록
// ═══════════════════════════════════════════════════

const COOKIE_NAME = 'buf_partner'
const MAX_AGE     = 60 * 60 * 24 * 30  // 30일 (초)

/** 파트너 코드를 30일 쿠키로 저장합니다 (클라이언트 전용) */
export function setPartnerCookie(code: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(code)}; max-age=${MAX_AGE}; path=/; SameSite=Lax`
}

/** 저장된 파트너 코드를 읽습니다. 없으면 null 반환 */
export function getPartnerCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`))
  if (!match) return null
  return decodeURIComponent(match.split('=')[1])
}
