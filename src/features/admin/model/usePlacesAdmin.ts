// ═══════════════════════════════════════════════════
//  어드민 장소 관리 훅
//  - usePlacesAll: 전체 목록 (비활성 포함)
//  - useCreatePlace: 단건 등록
//  - useBulkCreatePlaces: CSV 대량 등록
//  - useTogglePlaceActive: 활성/비활성 토글
//  - useDeletePlace: 삭제
// ═══════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { Place, PlaceInput } from '@/shared/types'

const QUERY_KEY = ['places', 'admin'] as const

// ── 전체 조회 (관리자용 — 비활성 포함) ──────────────
export function usePlacesAll() {
  return useQuery<Place[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return (data ?? []) as Place[]
    },
  })
}

// ── 단건 등록 ─────────────────────────────────────
export function useCreatePlace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: PlaceInput) => {
      const { error } = await supabase.from('places').insert(input)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

// ── CSV 대량 등록 ─────────────────────────────────
export function useBulkCreatePlaces() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (inputs: PlaceInput[]) => {
      const { error } = await supabase.from('places').insert(inputs)
      if (error) throw new Error(error.message)
      return inputs.length
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

// ── 활성/비활성 토글 ──────────────────────────────
export function useTogglePlaceActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('places')
        .update({ is_active })
        .eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

// ── 삭제 ──────────────────────────────────────────
export function useDeletePlace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('places').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
