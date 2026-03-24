// ═══════════════════════════════════════════════════
//  파트너 관리 훅 (BIZ)
//  usePartners    — 전체 파트너 목록 조회
//  useCreatePartner — 신규 파트너 코드 생성
// ═══════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { Partner } from '@/shared/types'

export const PARTNERS_QUERY_KEY = ['admin', 'partners']

/** BUF + 5자리 순번 코드 생성 */
function buildCode(seq: number): string {
  return `BUF${String(seq).padStart(5, '0')}`
}

// ── 파트너 목록 조회 ─────────────────────────────
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

// ── 파트너별 신청자 수 조회 ─────────────────────
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

// ── 파트너 생성 ──────────────────────────────────
interface CreatePartnerInput {
  name:     string
  type:     Partner['type']
  memo:     string
  // 사업자 정보는 UI에서 입력받지 않고 DB에만 보관 (Supabase에서 직접 관리)
  biz_no?:  string
  phone?:   string
  website?: string
  address?: string
}

export function useCreatePartner() {
  const queryClient = useQueryClient()

  return useMutation<Partner, Error, CreatePartnerInput>({
    mutationFn: async ({ name, type, memo, biz_no = '', phone = '', website = '', address = '' }) => {
      // 현재 최대 seq 조회 → nextSeq 계산
      const { data: maxRow, error: seqErr } = await supabase
        .from('partners')
        .select('seq')
        .order('seq', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (seqErr) throw new Error(seqErr.message)

      const nextSeq = ((maxRow?.seq as number | null) ?? 0) + 1
      const code    = buildCode(nextSeq)

      const { data, error } = await supabase
        .from('partners')
        .insert({ seq: nextSeq, code, name, biz_no, phone, website, address, type, memo })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data as Partner
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTNERS_QUERY_KEY })
    },
  })
}

// ── 파트너 활성/비활성 토글 ──────────────────────
export function useTogglePartnerActive() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string; is_active: boolean }>({
    mutationFn: async ({ id, is_active }) => {
      const { error } = await supabase
        .from('partners')
        .update({ is_active })
        .eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTNERS_QUERY_KEY })
    },
  })
}
