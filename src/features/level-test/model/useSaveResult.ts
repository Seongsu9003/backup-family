'use client'

// ═══════════════════════════════════════════════════
//  결과 저장 훅 (Supabase upsert)
//  buildResult 로직은 buildResult.ts 로 분리 (순수 함수 · 테스트 가능)
// ═══════════════════════════════════════════════════
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import { buildResult } from './buildResult'
import type { SavePayload } from './buildResult'

export type { SavePayload }

function toDbRow(result: ReturnType<typeof buildResult>) {
  return {
    test_id: result.meta.test_id,
    name: result.tester.name,
    phone: result.tester.contact,
    score_total: result.score.total,
    score_survey: result.score.survey,
    score_scenario: result.score.scenario,
    level: result.level,
    care_type: result.care_type || null,
    cert_status: result.certification.status,
    cert_issued: result.certification.certified_at || null,
    cert_expiry: result.meta.expires_at,
    job_seeking: result.job_seeking,
    preferred_region: Array.isArray(result.tester.preferred_region)
      ? result.tester.preferred_region.join(',')
      : (result.tester.preferred_region || ''),
    admin_memo: result.certification.admin_memo || '',
    attachment: (result.certification.docs_attached || []).join(';'),
    raw_answers: result.question_log || [],
    raw_data: result,
  }
}

export function useSaveResult() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SavePayload) => {
      const result = buildResult(payload)
      const { error } = await supabase
        .from('test_results')
        .upsert(toDbRow(result), { onConflict: 'test_id' })
      if (error) throw error

      // 텔레그램 알림 발송 (실패해도 저장 흐름에 영향 없음)
      fetch('/api/notify/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: result.meta.test_id,
          name: result.tester.name,
          level: result.level.label,
          careType: result.care_type?.label ?? null,
          certStatus: result.certification.status,
          score: result.score.total,
          preferredRegion: Array.isArray(result.tester.preferred_region)
            ? result.tester.preferred_region
            : [],
          jobSeeking: result.job_seeking,
        }),
      }).catch((err) => console.warn('[useSaveResult] 알림 전송 오류:', err))

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testResults'] })
    },
  })
}
