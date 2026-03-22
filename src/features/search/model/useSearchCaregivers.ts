import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { TestResult } from '@/shared/types'
import { anonymize, type AnonymizedCaregiver } from './types'

export function useSearchCaregivers() {
  return useQuery<AnonymizedCaregiver[]>({
    queryKey: ['caregivers', 'job-seeking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select('raw_data')
        .eq('job_seeking', '적극적으로 구직 중')
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
