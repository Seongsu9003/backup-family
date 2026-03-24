import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { calcCertExpiry } from '@/shared/lib/dateUtils'
import type { TestResult } from '@/shared/types'
import { ADMIN_QUERY_KEY } from './useAdminResults'

interface SetStatusInput {
  result: TestResult
  status: string
  memo: string
}

export function useSetStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ result, status, memo }: SetStatusInput) => {
      const isCertified = status === '인증완료'
      const certifiedAt = isCertified ? new Date().toISOString() : null
      const certExpiry  = isCertified ? calcCertExpiry() : null

      // raw_data도 최신 상태로 동기화 (meta.expires_at 포함)
      const updated: TestResult = {
        ...result,
        meta: {
          ...result.meta,
          ...(isCertified ? { expires_at: certExpiry! } : {}),
        },
        certification: {
          ...result.certification,
          status:       status as TestResult['certification']['status'],
          admin_memo:   memo,
          certified_at: certifiedAt,
        },
      }

      const { error } = await supabase
        .from('test_results')
        .update({
          cert_status : status,
          admin_memo  : memo,
          cert_issued : certifiedAt,
          cert_expiry : certExpiry,
          raw_data    : updated,
        })
        .eq('test_id', result.meta.test_id)

      if (error) throw new Error(error.message)
      return { name: result.tester?.name || '', status }
    },
    onSuccess: () => {
      // 성공 시 캐시 무효화 → 자동 재조회
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEY })
    },
  })
}
