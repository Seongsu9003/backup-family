// ═══════════════════════════════════════════════════
//  어드민 장소 관리 훅 (SEC-05 — API Route 기반)
//
//  모든 쓰기 작업은 /api/admin/places 로 전달됩니다.
//  서버에서 buf_admin_session 쿠키를 검증하고
//  service_role 키로 RLS를 우회합니다.
// ═══════════════════════════════════════════════════
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Place, PlaceInput } from '@/shared/types'

const API = '/api/admin/places'
const QUERY_KEY = ['places', 'admin'] as const

// ── 공통 fetch 헬퍼 ───────────────────────────────
async function apiFetch<T>(
  method: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(API, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
  return json as T
}

// ── 전체 조회 (관리자용 — 비활성 포함) ──────────────
export function usePlacesAll() {
  return useQuery<Place[]>({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch<Place[]>('GET'),
  })
}

// ── 단건 등록 ─────────────────────────────────────
export function useCreatePlace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PlaceInput) =>
      apiFetch<{ count: number }>('POST', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

// ── CSV 대량 등록 ─────────────────────────────────
export function useBulkCreatePlaces() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (inputs: PlaceInput[]) => {
      const { count } = await apiFetch<{ count: number }>('POST', inputs)
      return count
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

// ── 활성/비활성 토글 ──────────────────────────────
export function useTogglePlaceActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      apiFetch<{ ok: boolean }>('PATCH', { id, is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

// ── 삭제 ──────────────────────────────────────────
export function useDeletePlace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ ok: boolean }>('DELETE', { id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
