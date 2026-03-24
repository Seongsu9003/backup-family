// ═══════════════════════════════════════════════════
//  날짜 관련 순수 유틸 (공통)
//  2개 이상의 feature에서 사용 → shared/lib 배치 (FSD 원칙)
// ═══════════════════════════════════════════════════

/** 인증 유효 기간 (개월). 변경 시 이 값만 수정하면 됩니다. */
export const CERT_VALIDITY_MONTHS = 3

/**
 * 인증 만료일을 ISO 문자열로 반환합니다.
 * @param from 기준 날짜 (기본값: 현재 시각)
 */
export function calcCertExpiry(from: Date = new Date()): string {
  const expiry = new Date(from)
  expiry.setMonth(expiry.getMonth() + CERT_VALIDITY_MONTHS)
  return expiry.toISOString()
}

/**
 * ISO 날짜 문자열이 현재 시각 기준으로 만료되었는지 반환합니다.
 * 정확히 현재 시각인 경우도 만료로 간주합니다.
 */
export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) <= new Date()
}

/**
 * ISO 날짜 문자열이 현재 기준 7일 이내 만료 예정인지 반환합니다.
 * 이미 만료된 경우에는 false를 반환합니다.
 */
export function isExpiringSoon(expiresAt: string): boolean {
  const diff = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 7
}

/**
 * ISO 날짜 문자열을 한국어 날짜 형식으로 반환합니다.
 * 값이 없으면 '-'를 반환합니다.
 */
export function fmtDate(iso?: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}
