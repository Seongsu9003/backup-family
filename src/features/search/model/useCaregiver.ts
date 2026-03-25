import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { TestResult } from '@/shared/types'
import { anonymize, type AnonymizedCaregiver } from './types'

/** test_id로 단일 돌봄이 조회 — /search/[id] 상세 페이지용 */
export function useCaregiver(testId: string) {
  return useQuery<AnonymizedCaregiver | null>({
    queryKey: ['caregiver', testId],
    enabled: !!testId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select('raw_data')
        .eq('raw_data->meta->>test_id', testId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // 행 없음
        throw new Error(error.message)
      }

      const raw = (data as { raw_data: TestResult })?.raw_data
      return raw ? anonymize(raw) : null
    },
    staleTime: 1000 * 60 * 5,
  })
}
