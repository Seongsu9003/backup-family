import { useCallback, useEffect, useState } from 'react'

// ── 접수 이력 관리 (localStorage 기반) ───────────────
//  보호자가 연결 요청한 돌봄이 목록을 기기에 저장합니다.
//  { [testId]: ISO date string }

const STORAGE_KEY = 'buf_inquiry_store'

type InquiryStore = Record<string, string>

function loadStore(): InquiryStore {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

/** MM월 DD일 형식으로 날짜 포맷 */
export function formatInquiryDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export function useInquiryStore() {
  const [store, setStore] = useState<InquiryStore>({})

  // SSR 하이드레이션 안전 처리
  useEffect(() => {
    setStore(loadStore())
  }, [])

  /** 접수 완료 기록 저장 */
  const addInquiry = useCallback((testId: string) => {
    const updated = { ...loadStore(), [testId]: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setStore(updated)
  }, [])

  /** 접수 날짜 조회 — 미접수 시 null */
  const getInquiryDate = useCallback(
    (testId: string): string | null => store[testId] ?? null,
    [store],
  )

  return { addInquiry, getInquiryDate }
}
