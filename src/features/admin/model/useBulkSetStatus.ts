// ═══════════════════════════════════════════════════
//  일괄 인증 처리 훅 (OPS)
//  ✅ API Route (/api/admin/results/bulk-status) 경유 → service_role
//  🔒 anon 키 직접 호출 제거 (보안 강화)
// ═══════════════════════════════════════════════════
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TestResult } from '@/shared/types'
import { ADMIN_QUERY_KEY } from './useAdminResults'

interface BulkResult {
  succeeded: number
  failed:    number
}

export function useBulkSetStatus() {
  const queryClient = useQueryClient()

  return useMutation<BulkResult, Error, TestResult[]>({
    mutationFn: async (results: TestResult[]): Promise<BulkResult> => {
      const res = await fetch('/api/admin/results/bulk-status', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(results),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: '알 수 없는 오류' }))
        throw new Error(error ?? `HTTP ${res.status}`)
      }
      return res.json() as Promise<BulkResult>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEY })
    },
  })
}
