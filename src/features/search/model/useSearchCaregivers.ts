import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { TestResult } from '@/shared/types'
import { anonymize, type AnonymizedCaregiver } from './types'

/** 구직 관심 있는 돌봄이 전체 조회 (적극 구직 + 탐색 중 모두 포함)
 *  '구직 의사 없음'은 DB 레벨에서 제외 → 클라이언트에서 활성 구직 중 토글로 추가 필터링
 */
export function useSearchCaregivers() {
  return useQuery<AnonymizedCaregiver[]>({
    queryKey: ['caregivers', 'interested'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select('raw_data')
        .neq('job_seeking', '구직 의사 없음')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)

      return (data ?? [])
        .map((row: { raw_data: TestResult }) => row.raw_data)
        .filter(Boolean)
        .map(anonymize)
    },
    staleTime: 1000 * 60 * 5, // 5분 캐시
  })
}
