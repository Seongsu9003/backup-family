// ═══════════════════════════════════════════════════
//  일괄 인증 처리 훅 (OPS)
//  선택된 TestResult[] 를 한 번에 '인증완료' 처리합니다.
//  각 row의 raw_data가 독립적이므로 Promise.all로 병렬 처리합니다.
// ═══════════════════════════════════════════════════
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { calcCertExpiry } from '@/shared/lib/dateUtils'
import type { TestResult } from '@/shared/types'
import { ADMIN_QUERY_KEY } from './useAdminResults'

const TARGET_STATUS = '인증완료'

interface BulkResult {
  succeeded: number
  failed:    number
}

export function useBulkSetStatus() {
  const queryClient = useQueryClient()

  return useMutation<BulkResult, Error, TestResult[]>({
    mutationFn: async (results: TestResult[]): Promise<BulkResult> => {
      const now       = new Date().toISOString()
      const certExpiry = calcCertExpiry()

      const tasks = results.map(async (result) => {
        const updated: TestResult = {
          ...result,
          meta: {
            ...result.meta,
            expires_at: certExpiry,
          },
          certification: {
            ...result.certification,
            status:       TARGET_STATUS,
            certified_at: now,
          },
        }

        const { error } = await supabase
          .from('test_results')
          .update({
            cert_status: TARGET_STATUS,
            cert_issued: now,
            cert_expiry: certExpiry,
            raw_data:    updated,
          })
          .eq('test_id', result.meta.test_id)

        if (error) throw new Error(error.message)
      })

      // 병렬 실행 후 성공/실패 집계
      const settled = await Promise.allSettled(tasks)
      const succeeded = settled.filter((r) => r.status === 'fulfilled').length
      const failed    = settled.filter((r) => r.status === 'rejected').length

      return { succeeded, failed }
    },

    onSuccess: () => {
      // 전체 리스트 캐시 무효화 → 자동 재조회
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEY })
    },
  })
}
