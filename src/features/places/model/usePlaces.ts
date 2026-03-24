// ═══════════════════════════════════════════════════
//  공개 장소 조회 훅
//  is_active = true 인 장소만 반환합니다.
// ═══════════════════════════════════════════════════
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { Place } from '@/shared/types'

export const PLACES_QUERY_KEY = ['places'] as const

export function usePlaces() {
  return useQuery<Place[]>({
    queryKey: PLACES_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return (data ?? []) as Place[]
    },
    staleTime: 1000 * 60 * 5, // 5분 캐시
  })
}
