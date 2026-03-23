// ═══════════════════════════════════════════════════
//  isValidEmail 단위 테스트 (SEC-03 이메일 인증)
// ═══════════════════════════════════════════════════
import { describe, it, expect } from 'vitest'
import { isValidEmail } from '../emailUtils'

describe('isValidEmail', () => {
  // ── 유효한 이메일 ──────────────────────────────
  it('일반적인 이메일 → true', () => {
    expect(isValidEmail('parent@gmail.com')).toBe(true)
  })

  it('서브도메인 포함 → true', () => {
    expect(isValidEmail('user@mail.company.co.kr')).toBe(true)
  })

  it('플러스 태그 포함 → true', () => {
    expect(isValidEmail('user+tag@example.com')).toBe(true)
  })

  // ── 유효하지 않은 이메일 ───────────────────────
  it('빈 문자열 → false', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('@ 없음 → false', () => {
    expect(isValidEmail('notanemail')).toBe(false)
  })

  it('도메인 없음 → false', () => {
    expect(isValidEmail('user@')).toBe(false)
  })

  it('로컬 파트 없음 → false', () => {
    expect(isValidEmail('@example.com')).toBe(false)
  })

  it('공백 포함 → false', () => {
    expect(isValidEmail('user @example.com')).toBe(false)
  })

  it('TLD 없음 → false', () => {
    expect(isValidEmail('user@example')).toBe(false)
  })
})
