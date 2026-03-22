import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { TestResult } from '@/shared/types'

export const ADMIN_QUERY_KEY = ['admin', 'results']

export function useAdminResults() {
  return useQuery<TestResult[]>({
    queryKey: ADMIN_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select('raw_data')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)

      return (data ?? [])
        .map((row: { raw_data: TestResult }) => row.raw_data)
        .filter(Boolean)
    },
    staleTime: 0, // 관리자 페이지는 항상 최신 데이터
  })
}
