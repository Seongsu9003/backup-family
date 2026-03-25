// ═══════════════════════════════════════════════════
//  파트너 관리 훅 (BIZ)
//  usePartners         — 전체 파트너 목록 조회 (anon 키, read-only)
//  usePartnerStats     — 파트너별 신청자 수 조회 (anon 키, read-only)
//  useCreatePartner    — 신규 파트너 생성 ✅ API Route 경유
//  useTogglePartnerActive — 활성/비활성 토글 ✅ API Route 경유
//  🔒 쓰기 작업에서 anon 키 직접 호출 제거 (보안 강화)
// ═══════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { Partner } from '@/shared/types'

export const PARTNERS_QUERY_KEY = ['admin', 'partners']

// ── 파트너 목록 조회 (read-only, anon 키) ────────
export function usePartners() {
  return useQuery<Partner[]>({
    queryKey: PARTNERS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('seq', { ascending: true })
      if (error) throw new Error(error.message)
      return (data ?? []) as Partner[]
    },
  })
}

// ── 파트너별 신청자 수 조회 (read-only, anon 키) ─
export function usePartnerStats() {
  return useQuery<Record<string, number>>({
    queryKey: [...PARTNERS_QUERY_KEY, 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select('partner_code')
        .not('partner_code', 'is', null)
      if (error) throw new Error(error.message)

      const counts: Record<string, number> = {}
      for (const row of data ?? []) {
        const code = row.partner_code as string
        counts[code] = (counts[code] ?? 0) + 1
      }
      return counts
    },
  })
}

// ── 파트너 생성 (API Route 경유) ──────────────────
interface CreatePartnerInput {
  name:     string
  type:     Partner['type']
  memo:     string
  biz_no?:  string
  phone?:   string
  website?: string
  address?: string
}

export function useCreatePartner() {
  const queryClient = useQueryClient()

  return useMutation<Partner, Error, CreatePartnerInput>({
    mutationFn: async (input) => {
      const res = await fetch('/api/admin/partners', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(input),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: '알 수 없는 오류' }))
        throw new Error(error ?? `HTTP ${res.status}`)
      }
      return res.json() as Promise<Partner>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTNERS_QUERY_KEY })
    },
  })
}

// ── 파트너 활성/비활성 토글 (API Route 경유) ──────
export function useTogglePartnerActive() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string; is_active: boolean }>({
    mutationFn: async ({ id, is_active }) => {
      const res = await fetch('/api/admin/partners', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, is_active }),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: '알 수 없는 오류' }))
        throw new Error(error ?? `HTTP ${res.status}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTNERS_QUERY_KEY })
    },
  })
}
