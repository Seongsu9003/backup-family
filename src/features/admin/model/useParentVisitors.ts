// 보호자 조회 신청 내역 — TanStack Query 훅
import { useQuery } from '@tanstack/react-query'

export interface ParentVisitor {
  id: string
  email: string
  created_at: string
}

async function fetchVisitors(): Promise<ParentVisitor[]> {
  const res = await fetch('/api/admin/visitors')
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: '알 수 없는 오류' }))
    throw new Error(error ?? '보호자 내역을 불러올 수 없습니다.')
  }
  const { visitors } = await res.json()
  return visitors
}

export function useParentVisitors() {
  return useQuery<ParentVisitor[]>({
    queryKey: ['admin', 'parent-visitors'],
    queryFn: fetchVisitors,
    staleTime: 1000 * 60 * 5, // 5분 캐시
  })
}
