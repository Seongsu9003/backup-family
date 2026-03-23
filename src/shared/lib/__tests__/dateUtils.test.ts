// ═══════════════════════════════════════════════════
//  dateUtils 단위 테스트
// ═══════════════════════════════════════════════════
import { describe, it, expect, vi, afterEach } from 'vitest'
import { isExpired, isExpiringSoon } from '../dateUtils'

// 현재 시각을 고정하여 테스트 결정성 확보
const NOW = new Date('2026-03-23T12:00:00Z')

afterEach(() => vi.useRealTimers())

// ────────────────────────────────────────────────────
// isExpired
// ────────────────────────────────────────────────────
describe('isExpired', () => {
  it('만료일이 현재보다 과거 → true', () => {
    vi.setSystemTime(NOW)
    expect(isExpired('2026-03-22T00:00:00Z')).toBe(true)
  })

  it('만료일이 현재보다 미래 → false', () => {
    vi.setSystemTime(NOW)
    expect(isExpired('2026-03-24T00:00:00Z')).toBe(false)
  })

  it('만료일이 정확히 현재 → true (만료로 간주)', () => {
    vi.setSystemTime(NOW)
    expect(isExpired(NOW.toISOString())).toBe(true)
  })
})

// ────────────────────────────────────────────────────
// isExpiringSoon (7일 이내 만료)
// ────────────────────────────────────────────────────
describe('isExpiringSoon', () => {
  it('3일 후 만료 → true', () => {
    vi.setSystemTime(NOW)
    const threeDaysLater = new Date(NOW.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
    expect(isExpiringSoon(threeDaysLater)).toBe(true)
  })

  it('7일 후 만료 → true (경계값)', () => {
    vi.setSystemTime(NOW)
    const sevenDaysLater = new Date(NOW.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    expect(isExpiringSoon(sevenDaysLater)).toBe(true)
  })

  it('8일 후 만료 → false', () => {
    vi.setSystemTime(NOW)
    const eightDaysLater = new Date(NOW.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString()
    expect(isExpiringSoon(eightDaysLater)).toBe(false)
  })

  it('이미 만료됨 → false (만료 임박 아님)', () => {
    vi.setSystemTime(NOW)
    expect(isExpiringSoon('2026-03-20T00:00:00Z')).toBe(false)
  })
})
