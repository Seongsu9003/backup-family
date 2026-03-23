// ═══════════════════════════════════════════════════
//  isValidAccessCode 단위 테스트 (SEC-03)
//  서버 환경변수와 입력값 대조 로직 검증
// ═══════════════════════════════════════════════════
import { describe, it, expect } from 'vitest'
import { isValidAccessCode } from '../accessCode'

describe('isValidAccessCode', () => {
  it('올바른 코드 → true', () => {
    expect(isValidAccessCode('BUF-2026', 'BUF-2026')).toBe(true)
  })

  it('틀린 코드 → false', () => {
    expect(isValidAccessCode('wrong', 'BUF-2026')).toBe(false)
  })

  it('빈 문자열 입력 → false', () => {
    expect(isValidAccessCode('', 'BUF-2026')).toBe(false)
  })

  it('secret 미설정(undefined) → false (잠금 유지)', () => {
    expect(isValidAccessCode('BUF-2026', undefined)).toBe(false)
  })

  it('앞뒤 공백 포함 입력 → false (trim 없이 정확히 일치해야 함)', () => {
    expect(isValidAccessCode(' BUF-2026 ', 'BUF-2026')).toBe(false)
  })

  it('대소문자 차이 → false (case sensitive)', () => {
    expect(isValidAccessCode('buf-2026', 'BUF-2026')).toBe(false)
  })
})
