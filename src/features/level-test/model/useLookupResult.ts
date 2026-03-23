'use client'

// ═══════════════════════════════════════════════════
//  내 결과 조회 훅 (이름 + 연락처 검색)
// ═══════════════════════════════════════════════════
import { useState, useCallback } from 'react'
import { supabase } from '@/shared/lib/supabase'
import type { ExistingResult } from './types'

function normalizeContact(v: string): string {
  return (v || '').replace(/[^0-9]/g, '')
}

interface LookupState {
  isLoading: boolean
  results: ExistingResult[]
  error: string | null
  searched: boolean
}

export function useLookupResult() {
  const [lookupState, setLookupState] = useState<LookupState>({
    isLoading: false,
    results: [],
    error: null,
    searched: false,
  })

  const search = useCallback(async (name: string, contact: string) => {
    if (!name.trim() || !contact.trim()) {
      setLookupState((prev) => ({
        ...prev,
        error: '이름과 휴대폰 번호를 모두 입력해 주세요.',
        searched: true,
      }))
      return
    }

    setLookupState({ isLoading: true, results: [], error: null, searched: false })

    try {
      const normalizedContact = normalizeContact(contact)
      // phone 컬럼을 DB에서 직접 필터 — 클라이언트 전체 스캔 제거 (SEC-02)
      const { data, error } = await supabase
        .from('test_results')
        .select('raw_data')
        .ilike('name', `%${name.trim()}%`)
        .eq('phone', normalizedContact)
        .order('created_at', { ascending: false })

      if (error) throw error

      const found = (data || [])
        .map((row) => row.raw_data as ExistingResult)
        .filter(Boolean)

      setLookupState({ isLoading: false, results: found, error: null, searched: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류'
      setLookupState({ isLoading: false, results: [], error: msg, searched: true })
    }
  }, [])

  const reset = useCallback(() => {
    setLookupState({ isLoading: false, results: [], error: null, searched: false })
  }, [])

  return { lookupState, search, reset }
}
