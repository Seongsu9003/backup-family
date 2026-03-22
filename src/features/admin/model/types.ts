import type { TestResult } from '@/shared/types'

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

export function isExpiringSoon(r: TestResult): boolean {
  const diff = (new Date(r.meta.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 7
}

export function isExpired(r: TestResult): boolean {
  return new Date(r.meta.expires_at) < new Date()
}

export function fmtDate(iso?: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

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
