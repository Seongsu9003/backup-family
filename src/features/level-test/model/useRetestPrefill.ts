'use client'

// ═══════════════════════════════════════════════════
//  재테스트 prefill 훅 (BIZ-02)
//  - retestId가 있으면 이전 결과를 조회
//  - 만료 전이면 기존 프로필로 리다이렉트 (B안 검증)
//  - 만료 후면 이름/연락처/지역을 state에 pre-fill
// ═══════════════════════════════════════════════════
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/shared/lib/supabase'
import { isExpired } from '@/shared/lib/dateUtils'
import type { TestResult } from '@/shared/types'

interface RetestPrefillParams {
  name: string
  contact: string
  jobSeeking: string
  preferredRegion: string[]
  prevLevel: string
}

interface Props {
  retestId: string | undefined
  setRetestPrefill: (params: RetestPrefillParams) => void
}

export function useRetestPrefill({ retestId, setRetestPrefill }: Props) {
  const router = useRouter()

  useEffect(() => {
    if (!retestId) return

    async function run() {
      const { data, error } = await supabase
        .from('test_results')
        .select('raw_data')
        .eq('test_id', retestId)
        .single()

      if (error || !data?.raw_data) {
        // 결과 없음 — 조용히 무시 (일반 테스트로 진행)
        console.warn('[useRetestPrefill] 결과 조회 실패:', error?.message)
        return
      }

      const result = data.raw_data as TestResult

      // B안: 만료 전이면 기존 프로필로 리다이렉트
      if (!isExpired(result.meta.expires_at)) {
        router.replace(`/profile/${retestId}`)
        return
      }

      // 만료 확인 → 이전 정보 pre-fill
      setRetestPrefill({
        name: result.tester?.name ?? '',
        contact: result.tester?.contact ?? '',
        jobSeeking: result.job_seeking ?? '',
        preferredRegion: Array.isArray(result.tester?.preferred_region)
          ? result.tester.preferred_region
          : [],
        prevLevel: result.level?.label ?? '',
      })
    }

    run()
  // setRetestPrefill은 useCallback으로 안정화되어 있어 의존성 배열에서 제외
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retestId])
}
