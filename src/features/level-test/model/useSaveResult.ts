'use client'

// ═══════════════════════════════════════════════════
//  결과 저장 훅 (Supabase upsert)
// ═══════════════════════════════════════════════════
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/shared/lib/supabase'
import type { QuizState } from './types'
import type { Question } from './constants'

interface SavePayload {
  quizState: QuizState
  questions: Question[]
  name: string
  contact: string
  jobSeeking: string
  selectedRegions: string[]
}

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

function buildResult(payload: SavePayload) {
  const { quizState, questions, name, contact, jobSeeking, selectedRegions } = payload
  const attachedDocs = Object.values(quizState.certDocs).filter(Boolean) as string[]
  const certStatus = attachedDocs.length > 0 ? '검토중' : '미인증'

  const now = new Date()
  const expires = new Date(now)
  expires.setMonth(expires.getMonth() + 1)

  return {
    meta: {
      test_id: quizState.testId!,
      created_at: now.toISOString(),
      expires_at: expires.toISOString(),
      version: '1.3',
    },
    tester: {
      name,
      contact,
      preferred_region: selectedRegions.length > 0 ? selectedRegions : [],
    },
    score: {
      total: quizState.totalScore,
      survey: quizState.surveyNorm,
      scenario: quizState.scenarioNorm,
      max: 100,
    },
    level: {
      num: quizState.level!.num,
      label: `${quizState.level!.label} ${quizState.level!.title}`,
    },
    care_type: quizState.careType
      ? {
          code: quizState.careType.code,
          label: quizState.careType.label,
          fullLabel: quizState.careType.fullLabel,
          color: quizState.careType.color,
        }
      : null,
    job_seeking: jobSeeking,
    certification: {
      status: certStatus,
      docs_attached: attachedDocs,
      admin_memo: '',
      certified_at: null,
    },
    scenario_ids: questions.filter((q) => q.type === 'scenario').map((q) => q.id),
    question_log: questions.map((q, i) => ({
      q_id: q.id,
      type: q.type,
      category: q.category,
      chosen_idx: quizState.answers[i],
      correct_idx: q.correctIdx !== undefined ? q.correctIdx : null,
      score: q.options[quizState.answers[i] as number]?.score ?? 0,
      max_score: q.maxScore,
    })),
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
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testResults'] })
    },
  })
}
