import type { TestResult } from '@/shared/types'

export interface AnonymizedCaregiver {
  _internalRef: string     // 내부 참조용 (화면 미노출)
  maskedName: string       // 성OO
  avatarLetter: string
  level: TestResult['level']
  careType: TestResult['care_type']
  certStatus: string
  regions: string[]
  score: number
}

export const TYPE_COLORS: Record<string, string> = {
  ACT: '#D85A3A',
  CAL: '#3A9E94',
  EDU: '#4A9FCC',
  CRE: '#8B4EAB',
}

export const LV_COLORS = ['', '#909090', '#4A9FCC', '#3A9E94', '#D85A3A', '#8B4EAB']

export function anonymize(r: TestResult): AnonymizedCaregiver {
  const name = r.tester?.name || '응시자'
  return {
    _internalRef: (r.meta?.test_id || '').slice(-6),
    maskedName:   name.length > 0 ? name[0] + 'OO' : '돌봄이',
    avatarLetter: name[0] || '돌',
    level:        r.level,
    careType:     r.care_type || null,
    certStatus:   r.certification?.status || '미인증',
    regions:      r.tester?.preferred_region || [],
    score:        r.score?.total || 0,
  }
}

export function scoreRange(score: number): string {
  if (score >= 90) return '최상위 (90점 이상)'
  if (score >= 80) return '상위 (80점대)'
  if (score >= 70) return '중상위 (70점대)'
  if (score >= 60) return '중위 (60점대)'
  if (score >= 50) return '중하위 (50점대)'
  return '하위 (50점 미만)'
}
