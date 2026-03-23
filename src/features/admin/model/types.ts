import type { TestResult } from '@/shared/types'
import { isExpired as _isExpired, isExpiringSoon as _isExpiringSoon, fmtDate } from '@/shared/lib/dateUtils'

export type TabKey =
  | 'all'
  | 'pending'
  | 'certified'
  | 'uncertified'
  | 'rejected'
  | 'job_pool'
  | 'expiring'

export const TAB_LABELS: Record<TabKey, string> = {
  all:         '전체 신청자',
  pending:     '검토 대기',
  certified:   '인증 완료',
  uncertified: '미인증',
  rejected:    '반려',
  job_pool:    '구직 Pool',
  expiring:    '만료 임박',
}

// shared/lib/dateUtils의 순수 함수를 TestResult 기반 인터페이스로 래핑
export function isExpiringSoon(r: TestResult): boolean {
  return _isExpiringSoon(r.meta.expires_at)
}

export function isExpired(r: TestResult): boolean {
  return _isExpired(r.meta.expires_at)
}

// fmtDate는 shared에서 그대로 re-export
export { fmtDate }

export function getTabResults(results: TestResult[], tab: TabKey): TestResult[] {
  switch (tab) {
    case 'pending':     return results.filter(r => r.certification.status === '검토중')
    case 'certified':   return results.filter(r => r.certification.status === '인증완료')
    case 'uncertified': return results.filter(r => r.certification.status === '미인증')
    case 'rejected':    return results.filter(r => r.certification.status === '반려')
    case 'job_pool':    return results.filter(r => r.job_seeking !== '구직 의사 없음')
    case 'expiring':    return results.filter(r => isExpiringSoon(r))
    default:            return results
  }
}
