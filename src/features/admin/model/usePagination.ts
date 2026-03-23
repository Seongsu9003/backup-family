// ═══════════════════════════════════════════════════
//  페이지네이션 유틸 훅 (PERF)
//  items 배열과 pageSize를 받아 현재 페이지 슬라이스와
//  네비게이션 헬퍼를 반환합니다.
// ═══════════════════════════════════════════════════
import { useState, useCallback, useEffect } from 'react'

export const PAGE_SIZE = 20

interface UsePaginationResult<T> {
  page:       number
  totalPages: number
  pageItems:  T[]
  setPage:    (p: number) => void
  reset:      () => void
}

export function usePagination<T>(
  items:    T[],
  pageSize: number = PAGE_SIZE,
): UsePaginationResult<T> {
  const [page, setPageState] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  // items 변경(탭/필터 전환) 시 1페이지로 복귀
  useEffect(() => {
    setPageState(1)
  }, [items.length])

  const setPage = useCallback((p: number) => {
    setPageState(Math.min(Math.max(1, p), Math.max(1, Math.ceil(items.length / pageSize))))
  }, [items.length, pageSize])

  const reset = useCallback(() => setPageState(1), [])

  const start     = (page - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  return { page, totalPages, pageItems, setPage, reset }
}
