// ═══════════════════════════════════════════════════
//  단건 인증 상태 업데이트 훅
//  ✅ API Route (/api/admin/results/status) 경유 → service_role
//  🔒 anon 키 직접 호출 제거 (보안 강화)
// ═══════════════════════════════════════════════════
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
      const res = await fetch('/api/admin/results/status', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ result, status, memo }),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: '알 수 없는 오류' }))
        throw new Error(error ?? `HTTP ${res.status}`)
      }
      return res.json() as Promise<{ name: string; status: string }>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEY })
    },
  })
}
