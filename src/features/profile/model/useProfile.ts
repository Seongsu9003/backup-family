// ═══════════════════════════════════════════════════
//  공개 프로필 조회 훅 — testId로 test_results 조회
// ═══════════════════════════════════════════════════
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { TestResult } from '@/shared/types'

async function fetchProfile(testId: string): Promise<TestResult | null> {
  const { data, error } = await supabase
    .from('test_results')
    .select('raw_data')
    .eq('test_id', testId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return data.raw_data as TestResult
}

export function useProfile(testId: string) {
  return useQuery({
    queryKey: ['profile', testId],
    queryFn: () => fetchProfile(testId),
    enabled: !!testId,
    staleTime: 60_000,
  })
}
